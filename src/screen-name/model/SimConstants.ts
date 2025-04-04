/**
 * Constants for the Doppler Effect simulation
 *
 * Units:
 * - All distances are in meters (m)
 * - All velocities are in meters per second (m/s)
 * - All frequencies are in Hertz (Hz)
 * - All times are in seconds (s)
 * - All angles are in radians (rad)
 */

import { Vector2 } from "scenerystack";

// Definition for waveform data used in visualization
export type WaveformPoint = {
  t: number; // Time value in seconds (s), used for right-aligned visualization
  y: number; // Raw amplitude value (dimensionless), will be scaled for display
};

// Physical constants in SI units
export const PHYSICS = {
  SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
  EMITTED_FREQ: 4, // Base frequency of emitted sound (Hz)
  FREQ_MIN: 0.5, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted (dimensionless)
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging (dimensionless)
  MAX_SPEED: 100.0, // Maximum speed for source and observer (m/s)
  MIN_VELOCITY_MAG: 0.1, // Minimum velocity magnitude (m/s)
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 10, // Maximum age of a wave in seconds (s)
} as const;

// Initial positions (in meters)
export const INITIAL_POSITIONS = {
  SOURCE: new Vector2(-1000, 0), // Source starts 1000m left of center (m)
  OBSERVER: new Vector2(1000, 0), // Observer starts 1000m right of center (m)
} as const;

// Sound data
export const SOUND_DATA = {
  ARRAY_SIZE: 100, // Number of points in sound waveform arrays (dimensionless)
} as const;

// Time speed constants for simulation
export const TIME_SPEED = {
  SLOW: 0.25, // Slow simulation speed (dimensionless)
  NORMAL: 1.0, // Normal simulation speed (dimensionless)
} as const;

// Preset scenarios (velocities in m/s)
export const SCENARIOS = {
  SOURCE_TOWARD_OBSERVER: {
    sourceVelocity: new Vector2(60, 0), // Source moves right at 60 m/s
    observerVelocity: new Vector2(0, 0), // Observer stationary (m/s)
  },
  OBSERVER_TOWARD_SOURCE: {
    sourceVelocity: new Vector2(0, 0), // Source stationary (m/s)
    observerVelocity: new Vector2(-60, 0), // Observer moves left at 60 m/s
  },
  MOVING_APART: {
    sourceVelocity: new Vector2(-60, 0), // Source moves left at 60 m/s
    observerVelocity: new Vector2(60, 0), // Observer moves right at 60 m/s
  },
  PERPENDICULAR: {
    sourceVelocity: new Vector2(0, 60), // Source moves up at 60 m/s
    observerVelocity: new Vector2(0, -60), // Observer moves down at 60 m/s
  },
} as const;

// Scale factors for converting between model and view coordinates
export const SCALE = {
  // Time scaling: 1 second in model time = 1 seconds in real time
  TIME: 1, // Dimensionless scaling factor

  // Velocity visualization scaling
  // This scales the velocity vectors to make them more visible on screen
  VELOCITY_VECTOR: 10, // Dimensionless scaling factor

  // Scale factor for converting between model and view coordinates (0.1 "pixels" per meter)
  MODEL_VIEW: 0.1, // Pixels per meter (pixels/m)
} as const;
