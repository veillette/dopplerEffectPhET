import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Set the base URL to the repository name for GitHub Pages
  base: process.env.GITHUB_PAGES ? "/dopplerEffectPhET/" : "./",
  build: {
    sourcemap: false,
  },
  plugins: [viteSingleFile()],
});
