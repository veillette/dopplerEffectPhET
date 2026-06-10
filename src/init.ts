/**
 * init.ts
 *
 * Initializes SceneryStack with simulation metadata.
 *
 * IMPORTANT: This file is the START of the module loading chain:
 *   init.ts → assert.ts → splash.ts → brand.ts → everything else
 *
 * It must run before any other SceneryStack module is imported.
 *
 * ── How to customize ─────────────────────────────────────────────────────────
 * 1. Change `name` to match your package.json "name" field (kebab-case)
 * 2. Change `version` to match your package.json "version" field
 * 3. Update `availableLocales` when you add new translation files
 */
import { init, madeWithSceneryStackSplashDataURI } from "scenerystack/init";

init({
  // Internal identifier used by SceneryStack for URL parameters and phetmarks.
  // Use kebab-case matching the package.json "name" field.
  name: "doppler-effect",

  // Displayed in the About dialog (Help menu → About).
  version: "0.0.7",

  // Must match the id registered in src/brand.ts.
  brand: "made-with-scenerystack",

  // Default locale (ISO-639-1, optionally with ISO-3166-1 country code, e.g. "en_US").
  locale: "en",

  // All supported locales — must match the locale keys in src/i18n/StringManager.ts.
  availableLocales: ["en", "fr"],

  // Splash screen shown while the simulation loads.
  splashDataURI: madeWithSceneryStackSplashDataURI,

  // Allow the user to switch locale at runtime via the Preferences dialog.
  allowLocaleSwitching: true,

  // Enables the "Projector Mode" color profile alongside the default dark theme.
  // Required when supportsProjectorMode: true is used in PreferencesModel (src/main.ts).
  colorProfiles: ["default", "projector"],
});
