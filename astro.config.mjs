import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://slovyagin.com/",
  scopedStyleStrategy: "class",
	vite: {
		build: {
			minify: false,
		},
	}
});
