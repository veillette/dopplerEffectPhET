/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screen, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. It triggers the full bootstrap chain:
 *
 *   brand.ts → splash.ts → assert.ts → init.ts
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first — triggers: init.ts → assert.ts → splash.ts → brand.ts
import "./brand.js";

import { Bounds2, Property, Tandem } from "scenerystack";
import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import DopplerEffectColors from "./DopplerEffectColors.js";
import { StringManager } from "./i18n/StringManager.js";
import { SimScreen } from "./screen-name/SimScreen.js";
import { KeyboardShorcutsNode } from "./screen-name/view/components/KeyboardShorcutsNode.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  const keyboardHelpNode = new KeyboardShorcutsNode({
    visibleProperty: new Property(true),
    layoutBounds: new Bounds2(0, 0, 1, 1),
  });

  const screens = [
    new SimScreen({
      tandem: Tandem.ROOT.createTandem("simScreen"),
      backgroundColorProperty: DopplerEffectColors.backgroundColorProperty,
      createKeyboardHelpNode: () => keyboardHelpNode,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    webgl: true,
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
