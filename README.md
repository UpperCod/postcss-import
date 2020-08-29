# @uppercod/postcss-import

resolves the `@import` and creates the `tree` property in the result object, which defines the imports.

Differences by [postcss-import](https://github.com/postcss/postcss-import):

1.  This plugin can belong to the bundle.
2.  This plugin imports css from url.
3.  The resolution are local so you must point to the css file if you import a package you must associate the physical directory of the css.

## Install

```
npm install @uppercod/postcss-import
```

## usage

```js
import postcss from "postcss";
import pluginImport from "@uppercod/postcss-import";

postcss([pluginImport()]).process(`@import "http://unpkg.com/example.css";`, {
    from: "example.css",
});
```
