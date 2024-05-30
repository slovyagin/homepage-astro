import { builtinModules } from "node:module";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://slovyagin.com/",
  prefetch: true,
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      noExternal: process.env.NODE_ENV === "production" ? [/.*/] : undefined,
    },
  },
});
