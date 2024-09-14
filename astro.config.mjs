import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	build: {
		inlineStylesheets: "never",
	},
	output: "static",
	site: "https://slovyagin.com/",
	scopedStyleStrategy: "class"
});
