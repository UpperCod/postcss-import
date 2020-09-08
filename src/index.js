import path from "path";
import fs from "fs/promises";
import createTree from "@uppercod/imported";
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

const forCache = (src) => isUrl(src) || /node_modules/.test(src);

const pluginImport = postcss.plugin("plugin-import", (tree = createTree()) => {
    return async (root, result) => {
        const file = result.opts.from;
        //@ts-ignore
        result.tree = tree;

        const imports = [];
        const context = {};

        root.walkAtRules("import", (atrule) =>
            imports.push(loadImport(file, tree, atrule, context))
        );

        await Promise.all(imports);

        if (!Object.keys(context).length) return;

        root.walkAtRules("extend", (atrule) => {
            const nodes = atrule.params
                .split(/\s*,\s*/)
                .map((index) => context[index] || [])
                .flat();

            atrule.replaceWith(nodes);
        });
    };
});

async function loadImport(file, tree, atrule, context) {
    const { dir } = path.parse(file);
    const { params, parent } = atrule;
    const test = params.match(
        /(?:url\(){0,1}(?:"([^\"]+)"|'([^\']+)')(?:\)){0,1}\s*(.*)/
    );

    if (!test) return;

    const [, src1, src2, media = ""] = test;

    let src = src1 || src2;
    let css;

    const testAs = media.match(/\(\s*as\s*:\s*(\w+)\s*\)/);

    if (isUrl(src)) {
        cache.request[src] = cache.request[src] || request(src);
        [src, css] = await cache.request[src];
    } else {
        [src, css] = await resolveCss(readFile, src, dir);
        tree.addChild(file, src);
    }

    const plugins = [pluginImport(tree)];

    if (testAs) {
        const [, space] = testAs;
        plugins.push(pluginRules(space, context));
    }

    let {
        root: { nodes },
    } = await postcss(plugins).process(css, {
        from: src,
    });

    if (!testAs) {
        if (media) {
            parent.insertAfter(
                atrule,
                postcss.atRule({ name: "media", params: media, nodes })
            );
        } else {
            parent.insertAfter(atrule, nodes);
        }
    }

    atrule.remove();
}

export default pluginImport;

/**
 * @typedef {Object} options
 * @property {import("@uppercod/imported").Context} tree
 * @property {(file:string)=>Promise<string>} readFile
 */

/**
 * @typedef {Object<string,Object<string,boolean>>} parallel
 */
