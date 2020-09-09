import { Transformer } from "postcss";

interface Context {}

declare module "@uppercod/postcss-import" {
    export default function pluginImport(tree?: Context): Transformer;
}
