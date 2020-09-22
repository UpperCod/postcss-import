/**
 *
 * @param {any} rule
 */
function insideAtrule(rule) {
    while ((rule = rule.parent)) {
        if (rule.type == "atrule") return true;
    }
}

/**
 *  @return {import("postcss").Plugin}
 */

export const pluginRuleToObject = (context = {}) => ({
    postcssPlugin: "postcss-rules-to-object",
    Rule: (rule) => {
        if (insideAtrule(rule)) return;
        rule.selectors.forEach((selector) => {
            if (!/^(\.|:|#|\[)/.test(selector)) return;
            context[selector] = context[selector] || [];
            context[selector].push(...rule.nodes);
        });
    },
});
