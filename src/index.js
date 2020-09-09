import path from "path";
import fs from "fs/promises";
import { request } from "@uppercod/request";
import postcss from "postcss";
import resolveCss from "resolve-css";
import { isUrl } from "./utils";
import pluginRules from "./plugin-rules";

const cache = {
    request: {},
    process: {},
};

const readFile = (file) => fs.readFile(file, "utf8");

const pluginImport = postcss.plugin("plugin-import", (loaded = {}) => {
    return async (root, result) => {
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
    };
});
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

    if (!local || /node_modules/.test(src)) {
        cache.process[src] = cache.process[src] || useProcess();
        resolve = cache.process[src];
    } else {
        loaded[src] = loaded[src] || useProcess();
        resolve = loaded[src];
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
 * @returns {loadProcess}
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

export default pluginImport;

/**
 * @typedef {Object<string,nodes>} context
 */

/**
 * @typedef {import("postcss").ChildNode[]} nodes
 */

/**
 * @typedef {Promise<{nodes:nodes,context:context}>} loadProcess
 */

/**
 * @typedef {Object<string,loadProcess>} loaded
 */

/**
 * @typedef {Object} options
 * @property {loaded} loaded
 * @property {(file:string)=>Promise<string>} readFile
 */
