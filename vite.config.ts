import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Security headers required for:
 *  - COOP/COEP: SharedArrayBuffer support
 *  - CSP: restrict resource loading to same-origin + known blob/data exceptions
 *  - X-Content-Type-Options: prevent MIME sniffing
 *  - X-Frame-Options: prevent clickjacking (belt-and-suspenders alongside frame-ancestors)
 */
const securityHeaders: Record<string, string> = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Content-Security-Policy": [
    "default-src 'self'",
    // 'unsafe-eval' is required for SceneryStack query parameter parsing
    "script-src 'self' 'unsafe-eval'",
    "worker-src blob: 'self'",
    // Inline styles are set via element.style / cssText throughout the UI layer
    "style-src 'self' 'unsafe-inline'",
    // data: for icons
    "img-src 'self' data:",
    "media-src 'self' blob:",
    // blob: for fetch inside workers
    "connect-src 'self' blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// https://vite.dev/config/
export default defineConfig({
  // So the build can be served from an arbitrary path (e.g. a GitHub Pages project subpath).
  base: "./",
  build: {
    target: "es2024",
  },
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Doppler Effect",
        // biome-ignore lint/style/useNamingConvention: Web App Manifest spec requires snake_case keys
        short_name: "Doppler",
        description: "An interactive simulation of the Doppler Effect using SceneryStack.",
        // biome-ignore lint/style/useNamingConvention: Web App Manifest spec requires snake_case keys
        theme_color: "#2575ba",
        // biome-ignore lint/style/useNamingConvention: Web App Manifest spec requires snake_case keys
        background_color: "#000000",
        display: "standalone",
        orientation: "landscape",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
