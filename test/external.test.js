import test from "ava";
import postcss from "postcss";
import { request } from "@uppercod/request";
import { pluginImport, resolve } from "../src";

test("import url", async (t) => {
    const result = await postcss([
        pluginImport({
            resolve: (id, importer) => {
                if (/google/.test(id)) {
                    return { id, external: true };
                } else {
                    return resolve(id, importer);
                }
            },
        }),
    ]).process(
        `@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/523f1adfa8713c79c93bffb8ed446f89670ae7a3/file.css";@import "https://fonts.googleapis.com/css2?family=Poppins:wght@100&display=swap";
        `,
        {
            from: "my.css",
        }
    );
    t.is(
        result.css.trim(),
        `@import "https://fonts.googleapis.com/css2?family=Poppins:wght@100&display=swap";\n.body{color:tomato}\n.button{color:black}`.trim()
    );
});
