import { init, madeWithSceneryStackSplashDataURI } from "scenerystack/init";

init({
  // Internal name of the simulation.
  name: "dopplerEffect",

  // Version (will be shown in the About dialog)
  version: "1.0.0",

  // The brand name used (should be the same as in brand.ts)
  brand: "made-with-scenerystack",

  // Should be one of the keys from https://github.com/phetsims/babel/blob/main/localeData.json
  locale: "en",

  // List of locales that are supported (and can be switched between in the simulation while running)
  availableLocales: ["en", "fr"],

  // Image to show while loading the simulation.
  splashDataURI: madeWithSceneryStackSplashDataURI,

  allowLocaleSwitching: true,

  // Dark theme by default, with a projector (light) profile selectable in Preferences.
  colorProfiles: ["default", "projector"],
});
