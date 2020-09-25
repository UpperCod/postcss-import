import { Plugin, ChildNode } from "postcss";

declare module "@uppercod/postcss-import" {
    export type Nodes = ChildNode[];

    export interface Imports {
        [file: string]: boolean;
    }

    export interface Context {
        [selector: string]: Nodes;
    }

    export interface ProcessResponse {
        nodes: Nodes;
        context: Context;
    }

    export interface Process {
        [file: string]: Promise<ProcessResponse>;
    }

    export interface ResolveResult {
        /**
         * module path
         */
        id: string;
        /**
         * css associated with the import
         */
        css?: string;
        /**
         * define if the module is external to the css and add it to the import
         */
        external?: boolean;
        /**
         * cache the postcss process
         */
        cache?: boolean;
    }

    export type Resolve = (
        id: string,
        importer: string
    ) => Promise<ResolveResult>;

    export interface Options {
        imports?: Imports;
        process?: Process;
        resolve?: Resolve;
    }

    export const resolve: Resolve;

    export function pluginImport(options?: Options): Plugin;
}
