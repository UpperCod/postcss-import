import test from "ava";
import postcss from "postcss";
import { pluginImport } from "../src";

const megarule = `.megarule{
    color: red;
    color: teal;
    color: black;}`;

test("import url", async (t) => {
    const result = await postcss([pluginImport()]).process(
        `@import "${__dirname}/style/all.css" (as:all);
        .megarule{@extend all;}
        `,
        {
            from: "my.css",
        }
    );
    t.is(result.css.trim(), megarule);
});
