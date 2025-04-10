import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { Tandem, Property, Bounds2 } from "scenerystack";
import { SimScreen } from "./screen-name/SimScreen.js";
import { StringManager } from "./i18n/StringManager";
import { PreferencesModel } from "scenerystack/sim";
import DopplerEffectColors from "./DopplerEffectColors";
import {KeyboardShorcutsNode} from "./screen-name/view/components/KeyboardShorcutsNode.js";

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
      },
    }),
  };

  const screens = [
    new SimScreen({
      tandem: Tandem.ROOT.createTandem("simScreen"),
      backgroundColorProperty: DopplerEffectColors.backgroundColorProperty,
      createKeyboardHelpNode: () => {
        return new KeyboardShorcutsNode({
          visibleProperty: new Property(true),
          layoutBounds: new Bounds2(0, 0, 800, 600)
        })
      }
    }),
  ];

  const sim = new Sim(titleStringProperty, screens, simOptions);
  sim.start();
});
