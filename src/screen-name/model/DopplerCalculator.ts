import { Vector2 } from "scenerystack";
import { Wave } from "./SimModel";

/**
 * DopplerCalculator handles the physics calculations for the Doppler effect.
 */
export class DopplerCalculator {
  /**
   * Calculate observed frequency using the Doppler formula
   * @param wave The wave reaching the observer
   * @param observerPosition Current observer position in meters (m)
   * @param observerVelocity Current observer velocity in meters per second (m/s)
   * @param soundSpeed Current speed of sound in meters per second (m/s)
   * @returns The observed frequency in Hertz (Hz)
   */
  public calculateObservedFrequency(
    wave: Wave,
    observerPosition: Vector2,
    observerVelocity: Vector2,
    soundSpeed: number,
  ): number {
    // Calculate unit vector from source to observer (dimensionless)
    const direction = observerPosition.minus(wave.position).normalized(); // dimensionless unit vector

    // Calculate velocity components along the direction vector
    const sourceVelocityComponent = wave.sourceVelocity.dot(direction); // in meters per second (m/s)
    const observerVelocityComponent = observerVelocity.dot(direction); // in meters per second (m/s)

    // Calculate observed frequency using Doppler formula:
    // f' = f * (v - v_o) / (v - v_s)
    // where f is emitted frequency, v is sound speed,
    // v_o is observer velocity component, v_s is source velocity component
    const observedFrequency =
      (wave.sourceFrequency * // in Hertz (Hz)
        (soundSpeed - observerVelocityComponent)) / // in meters per second (m/s)
      (soundSpeed - sourceVelocityComponent); // in meters per second (m/s) // result in Hertz (Hz)

    return observedFrequency; // in Hertz (Hz)
  }

   /**
   * Calculate observed frequency for a stationary observer using the Doppler formula
   * @param wave The wave reaching the observer
   * @param observerPosition Current observer position in meters (m)
   * @param soundSpeed Current speed of sound in meters per second (m/s)
   * @returns The observed frequency in Hertz (Hz)
   */
   public calculateStationaryFrequency(
    wave: Wave,
    observerPosition: Vector2,
    soundSpeed: number,
  ): number {

    return this.calculateObservedFrequency(wave, observerPosition, new Vector2(0, 0), soundSpeed);
  }

  /**
   * Find waves that have reached the observer and calculate arrival times
   * @param waves Array of all waves
   * @param observerPosition Current observer position in meters (m)
   * @param soundSpeed Current speed of sound in meters per second (m/s)
   * @returns Array of waves at observer with arrival times in seconds (s)
   */
  public findWavesAtObserver(
    waves: Wave[],
    observerPosition: Vector2,
    soundSpeed: number,
  ): Array<{ wave: Wave; arrivalTime: number }> {
    const wavesAtObserver: Array<{ wave: Wave; arrivalTime: number }> = [];

    for (const wave of waves) {
      // Calculate distance from wave origin to observer
      const distanceToObserver = wave.position.distance(observerPosition); // in meters (m)

      // Check if wave has reached observer
      if (wave.radius >= distanceToObserver) {
        // both in meters (m)
        // Calculate arrival time
        const travelTime = distanceToObserver / soundSpeed; // in seconds (s)
        const arrivalTime = wave.birthTime + travelTime; // in seconds (s)

        wavesAtObserver.push({ wave, arrivalTime }); // arrivalTime in seconds (s)
      }
    }

    // Sort by arrival time (most recent first)
    wavesAtObserver.sort((a, b) => b.arrivalTime - a.arrivalTime);

    return wavesAtObserver; // arrivalTime in seconds (s)
  }
}
