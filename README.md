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

## import as

Esta es una caracteristica especial de postcss-import, permite asociar la importacion a un grupo, para ser asociada a base de ese grupo a otras reglas, eg:

```scss
@import "https://cdn.jsdelivr.net/npm/bulma@0.9.0/css/bulma.min.css" (as: bulma);

.button {
    @extend bulma.button bulma.is-dark;
}
```
