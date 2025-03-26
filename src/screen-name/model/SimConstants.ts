/**
 * Constants for the Doppler Effect simulation
 */

// Physical constants in SI units
export const PHYSICS = {
  SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
  REAL_TIME_FACTOR: 0.5, // Slows down real-time for better visualization
  EMITTED_FREQ: 4, // Base frequency of emitted sound (Hz)
  FREQ_MIN: 0.1, // Minimum allowable frequency (Hz)
  FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted
  VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging
  MIN_VELOCITY_MAG: 0.01, // Minimum velocity magnitude to display vector (m/s)
  TIME_STEP_MAX: 0.05, // Maximum time step (seconds) to prevent jumps
} as const;

// Wave properties
export const WAVE = {
  MAX_AGE: 10, // Maximum age of a wave in seconds
} as const;

// Initial positions
export const INITIAL_POSITIONS = {
  SOURCE: { x: 100, y: 300 },
  OBSERVER: { x: 500, y: 300 }
} as const;

// Sound data
export const SOUND_DATA = {
  ARRAY_SIZE: 200 // Number of points in sound waveform arrays
} as const;

// Preset scenarios
export const SCENARIOS = {
  SOURCE_TOWARD_OBSERVER: {
    sourceVelocity: { x: 5, y: 0 },
    observerVelocity: { x: 0, y: 0 }
  },
  OBSERVER_TOWARD_SOURCE: {
    sourceVelocity: { x: 0, y: 0 },
    observerVelocity: { x: -5, y: 0 }
  },
  MOVING_APART: {
    sourceVelocity: { x: -5, y: 0 },
    observerVelocity: { x: 5, y: 0 }
  },
  PERPENDICULAR: {
    sourceVelocity: { x: 0, y: 3 },
    observerVelocity: { x: 0, y: -3 }
  }
} as const; 