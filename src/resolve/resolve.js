import { isUrl, readFile } from "../utils";
import { request } from "@uppercod/request";
import { resolveLocal } from "./resolve-local";
import createCache from "@uppercod/cache";

const cache = createCache();

/**@type {resolve} */
export const resolve = async (id, importer) => {
    if (isUrl(id)) {
        const [src, css] = await cache(request, id);

        return {
            id: src,
            css,
            cache: true,
        };
    } else {
        const [src, css] = await resolveLocal(readFile, id, importer);
        return {
            id: src,
            css,
            cache: /node_modules/.test(src),
        };
    }
};

/**
 * @typedef {Object} resolveResult
 * @property {string} id
 * @property {boolean} [external]
 * @property {string} [css]
 * @property {boolean} [cache]
 */

/**
 * @callback resolve
 * @param {string} id
 * @param {string} importer
 * @returns {Promise<resolveResult|null>}
 */
