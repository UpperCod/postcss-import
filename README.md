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

## Usage

```js
import postcss from "postcss";
import pluginImport from "@uppercod/postcss-import";

postcss([pluginImport()]).process(`@import "http://unpkg.com/example.css";`, {
    from: "example.css",
});
```

## Options

The options are parameters that are mutable by the process that optimize the execution of this plugin, the plugin internally has a cache system to avoid multiple executions of postcss,
to improve performance you can share this cache.

```js
pluginImport({
    /**
     * Cache local processes, the process object can be
     * shared between multiple instances
     */
    process: {},
    /**
     * Stores the paths of the local files imported by the process
     */
    imports: {},
});
```

## Optimization

```js
const cache = {};

postcss([pluginImport(cache)]).process(`@import "./file.css";`, {
    from: "a.css",
});

postcss([pluginImport(cache)]).process(`@import "./file.css";`, {
    from: "b.css",
});

postcss([pluginImport(cache)]).process(`@import "./file.css";`, {
    from: "c.css",
});
```

The import plugin will run only once for the file `file.css`.

## Import as

special feature of this plugin that allows associating the import to a group, to be associated based on that group with other rules, eg:

```scss
@import "https://cdn.jsdelivr.net/npm/bulma@0.9.0/css/bulma.min.css" (as: bulma);

.button {
    @extend bulma.button, bulma.is-dark;
}
```
