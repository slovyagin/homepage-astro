import { builtinModules } from "node:module";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://slovyagin.com/",
  prefetch: true,
});
