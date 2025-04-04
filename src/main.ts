import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { LocalizedString } from "scenerystack";
import { SimScreen } from "./screen-name/SimScreen.js";
import strings_en from "./i18n/strings_en.json";
import strings_fr from "./i18n/strings_fr.json";

onReadyToLaunch(() => {
  // Create localized string properties
  const StringProperties = LocalizedString.getNestedStringProperties({
    en: strings_en,
    fr: strings_fr,
  });

  // The title is now a localized StringProperty that can change to different values
  const titleStringProperty = StringProperties.titleStringProperty;

  const screens = [
    new SimScreen({ tandem: Tandem.ROOT.createTandem("simScreen") }),
  ];

  const sim = new Sim(titleStringProperty, screens);
  sim.start();
});
