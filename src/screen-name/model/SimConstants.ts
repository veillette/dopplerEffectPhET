/**
 * Constants for the Doppler Effect simulation
 *
 * Units:
 * - All distances are in meters (m)
 * - All velocities are in meters per second (m/s)
 * - All frequencies are in Hertz (Hz)
 * - All times are in seconds (s)
 * - All angles are in radians
 */

// Physical constants in SI units
export const PHYSICS = {
  SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
  EMITTED_FREQ: 40, // Base frequency of emitted sound (Hz)
  FREQ_MIN: 1, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted (unitless)
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging (unitless)
  MIN_VELOCITY_MAG: 1, // Minimum velocity magnitude to display vector (m/s)
  MAX_SPEED: 100.0, // Maximum speed for source and observer (m/s)
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 1, // Maximum age of a wave in seconds
} as const;

// Initial positions (in meters)
export const INITIAL_POSITIONS = {
  SOURCE: { x: -50, y: 0 }, // Source starts 50m left of center
  OBSERVER: { x: 50, y: 0 }, // Observer starts 50m right of center
} as const;

// Sound data
export const SOUND_DATA = {
  ARRAY_SIZE: 200, // Number of points in sound waveform arrays (unitless)
} as const;

// Preset scenarios (velocities in m/s)
export const SCENARIOS = {
  SOURCE_TOWARD_OBSERVER: {
    sourceVelocity: { x: 60, y: 0 }, // Source moves right at 60 m/s
    observerVelocity: { x: 0, y: 0 }, // Observer stationary
  },
  OBSERVER_TOWARD_SOURCE: {
    sourceVelocity: { x: 0, y: 0 }, // Source stationary
    observerVelocity: { x: -60, y: 0 }, // Observer moves left at 60 m/s
  },
  MOVING_APART: {
    sourceVelocity: { x: -60, y: 0 }, // Source moves left at 60 m/s
    observerVelocity: { x: 60, y: 0 }, // Observer moves right at 60 m/s
  },
  PERPENDICULAR: {
    sourceVelocity: { x: 0, y: 60 }, // Source moves up at 60 m/s
    observerVelocity: { x: 0, y: -60 }, // Observer moves down at 60 m/s
  },
} as const;

// Scale factors for converting between model and view coordinates
export const SCALE = {
  // Time scaling: 1 second in model time = 0.1 seconds in real time
  TIME_SCALE: 0.1,

  // Velocity visualization scaling
  // This scales the velocity vectors to make them more visible on screen
  VELOCITY_VECTOR_SCALE: 0.5,

  // Scale factor for converting between model and view coordinates (2 "pixels" per meter)
  MODEL_VIEW_SCALE: 2,
} as const;
