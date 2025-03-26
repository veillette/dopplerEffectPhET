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
  REAL_TIME_FACTOR: 0.5, // Slows down real-time for better visualization (unitless)
  EMITTED_FREQ: 4, // Base frequency of emitted sound (Hz)
  FREQ_MIN: 0.1, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted (unitless)
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging (unitless)
  MIN_VELOCITY_MAG: 0.01, // Minimum velocity magnitude to display vector (m/s)
  TIME_STEP_MAX: 0.05, // Maximum time step (seconds) to prevent jumps
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 10, // Maximum age of a wave in seconds
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
    sourceVelocity: { x: 5, y: 0 }, // Source moves right at 5 m/s
    observerVelocity: { x: 0, y: 0 } // Observer stationary
  },
  OBSERVER_TOWARD_SOURCE: {
    sourceVelocity: { x: 0, y: 0 }, // Source stationary
    observerVelocity: { x: -5, y: 0 } // Observer moves left at 5 m/s
  },
  MOVING_APART: {
    sourceVelocity: { x: -5, y: 0 }, // Source moves left at 5 m/s
    observerVelocity: { x: 5, y: 0 } // Observer moves right at 5 m/s
  },
  PERPENDICULAR: {
    sourceVelocity: { x: 0, y: 3 }, // Source moves up at 3 m/s
    observerVelocity: { x: 0, y: -3 } // Observer moves down at 3 m/s
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
    // 1 meter in model space = 5 pixels in view space
    // This means a 200m wide model space will be 1000 pixels wide in view
    PIXELS_PER_METER: 5,
    // Time scaling: 1 second in model time = 0.5 seconds in real time (due to REAL_TIME_FACTOR)
    TIME_SCALE: 0.5,
    // Velocity visualization scaling
    // This scales the velocity vectors to make them more visible on screen
    // 1 m/s in model space = 20 pixels/s in view space
    VELOCITY_VECTOR_SCALE: 20
  }
} as const; 