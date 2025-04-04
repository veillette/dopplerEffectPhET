import { Vector2 } from "scenerystack";
import { ObservableArray } from "scenerystack/axon";
import { Wave } from "./SimModel";
import { WAVE } from "./SimConstants";

/**
 * WaveGenerator handles the creation, propagation, and lifecycle management of waves.
 * It encapsulates all wave-related functionality for the Doppler effect simulation.
 */
export class WaveGenerator {
  // Time tracking (in seconds)
  private lastWaveTime: number = 0; // in seconds (s)

  /**
   * Create a new WaveGenerator
   */
  constructor(
    private readonly waves: ObservableArray<Wave>,
    private readonly getSimulationTime: () => number, // returns time in seconds (s)
    private readonly getSourcePosition: () => Vector2, // returns position in meters (m)
    private readonly getSourceVelocity: () => Vector2, // returns velocity in meters/second (m/s)
    private readonly getEmittedFrequency: () => number, // returns frequency in Hertz (Hz)
    private readonly getSoundSpeed: () => number, // returns speed in meters/second (m/s)
    private readonly getEmittedPhase: () => number, // returns phase in radians (rad)
  ) {}

  /**
   * Generate new waves based on emitted frequency
   */
  public generateWaves(): void {
    const simulationTime = this.getSimulationTime(); // in seconds (s)
    const waveInterval = 1.0 / this.getEmittedFrequency(); // in seconds (s)

    // Check if it's time to emit a new wave
    if (simulationTime - this.lastWaveTime > waveInterval) {
      // Create a new wave
      this.waves.add({
        position: this.getSourcePosition().copy(), // in meters (m)
        radius: 0, // in meters (m)
        birthTime: simulationTime, // in seconds (s)
        sourceVelocity: this.getSourceVelocity().copy(), // in meters/second (m/s)
        sourceFrequency: this.getEmittedFrequency(), // in Hertz (Hz)
        phaseAtEmission: this.getEmittedPhase(), // in radians (rad)
      });

      // Update last wave time (in seconds)
      this.lastWaveTime = simulationTime; // in seconds (s)
    }
  }

  /**
   * Update existing waves (expand radius, remove old ones)
   * @param simulationTime Current simulation time in seconds (s)
   * @param modelDt Current model delta time in seconds (s)
   */
  public updateWaves(simulationTime: number, modelDt: number): void {
    // Update existing waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves.get(i);

      // Update radius based on modelDt and sound speed (in meters)
      wave.radius = wave.radius + modelDt * this.getSoundSpeed(); // in meters (m)

      // Calculate age in seconds (s)
      const age = simulationTime - wave.birthTime; // in seconds (s)

      // Remove waves that are too old
      if (age > WAVE.MAX_AGE) {
        // WAVE.MAX_AGE in seconds (s)
        this.waves.remove(wave);
      }
    }
  }

  /**
   * Reset the wave generator state
   */
  public reset(): void {
    this.lastWaveTime = 0;
    this.waves.clear();
  }
}
