/**
 * DopplerEffectColors.ts
 *
 * Central location for all colors used in the Doppler Effect simulation, providing
 * support for different color profiles (default and projector mode).
 */

import { Color, ProfileColorProperty } from "scenerystack";
import dopplerEffect from "./DopplerEffectNamespace";

// Basic color constants
const BLACK = new Color(0, 0, 0);
const WHITE = new Color(255, 255, 255);
const RED = new Color(255, 0, 0);
const BLUE = new Color(0, 0, 255);
const YELLOW = new Color(255, 255, 0);

/**
 * Color definitions for the Doppler Effect simulation
 */
const DopplerEffectColors = {
  // Background colors
  backgroundProperty: new ProfileColorProperty(dopplerEffect, "background", {
    default: BLACK,
    projector: WHITE,
  }),

  // Source and observer colors
  sourceColorProperty: new ProfileColorProperty(dopplerEffect, "sourceColor", {
    default: new Color(255, 100, 100), // Lighter red for projector
    projector: new Color(255, 0, 0), // Red
  }),
  observerColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "observerColor",
    {
      default: new Color(100, 100, 255), // Lighter blue for projector
      projector: new Color(0, 0, 255), // Blue
    },
  ),

  // UI element colors
  connectingLineColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "connectingLineColor",
    {
      default: new Color(200, 200, 200),
      projector: new Color(100, 100, 100),
    },
  ),
  waveColorProperty: new ProfileColorProperty(dopplerEffect, "waveColor", {
    default: new Color(200, 200, 200),
    projector: new Color(100, 100, 100),
  }),
  selectionColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "selectionColor",
    {
      default: new Color(255, 153, 0), // Orange for better contrast
      projector: new Color(255, 255, 0), // Yellow
    },
  ),

  // Graph colors
  graphBackgroundProperty: new ProfileColorProperty(
    dopplerEffect,
    "graphBackground",
    {
      default: new Color(50, 50, 50),
      projector: new Color(240, 240, 240),
    },
  ),
  graphGridColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "graphGridColor",
    {
      default: new Color(150, 150, 150),
      projector: new Color(200, 200, 200),
    },
  ),
  textColorProperty: new ProfileColorProperty(dopplerEffect, "textColor", {
    default: WHITE,
    projector: BLACK,
  }),
  redshiftColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "redshiftColor",
    {
      default: new Color(255, 100, 100),
      projector: new Color(255, 40, 40),
    },
  ),
  blueshiftColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "blueshiftColor",
    {
      default: new Color(100, 100, 255),
      projector: new Color(40, 40, 255),
    },
  ),

  // Microphone colors
  microphoneBodyColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "microphoneBodyColor",
    {
      default: new Color(150, 150, 150),
      projector: new Color(100, 100, 100),
    },
  ),
  microphoneStemColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "microphoneStemColor",
    {
      default: new Color(130, 130, 130),
      projector: new Color(80, 80, 80),
    },
  ),
  microphoneBaseColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "microphoneBaseColor",
    {
      default: new Color(100, 100, 100),
      projector: new Color(50, 50, 50),
    },
  ),
  microphoneGridColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "microphoneGridColor",
    {
      default: new Color(180, 180, 180),
      projector: new Color(40, 40, 40),
    },
  ),
  microphoneDetectionRingColorProperty: new ProfileColorProperty(
    dopplerEffect,
    "microphoneDetectionRingColor",
    {
      default: new Color(255, 200, 0),
      projector: YELLOW,
    },
  ),

  // Control panel colors
  controlPanelBackgroundProperty: new ProfileColorProperty(
    dopplerEffect,
    "controlPanelBackground",
    {
      default: new Color(50, 50, 50),
      projector: new Color(238, 238, 238),
    },
  ),
  controlPanelBorderProperty: new ProfileColorProperty(
    dopplerEffect,
    "controlPanelBorder",
    {
      default: new Color(150, 150, 150),
      projector: new Color(210, 210, 210),
    },
  ),
  controlPanelTextProperty: new ProfileColorProperty(
    dopplerEffect,
    "controlPanelText",
    {
      default: WHITE,
      projector: BLACK,
    },
  ),

  // Velocity arrow colors
  sourceVelocityArrowProperty: new ProfileColorProperty(
    dopplerEffect,
    "sourceVelocityArrow",
    {
      default: new Color(255, 120, 120),
      projector: RED,
    },
  ),
  observerVelocityArrowProperty: new ProfileColorProperty(
    dopplerEffect,
    "observerVelocityArrow",
    {
      default: new Color(120, 120, 255),
      projector: BLUE,
    },
  ),
};

// Register the namespace
dopplerEffect.register("DopplerEffectColors", DopplerEffectColors);

export default DopplerEffectColors;
