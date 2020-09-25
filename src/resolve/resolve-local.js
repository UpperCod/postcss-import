import path from "path";
import createCache from "@uppercod/cache";

const cache = createCache();

/**@type {resolveLocal} */
export const resolveLocal = async (read, src, dir) => {
    let error;
    try {
        if (/^[^\@]/.test(src) && dir) {
            const file = path.join(dir, src);
            return [file, await read(file)];
        }
    } catch (e) {
        error = e;
    }
    if (/^[^\.]/.test(src)) {
        return cache(requireResolve, [read, src]);
    }
    throw error;
};

/**@type {resolveLocal} */
const requireResolve = async (read, src) => {
    const file = require.resolve(src);
    return [file, await read(file)];
};

/**
 * @callback resolveLocal
 * @param {(src:string)=>Promise<string>} read
 * @param {string} src
 * @param {string} dir
 */
