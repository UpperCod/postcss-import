import test from "ava";
import postcss from "postcss";
import { request } from "@uppercod/request";
import { pluginImport } from "../src";

test("import url", async (t) => {
    const url =
        "https://raw.githubusercontent.com/PrismJS/prism-themes/master/themes/prism-dracula.css";
    const result = await postcss([pluginImport()]).process(
        `@import "${url}";`,
        {
            from: "my.css",
        }
    );
    const [, content] = await request(url);
    t.is(result.css.trim(), content.trim());
});
