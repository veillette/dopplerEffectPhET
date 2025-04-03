import { WaveformPoint } from "./SimConstants";

/**
 * WaveformManager handles the generation and updating of waveform data
 * for both emitted and observed sound.
 */
export class WaveformManager {
  // Sound data for graphs (unitless amplitude values)
  public readonly emittedSoundData: number[] = []; // dimensionless amplitude values
  public readonly observedSoundData: number[] = []; // dimensionless amplitude values

  // Waveforms data for view visualization
  public readonly emittedWaveformData: WaveformPoint[] = []; // t in seconds (s), y is dimensionless
  public readonly observedWaveformData: WaveformPoint[] = []; // t in seconds (s), y is dimensionless

  // Phase accumulators (in radians)
  private emittedPhase: number = 0; // in radians (rad)
  private observedPhase: number = 0; // in radians (rad)

  /**
   * Create a new WaveformManager
   * @param soundDataSize Number of points to store in waveform arrays
   */
  constructor(private readonly soundDataSize: number) {
    // Initialize sound data arrays
    for (let i = 0; i < soundDataSize; i++) {
      this.emittedSoundData.push(0);
      this.observedSoundData.push(0);

      // Initialize waveform data arrays
      this.emittedWaveformData.push({ t: i / soundDataSize, y: 0 });
      this.observedWaveformData.push({ t: i / soundDataSize, y: 0 });
    }
  }

  /**
   * Update emitted waveform data based on frequency and elapsed time
   * @param emittedFrequency Frequency in Hertz (Hz)
   * @param dt Elapsed time in seconds (s)
   * @param timeSpeedFactor Simulation time speed factor (dimensionless)
   */
  public updateEmittedWaveform(
    emittedFrequency: number,
    dt: number,
    timeSpeedFactor: number,
  ): void {
    // Calculate emitted waveform (in model time)
    this.emittedPhase += emittedFrequency * dt * Math.PI * 2; // in radians (rad)

    // Update emitted sound data
    this.emittedSoundData.push(Math.sin(this.emittedPhase) * 30); // dimensionless scaling
    this.emittedSoundData.shift();

    // Apply time speed factor to the waveform display
    for (let i = 0; i < this.emittedSoundData.length; i++) {
      this.emittedWaveformData[i] = {
        t: (i / this.emittedSoundData.length) * timeSpeedFactor, // in seconds (s)
        y: this.emittedSoundData[i], // dimensionless amplitude
      };
    }
  }

  /**
   * Update observed waveform data
   * @param observedFrequency Observed frequency in Hertz (Hz)
   * @param phaseAtArrival Phase at wave arrival in radians (rad)
   * @param timeSinceArrival Time since wave arrival in seconds (s)
   * @param timeSpeedFactor Simulation time speed factor (dimensionless)
   */
  public updateObservedWaveform(
    observedFrequency: number,
    phaseAtArrival: number,
    timeSinceArrival: number,
    timeSpeedFactor: number,
  ): void {
    // Calculate additional phase based on observed frequency
    const additionalPhase = timeSinceArrival * observedFrequency * Math.PI * 2; // in radians (rad)
    this.observedPhase = phaseAtArrival + additionalPhase; // in radians (rad)

    // Update observed sound data
    this.observedSoundData.push(Math.sin(this.observedPhase) * 30); // dimensionless scaling
    this.observedSoundData.shift();

    // TODO: this seems an expensive operation, we should try to optimize it
    // Apply time speed factor to the waveform display
    for (let i = 0; i < this.observedSoundData.length; i++) {
      this.observedWaveformData[i] = {
        t: (i / this.observedSoundData.length) * timeSpeedFactor,
        y: this.observedSoundData[i],
      };
    }
  }

  /**
   * Clear waveform with no signal (for when no waves have reached observer)
   */
  public clearObservedWaveform(): void {
    this.observedSoundData.push(0);
    this.observedSoundData.shift();
  }

  /**
   * Get current emitted phase
   */
  public getEmittedPhase(): number {
    return this.emittedPhase;
  }

  /**
   * Reset the waveform manager state
   * @param soundDataSize Size of the waveform data arrays
   */
  public reset(soundDataSize: number): void {
    this.emittedPhase = 0;
    this.observedPhase = 0;

    // Reset sound data
    for (let i = 0; i < this.emittedSoundData.length; i++) {
      this.emittedSoundData[i] = 0;
      this.observedSoundData[i] = 0;

      // Reset waveform data
      this.emittedWaveformData[i] = { t: i / soundDataSize, y: 0 };
      this.observedWaveformData[i] = { t: i / soundDataSize, y: 0 };
    }
  }
}
