import path from "path";
import createCache from "@uppercod/cache";

const cache = createCache();

/**
 *
 * @param {string} file
 */
export const isUrl = (file) => /^(http(s){0,1}:){0,1}\/\//.test(file);

/**@type {resolve} */
export const resolveCss = (read, src, dir) => {
    let error;
    try {
        if (/^[^\@]/.test(src) && dir) {
            const file = path.join(dir, src);
            return [file, read(file)];
        }
    } catch (e) {
        error = e;
    }
    if (/^[^\.]/.test(src)) {
        return cache(requireResolve, [read, src]);
    }
    throw error;
};

/**@type {resolve} */
const requireResolve = async (read, src) => {
    const file = require.resolve(src);
    return [file, await read(file)];
};

/**
 * @callback resolve
 * @param {(src:string)=>Promise<string>} read
 * @param {string} src
 * @param {string} dir
 */
