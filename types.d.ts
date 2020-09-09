import { Transformer, ChildNode } from "postcss";

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

    export interface Options {
        imports?: Imports;
        process?: Process;
    }
    export default function pluginImport(options?: Options): Transformer;
}
