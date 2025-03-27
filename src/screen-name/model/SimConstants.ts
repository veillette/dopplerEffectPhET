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
  FREQ_MIN: 0.1, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted (unitless)
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging (unitless)
  MIN_VELOCITY_MAG: 0.01, // Minimum velocity magnitude to display vector (m/s)
  MAX_SPEED: 100.0 // Maximum speed for source and observer (m/s)
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 1, // Maximum age of a wave in seconds
} as const;

// Initial positions (in meters)
export const INITIAL_POSITIONS = {
  SOURCE: { x: -50, y: 0 }, // Source starts 50m left of center
  OBSERVER: { x: 50, y: 0 } // Observer starts 50m right of center
} as const;

// Sound data
export const SOUND_DATA = {
  ARRAY_SIZE: 200 // Number of points in sound waveform arrays (unitless)
} as const;

// Preset scenarios (velocities in m/s)
export const SCENARIOS = {
  SOURCE_TOWARD_OBSERVER: {
    sourceVelocity: { x: 60, y: 0 }, // Source moves right at 60 m/s
    observerVelocity: { x: 0, y: 0 } // Observer stationary
  },
  OBSERVER_TOWARD_SOURCE: {
    sourceVelocity: { x: 0, y: 0 }, // Source stationary
    observerVelocity: { x: -60, y: 0 } // Observer moves left at 60 m/s
  },
  MOVING_APART: {
    sourceVelocity: { x: -60, y: 0 }, // Source moves left at 60 m/s
    observerVelocity: { x: 60, y: 0 } // Observer moves right at 60 m/s
  },
  PERPENDICULAR: {
    sourceVelocity: { x: 0, y: 60 }, // Source moves up at 60 m/s
    observerVelocity: { x: 0, y: -60 } // Observer moves down at 60 m/s
  }
} as const;

// Model-view transform configuration
export const MODEL_VIEW = {
  // Model space bounds (in meters)
  MODEL_BOUNDS: {
    MIN_X: -100, // Leftmost point in model space
    MAX_X: 100,  // Rightmost point in model space
    MIN_Y: -100, // Bottommost point in model space
    MAX_Y: 100   // Topmost point in model space
  },
  // Scale factors for converting between model and view coordinates
  SCALE: {
    // Time scaling: 1 second in model time = 0.1 seconds in real time
    TIME_SCALE: 0.10,
    // Velocity visualization scaling
    // This scales the velocity vectors to make them more visible on screen
    // 
    VELOCITY_VECTOR_SCALE: 0.2
  }
} as const; 