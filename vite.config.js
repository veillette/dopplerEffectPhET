import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Set the base URL to the repository name for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/dopplerEffectPhET/' : './',
});
