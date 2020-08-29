import { Context } from "@uppercod/imported";
import { Transformer } from "postcss";

declare module "@uppercod/postcss-import" {
    export interface Options {
        tree?: Context;
        readFile?: (file: string) => Promise<string>;
    }
    export interface parallel {
        [file: string]: {
            [params: string]: boolean;
        };
    }
    export default function pluginImport(
        options?: Options,
        parallel?: parallel
    ): Transformer;
}
