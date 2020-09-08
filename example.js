import postcss from "postcss";
import pluginImport from "./src";

postcss([pluginImport()])
    .process(
        `
@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/523f1adfa8713c79c93bffb8ed446f89670ae7a3/file.css" (as:a);
@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/523f1adfa8713c79c93bffb8ed446f89670ae7a3/file.css" (as:b);
@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/523f1adfa8713c79c93bffb8ed446f89670ae7a3/file.css" (as:c);
@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/523f1adfa8713c79c93bffb8ed446f89670ae7a3/file.css" (as:d);
:root{color:black;@extend a.body}
:root{color:black;@extend b.body}
:root{color:black;@extend c.body}
:root{color:black;@extend d.body}
`,
        { from: "index.css" }
    )
    .then((result) => {
        console.log(result + "");
    });
