import { readFile as fsReadFile } from "fs/promises";
/**
 *
 * @param {string} file
 */
export const isUrl = (file) => /^(http(s){0,1}:){0,1}\/\//.test(file);

/**
 * @param {string} file
 */
export const readFile = (file) => fsReadFile(file, "utf8");
