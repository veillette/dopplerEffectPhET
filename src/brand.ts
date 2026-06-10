/**
 * brand.ts
 *
 * Registers the SceneryStack brand for this simulation.
 *
 * Chain position: init.ts → assert.ts → splash.ts → [here] brand.ts
 *
 * !! THIS FILE MUST BE THE FIRST IMPORT IN src/main.ts !!
 *
 * The brand object controls what appears in the About dialog (Help → About),
 * including the logo, copyright notice, and navigation links.
 *
 * ── How to customize ─────────────────────────────────────────────────────────
 * - Set `name` to your organization name (shown in About dialog)
 * - Set `copyright` to your copyright string, e.g. "© 2025 My Organization"
 * - Implement `getLinks(simName, locale)` to return About-dialog links
 * - Replace logo data URIs with your own if desired
 *
 * ── Note on the import path ──────────────────────────────────────────────────
 * src/main.ts imports this file as `"./brand.js"`. TypeScript (in bundler mode)
 * resolves `.js` extensions to `.ts` source files automatically — no renaming
 * or extra config is needed.
 */

// splash.ts (and transitively assert.ts and init.ts) must run before brand registration
import "./splash.js";

import type { TBrand } from "scenerystack/brand";
import { brand, madeWithSceneryStackOnDark, madeWithSceneryStackOnLight } from "scenerystack/brand";

const Brand: TBrand = {
  // Must match the brand id passed to init() in src/init.ts
  id: "made-with-scenerystack",

  // Your organization name, or null to use the SceneryStack default
  name: null,

  // Copyright string shown in the About dialog, or null to omit
  copyright: null,

  // Returns About-dialog footer links for the given sim name and locale.
  // LinkObject shape: { textStringProperty, url }
  getLinks: () => [],

  // Logos shown on dark and light backgrounds respectively.
  // Replace with your own data URIs to use a custom logo.
  logoOnBlackBackground: madeWithSceneryStackOnDark,
  logoOnWhiteBackground: madeWithSceneryStackOnLight,
};

brand.register("Brand", Brand);
