/**
 * DopplerEffectColors.ts
 *
 * Central location for all colors used in the Doppler Effect simulation, providing
 * support for different color profiles (default and projector mode).
 */

import { Color, ProfileColorProperty } from "scenerystack/scenery";
import DopplerEffectNamespace from "./DopplerEffectNamespace.js";

const BLACK = new Color(0, 0, 0);
const WHITE = new Color(255, 255, 255);
const YELLOW = new Color(255, 255, 0);

function profileColor(name: string, def: Color | string, projector: Color | string): ProfileColorProperty {
  return new ProfileColorProperty(DopplerEffectNamespace, name, { default: def, projector });
}

const DopplerEffectColors = {
  // Background / text
  backgroundColorProperty: profileColor("backgroundColor", BLACK, WHITE),
  textColorProperty: profileColor("textColor", WHITE, BLACK),
  highlightColorProperty: profileColor("highlightColor", new Color(100, 100, 100), new Color(150, 150, 150)),

  // Source and observer
  sourceColorProperty: profileColor("sourceColor", new Color(100, 255, 100), new Color(0, 200, 0)),
  observerColorProperty: profileColor("observerColor", new Color(180, 50, 255), new Color(120, 0, 180)),

  // Waves and selection
  connectingLineColorProperty: profileColor("connectingLineColor", new Color(200, 200, 200), new Color(100, 100, 100)),
  waveColorProperty: profileColor("waveColor", new Color(200, 200, 200), new Color(100, 100, 100)),
  selectionColorProperty: profileColor("selectionColor", new Color(255, 153, 0), new Color(255, 255, 0)),

  // Graph
  graphBackgroundColorProperty: profileColor("graphBackgroundColor", new Color(50, 50, 50), new Color(240, 240, 240)),
  graphGridColorProperty: profileColor("graphGridColor", new Color(150, 150, 150), new Color(200, 200, 200)),
  redshiftColorProperty: profileColor("redshiftColor", new Color(255, 100, 100), new Color(255, 40, 40)),
  blueshiftColorProperty: profileColor("blueshiftColor", new Color(100, 100, 255), new Color(40, 40, 255)),

  // Microphone
  microphoneBodyColorProperty: profileColor("microphoneBodyColor", new Color(150, 150, 150), new Color(100, 100, 100)),
  microphoneStemColorProperty: profileColor("microphoneStemColor", new Color(130, 130, 130), new Color(80, 80, 80)),
  microphoneBaseColorProperty: profileColor("microphoneBaseColor", new Color(100, 100, 100), new Color(50, 50, 50)),
  microphoneGridColorProperty: profileColor("microphoneGridColor", new Color(180, 180, 180), new Color(40, 40, 40)),
  microphoneDetectionRingColorProperty: profileColor("microphoneDetectionRingColor", new Color(255, 200, 0), YELLOW),

  // Control panel
  controlPanelBackgroundColorProperty: profileColor(
    "controlPanelBackgroundColor",
    new Color(50, 50, 50),
    new Color(238, 238, 238),
  ),
  controlPanelBorderColorProperty: profileColor(
    "controlPanelBorderColor",
    new Color(150, 150, 150),
    new Color(210, 210, 210),
  ),
  controlPanelTextColorProperty: profileColor("controlPanelTextColor", WHITE, BLACK),

  // Velocity arrows
  sourceVelocityArrowColorProperty: profileColor(
    "sourceVelocityArrowColor",
    new Color(100, 255, 100),
    new Color(0, 200, 0),
  ),
  observerVelocityArrowColorProperty: profileColor(
    "observerVelocityArrowColor",
    new Color(180, 50, 255),
    new Color(120, 0, 180),
  ),

  // Grid lines
  gridMajorLineColorProperty: profileColor("gridMajorLineColor", new Color(120, 120, 120), new Color(80, 80, 80)),
  gridMinorLineColorProperty: profileColor("gridMinorLineColor", new Color(70, 70, 70), new Color(180, 180, 180)),
};

export default DopplerEffectColors;
