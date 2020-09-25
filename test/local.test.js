import test from "ava";
import path from "path";
import postcss from "postcss";
import { pluginImport } from "../src";
import { readFile } from "fs/promises";

test("import url", async (t) => {
    const result = await postcss([pluginImport()]).process(
        `@import "style/a.css";`,
        {
            from: path.join(__dirname, "my.css"),
        }
    );
    t.is(
        (result + "").trim(),
        (await readFile(path.join(__dirname, "./style/c.css"), "utf-8")).trim()
    );
});

test("import url and media", async (t) => {
    const result = await postcss([pluginImport()]).process(
        `@import "style/c.css" (max-width:320px);`,
        {
            from: path.join(__dirname, "my.css"),
        }
    );
    t.is(
        (result + "").trim(),
        `@media (max-width:320px) {${await readFile(
            path.join(__dirname, "./style/c.css"),
            "utf-8"
        )}}`.trim()
    );
});
