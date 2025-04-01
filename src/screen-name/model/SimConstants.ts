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

// Add this interface near the top of the file with other type definitions
export interface WaveformPoint {
  t: number; // Time value in seconds (s)
  y: number; // Amplitude value (dimensionless)
}

// Physical constants in SI units
export const PHYSICS = {
  SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
  EMITTED_FREQ: 40, // Base frequency of emitted sound (Hz)
  FREQ_MIN: 1, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted (dimensionless)
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging (dimensionless)
  MIN_VELOCITY_MAG: 1, // Minimum velocity magnitude to display vector (m/s)
  MAX_SPEED: 100.0, // Maximum speed for source and observer (m/s)
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 1, // Maximum age of a wave in seconds (s)
} as const;

// Initial positions (in meters)
export const INITIAL_POSITIONS = {
  SOURCE: new Vector2(-50, 0), // Source starts 50m left of center (m)
  OBSERVER: new Vector2(50, 0), // Observer starts 50m right of center (m)
} as const;

// Sound data
export const SOUND_DATA = {
  ARRAY_SIZE: 200, // Number of points in sound waveform arrays (dimensionless)
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
  // Time scaling: 1 second in model time = 0.1 seconds in real time
  TIME: 0.1, // Dimensionless scaling factor

  // Velocity visualization scaling
  // This scales the velocity vectors to make them more visible on screen
  VELOCITY_VECTOR: 0.5, // Dimensionless scaling factor

  // Scale factor for converting between model and view coordinates (2 "pixels" per meter)
  MODEL_VIEW: 2, // Pixels per meter (pixels/m)
} as const;
