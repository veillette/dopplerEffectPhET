import "./brand.js";
import { Bounds2, Property, Tandem } from "scenerystack";
import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import DopplerEffectColors from "./DopplerEffectColors";
import { StringManager } from "./i18n/StringManager";
import { SimScreen } from "./screen-name/SimScreen.js";
import { KeyboardShorcutsNode } from "./screen-name/view/components/KeyboardShorcutsNode.js";

onReadyToLaunch(() => {
  // Get string manager instance
  const stringManager = StringManager.getInstance();

  // Get the title string property from the string manager
  const titleStringProperty = stringManager.getTitleStringProperty();

  // Create simulation options with ProjectorMode support
  const simOptions = {
    webgl: true,
    preferencesModel: new PreferencesModel({
      visualOptions: {
        supportsProjectorMode: true,
        supportsInteractiveHighlights: true,
      },
    }),
  };

  const keyboardHelpNode = new KeyboardShorcutsNode({
    visibleProperty: new Property(true),
    layoutBounds: new Bounds2(0, 0, 1, 1),
  });

  const screens = [
    new SimScreen({
      tandem: Tandem.ROOT.createTandem("simScreen"),
      backgroundColorProperty: DopplerEffectColors.backgroundColorProperty,
      createKeyboardHelpNode: () => {
        return keyboardHelpNode;
      },
    }),
  ];

  const sim = new Sim(titleStringProperty, screens, simOptions);
  sim.start();
});
