import path from "path";
import fs from "fs/promises";
import { request } from "@uppercod/request";
import postcss from "postcss";
import resolveCss from "resolve-css";
import { isUrl } from "./utils";
import { pluginRuleToObject } from "./plugin-rules";

const cache = {
    request: {},
    process: {},
};

const readFile = (file) => fs.readFile(file, "utf8");
/**
 * @param {loaded} loaded
 * @return {import("postcss").Plugin}
 */
const pluginImport = (loaded) => {
    loaded = { imports: {}, process: {}, ...loaded };
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
                    .map((index) => spaces[index] || [])
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

    if (local) {
        [src, css] = await resolveCss(readFile, src, dir);
    } else {
        cache.request[src] = cache.request[src] || request(src);
        [src, css] = await cache.request[src];
    }

    let resolve;

    let useProcess = () => process(src, css, loaded);
    /**
     * Execute a higher scope cache if the resource is static
     * whether it is from node_modules or a url
     */
    if (!local || /node_modules/.test(src)) {
        cache.process[src] = cache.process[src] || useProcess();
        resolve = cache.process[src];
    } else {
        loaded.process[src] = loaded.process[src] || useProcess();
        loaded.imports[src] = true;
        resolve = loaded.process[src];
    }

    const { nodes, context } = await resolve;

    if (space) {
        for (const selector in context) {
            spaces[space + selector] = context[selector];
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
    } = await postcss([
        pluginImport(loaded),
        pluginRuleToObject(context),
    ]).process(css, {
        from: src,
    });

    return { nodes, context };
};

export default pluginImport;

/**
 * @typedef {Object<string,nodes>} context
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
 */

/**
 * @typedef {Object} options
 * @property {loaded} loaded
 * @property {(file:string)=>Promise<string>} readFile
 */
