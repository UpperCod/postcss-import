import postcss from "postcss";
import pluginImport from "./src";

postcss([pluginImport()])
    .process(
        `
@import "https://gist.githubusercontent.com/UpperCod/a685f64487fe5713cccefe54ad3bfa58/raw/b20812fb82dcc18ace8a40c79296742f7281fe4d/file.css";
:root{color:black;@extend v2.b, v2.b:hover}
`,
        { from: "index.css" }
    )
    .then((result) => {
        console.log(result + "");
    });
