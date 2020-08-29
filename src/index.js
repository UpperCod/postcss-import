import path from "path";
import { readFile } from "fs/promises";
import createTree from "@uppercod/imported";
import { request } from "@uppercod/request";
import createCache from "@uppercod/cache";
import postcss from "postcss";
import { isUrl } from "./utils";
import resolveCss from "resolve-css";

const cache = createCache();
/**
 *
 * @param {options} [options]
 * @param {parallel} [parallel]
 * @returns {import("postcss").Transformer}
 */
export default function pluginImport(options, parallel = {}) {
    options = {
        ...{
            tree: createTree(),
            readFile: (src) => readFile(src, "utf-8"),
        },
        ...options,
    };
    return (root, result) => {
        const file = result.opts.from;
        //@ts-ignore
        result.tree = options.tree;
        return transformer(options, root, file, parallel);
    };
}
/**
 *
 * @param {options} options
 * @param {import("postcss").Root} root
 * @param {string} file
 * @param {parallel} parallel
 */
function transformer(options, root, file, parallel) {
    const imports = [];
    const { dir } = path.parse(file);
    const mapImport = async (atrule) => {
        const { params, parent } = atrule;
        parallel[file] = parallel[file] || {};

        if (parallel[file][params]) {
            atrule.remove();
            return;
        } else {
            parallel[file][params] = true;
        }

        const test = params.match(
            /(?:url\(){0,1}(?:"([^\"]+)"|'([^\']+)')(?:\)){0,1}\s*(.*)/
        );
        if (test) {
            const [, src1, src2, media] = test;
            let nextSrc = src1 || src2;
            let nextContent;
            if (isUrl(nextSrc)) {
                [nextSrc, nextContent] = await cache(request, nextSrc);
            } else {
                [nextSrc, nextContent] = await resolveCss(
                    options.readFile,
                    nextSrc,
                    dir
                );
                options.tree.addChild(file, nextSrc);
            }

            let {
                root: { nodes },
            } = await postcss([pluginImport(options, parallel)]).process(
                nextContent,
                {
                    from: nextSrc,
                }
            );

            if (media) {
                parent.insertAfter(
                    atrule,
                    postcss.atRule({ name: "media", params: media, nodes })
                );
            } else {
                parent.insertAfter(atrule, nodes);
            }

            atrule.remove();
        }
    };

    root.walkAtRules("import", (atrule) => imports.push(mapImport(atrule)));

    return Promise.all(imports);
}

/**
 * @typedef {Object} options
 * @property {import("@uppercod/imported").Context} tree
 * @property {(file:string)=>Promise<string>} readFile
 */

/**
 * @typedef {Object<string,Object<string,boolean>>} parallel
 */
