import test from "ava";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { pluginImport } from "../src";

test("import url", async (t) => {
    const result1 = await postcss([pluginImport(), tailwindcss]).process(
        `@tailwind base;`,
        {
            from: "my.css",
        }
    );
    const result2 = await postcss([pluginImport(), tailwindcss]).process(
        `@import "tailwindcss/base.css";`,
        {
            from: "my.css",
        }
    );
    t.deepEqual(result1 + "", result2 + "");
});
