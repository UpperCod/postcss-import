import { Context } from "@uppercod/imported";
import { Transformer } from "postcss";

declare module "@uppercod/postcss-import" {
    export default function pluginImport(tree?: Context): Transformer;
}
