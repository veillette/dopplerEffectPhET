/**
 * generate-icons.ts
 *
 * Rasterizes public/icons/icon.svg into the PNG icons and favicon.ico used by the PWA.
 * Run with: npm run icons
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const svg = readFileSync(resolve(publicDir, "icons", "icon.svg"));

const density = 512;

const pngTargets = [
  { size: 180, file: "icons/apple-touch-icon.png" },
  { size: 192, file: "icons/icon-192.png" },
  { size: 512, file: "icons/icon-512.png" },
];

for (const { size, file } of pngTargets) {
  await sharp(svg, { density }).resize(size, size).png().toFile(resolve(publicDir, file));
}

const icoBuffers = await Promise.all(
  [16, 32, 48, 64].map((size) => sharp(svg, { density }).resize(size, size).png().toBuffer()),
);
writeFileSync(resolve(publicDir, "favicon.ico"), await pngToIco(icoBuffers));
