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
  backgroundProperty: new ProfileColorProperty(dopplerEffect, 'background', {
    default: WHITE,
    projector: BLACK
  }),
  
  // Source and observer colors
  sourceColorProperty: new ProfileColorProperty(dopplerEffect, 'sourceColor', {
    default: new Color(255, 0, 0), // Red
    projector: new Color(255, 100, 100) // Lighter red for projector
  }),
  observerColorProperty: new ProfileColorProperty(dopplerEffect, 'observerColor', {
    default: new Color(0, 0, 255), // Blue 
    projector: new Color(100, 100, 255) // Lighter blue for projector
  }),

  // UI element colors
  connectingLineColorProperty: new ProfileColorProperty(dopplerEffect, 'connectingLineColor', {
    default: new Color(100, 100, 100),
    projector: new Color(200, 200, 200)
  }),
  waveColorProperty: new ProfileColorProperty(dopplerEffect, 'waveColor', {
    default: new Color(100, 100, 100),
    projector: new Color(200, 200, 200)
  }),
  selectionColorProperty: new ProfileColorProperty(dopplerEffect, 'selectionColor', {
    default: new Color(255, 255, 0), // Yellow
    projector: new Color(255, 153, 0) // Orange for better contrast
  }),

  // Graph colors
  graphBackgroundProperty: new ProfileColorProperty(dopplerEffect, 'graphBackground', {
    default: new Color(240, 240, 240),
    projector: new Color(50, 50, 50)
  }),
  graphGridColorProperty: new ProfileColorProperty(dopplerEffect, 'graphGridColor', {
    default: new Color(200, 200, 200),
    projector: new Color(150, 150, 150)
  }),
  textColorProperty: new ProfileColorProperty(dopplerEffect, 'textColor', {
    default: BLACK,
    projector: WHITE
  }),
  redshiftColorProperty: new ProfileColorProperty(dopplerEffect, 'redshiftColor', {
    default: new Color(255, 40, 40),
    projector: new Color(255, 100, 100)
  }),
  blueshiftColorProperty: new ProfileColorProperty(dopplerEffect, 'blueshiftColor', {
    default: new Color(40, 40, 255),
    projector: new Color(100, 100, 255)
  }),

  // Microphone colors
  microphoneBodyColorProperty: new ProfileColorProperty(dopplerEffect, 'microphoneBodyColor', {
    default: new Color(100, 100, 100),
    projector: new Color(150, 150, 150)
  }),
  microphoneStemColorProperty: new ProfileColorProperty(dopplerEffect, 'microphoneStemColor', {
    default: new Color(80, 80, 80),
    projector: new Color(130, 130, 130)
  }),
  microphoneBaseColorProperty: new ProfileColorProperty(dopplerEffect, 'microphoneBaseColor', {
    default: new Color(50, 50, 50), 
    projector: new Color(100, 100, 100)
  }),
  microphoneGridColorProperty: new ProfileColorProperty(dopplerEffect, 'microphoneGridColor', {
    default: new Color(40, 40, 40),
    projector: new Color(180, 180, 180)
  }),
  microphoneDetectionRingColorProperty: new ProfileColorProperty(dopplerEffect, 'microphoneDetectionRingColor', {
    default: YELLOW,
    projector: new Color(255, 200, 0)
  }),

  // Control panel colors
  controlPanelBackgroundProperty: new ProfileColorProperty(dopplerEffect, 'controlPanelBackground', {
    default: new Color(238, 238, 238),
    projector: new Color(50, 50, 50)
  }),
  controlPanelBorderProperty: new ProfileColorProperty(dopplerEffect, 'controlPanelBorder', {
    default: new Color(210, 210, 210),
    projector: new Color(150, 150, 150)
  }),
  controlPanelTextProperty: new ProfileColorProperty(dopplerEffect, 'controlPanelText', {
    default: BLACK,
    projector: WHITE
  }),
  
  // Velocity arrow colors
  sourceVelocityArrowProperty: new ProfileColorProperty(dopplerEffect, 'sourceVelocityArrow', {
    default: RED, 
    projector: new Color(255, 120, 120)
  }),
  observerVelocityArrowProperty: new ProfileColorProperty(dopplerEffect, 'observerVelocityArrow', {
    default: BLUE,
    projector: new Color(120, 120, 255)
  })
};

// Register the namespace
dopplerEffect.register('DopplerEffectColors', DopplerEffectColors);

export default DopplerEffectColors; 