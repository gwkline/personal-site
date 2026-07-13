import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
	extends: [core, react, tanstack],
	ignorePatterns: [
		...(core.ignorePatterns ?? []),
		"**/src/routeTree.gen.ts",
		"**/convex/_generated/**",
		"**/src/styles.css",
	],
	rules: {
		"eslint/arrow-body-style": "off",
		"eslint/func-style": "off",
		"eslint/no-inline-comments": "off",
		"eslint/no-negated-condition": "off",
		"eslint/no-param-reassign": "off",
		"eslint/no-plusplus": "off",
		"eslint/no-use-before-define": "off",
		"eslint/prefer-destructuring": "off",
		"eslint/prefer-named-capture-group": "off",
		"eslint/require-unicode-regexp": "off",
		"eslint/sort-keys": "off",
		"import/consistent-type-specifier-style": "off",
		"jsx-a11y/prefer-tag-over-role": "off",
		"promise/prefer-await-to-then": "off",
		"react/button-has-type": "off",
		"react/hook-use-state": "off",
		"react/jsx-no-constructed-context-values": "off",
		"react/no-unescaped-entities": "off",
		"react/react-compiler": "off",
		"typescript/array-type": "off",
		"typescript/consistent-type-definitions": "off",
		"unicorn/catch-error-name": "off",
		"unicorn/consistent-function-scoping": "off",
		"unicorn/no-array-sort": "off",
		"unicorn/no-negated-condition": "off",
		"unicorn/no-object-as-default-parameter": "off",
		"unicorn/no-useless-undefined": "off",
		"unicorn/prefer-query-selector": "off",
		"unicorn/prefer-spread": "off",
		"unicorn/prefer-string-replace-all": "off",
		"unicorn/prefer-ternary": "off",
	},
});
