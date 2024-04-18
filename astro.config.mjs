import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [vue()]
});