import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack";
import { SimScreen } from "./screen-name/SimScreen.js";
import { StringManager } from "./i18n/StringManager";

onReadyToLaunch(() => {
  // Get string manager instance
  const stringManager = StringManager.getInstance();

  // Get the title string property from the string manager
  const titleStringProperty = stringManager.getTitleStringProperty();

  // Create simulation options with ProjectorMode support
  const simOptions = {
    webgl: true,
    optionsForModals: {
      supportsProjectorMode: true
    }
  };

  const screens = [
    new SimScreen({ tandem: Tandem.ROOT.createTandem("simScreen") }),
  ];

  const sim = new Sim(titleStringProperty, screens, simOptions);
  sim.start();
});
