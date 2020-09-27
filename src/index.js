import path from "path";
import postcss from "postcss";
import { isUrl } from "./utils";
import { pluginRules } from "./plugin/rules";
import { resolve } from "./resolve/resolve";
export * from "./resolve/resolve";
const cache = {};

/**
 * @param {loaded} loaded
 * @return {import("postcss").Plugin}
 */
export const pluginImport = (loaded) => {
    loaded = { imports: {}, process: {}, resolve, ...loaded };

    return {
        postcssPlugin: "@uppercod/postcss-import",
        Root: async (root, { result }) => {
            const file = result.opts.from;

            /**@type {Promise<void>[]} */
            const imports = [];

            /**@type {context} */
            const spaces = {};

            root.walkAtRules("import", (atrule) =>
                imports.push(loadImport(file, loaded, atrule, spaces))
            );

            await Promise.all(imports);

            if (!Object.keys(spaces).length) return;

            root.walkAtRules("extend", (atrule) => {
                const nodes = atrule.params
                    .split(/\s*,\s*/)
                    .map((index) => {
                        // export all space
                        if (spaces[index]) {
                            let nodes = [];
                            for (const space in spaces[index]) {
                                nodes = nodes.concat(spaces[index][space]);
                            }
                            return nodes;
                        }
                        // export query space
                        const testSpace = index.match(/^(\w+)(\.|\[|#)(.+)/);
                        if (testSpace) {
                            const [, space, start, next] = testSpace;
                            return spaces[space][start + next] || [];
                        }
                        // export raw selector space
                        const testRaw = index.match(/^(\w+)"(.+)"$/);
                        if (testRaw) {
                            const [, space, select] = testRaw;
                            return spaces[space][select] || [];
                        }
                        return [];
                    })
                    .flat();

                atrule.replaceWith(nodes.map((decl) => decl.clone()));
            });
        },
    };
};

/**
 *
 * @param {string} file
 * @param {loaded} loaded
 * @param {import("postcss").AtRule} atrule
 * @param {context} spaces
 */
async function loadImport(file, loaded, atrule, spaces) {
    const { dir } = path.parse(file);
    const { params, parent } = atrule;
    /**@type string[] */
    const test = params.match(
        /(?:url\(){0,1}(?:"([^\"]+)"|'([^\']+)')(?:\)){0,1}\s*(.*)/
    );

    if (!test) return;
    const [, src1, src2, media = ""] = test;
    let src = src1 || src2;
    let css;

    const testAs = media.match(/\(\s*as\s*:\s*(\w+)\s*\)/);
    const space = testAs ? testAs[1] : "";
    const local = !isUrl(src);

    const resolveResult = await loaded.resolve(src, dir);

    src = resolveResult.id;
    css = resolveResult.css;

    if (resolveResult.external) {
        /**@todo insert import in header */
        atrule.parent.prepend(atrule);
        //atrule.remove();
        return;
    }

    let resolve;

    let useProcess = () => process(src, css, loaded);
    /**
     * Execute a higher scope cache if the resource is static
     * whether it is from node_modules or a url
     */
    if (resolveResult.cache) {
        cache[src] = cache[src] || useProcess();
        resolve = cache[src];
    } else {
        loaded.process[src] = loaded.process[src] || useProcess();
        loaded.imports[src] = true;
        resolve = loaded.process[src];
    }

    const { nodes, context } = await resolve;

    if (space) {
        for (const selector in context) {
            if (!spaces[space]) spaces[space] = {};
            spaces[space][selector] = context[selector];
        }
    } else {
        const nextNodes = nodes.map((node) => node.clone());

        if (media) {
            parent.insertAfter(
                atrule,
                postcss.atRule({
                    name: "media",
                    params: media,
                    nodes: nextNodes,
                })
            );
        } else {
            parent.insertAfter(atrule, nextNodes);
        }
    }

    atrule.remove();
}
/**
 *
 * @param {string} src
 * @param {string} css
 * @param {loaded} loaded
 * @returns {process}
 */
const process = async (src, css, loaded) => {
    /**
     * @type {context}
     */
    const context = {};
    const {
        root: { nodes },
    } = await postcss([pluginImport(loaded), pluginRules(context)]).process(
        css,
        {
            from: src,
        }
    );

    return { nodes, context };
};

/**
 * @typedef {Object<string,Object<string,nodes>>} context
 */

/**
 * @typedef {import("postcss").ChildNode[]} nodes
 */

/**
 * @typedef {Promise<{nodes:nodes,context:context}>} process
 */

/**
 * @typedef {Object} loaded
 * @property {Object<string,boolean>} imports - It allows to capture the executed local imports
 * @property {Object<string,process>} process - Cache local processes, the process object can be shared between multiple instances
 * @property {import("./resolve/resolve").resolve} resolve - It allows to capture the executed local imports
 */

/**
 * @typedef {Object} options
 * @property {loaded} loaded
 * @property {(file:string)=>Promise<string>} readFile
 */
