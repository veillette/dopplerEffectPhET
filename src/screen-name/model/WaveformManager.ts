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
    this.initializeArrays(soundDataSize);
  }

  /**
   * Initialize data arrays with default values
   * @param size Size of the arrays to initialize
   */
  private initializeArrays(size: number): void {
    // Reset existing arrays if they contain data
    this.emittedSoundData.length = 0;
    this.observedSoundData.length = 0;
    this.emittedWaveformData.length = 0;
    this.observedWaveformData.length = 0;

    // Initialize arrays with default values
    for (let i = 0; i < size; i++) {
      this.emittedSoundData.push(0);
      this.observedSoundData.push(0);

      // Initialize waveform data arrays
      this.emittedWaveformData.push({ t: i / size, y: 0 });
      this.observedWaveformData.push({ t: i / size, y: 0 });
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

    // Update sound data and apply time speed factor
    this.updateSoundData(
      this.emittedSoundData,
      this.emittedWaveformData,
      Math.sin(this.emittedPhase),
      timeSpeedFactor
    );
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

    // Update sound data and apply time speed factor
    this.updateSoundData(
      this.observedSoundData,
      this.observedWaveformData,
      Math.sin(this.observedPhase),
      timeSpeedFactor
    );
  }

  /**
   * Update sound data arrays and waveform data
   * @param soundData Sound data array to update
   * @param waveformData Waveform data array to update
   * @param newValue New value to add to the sound data
   * @param timeSpeedFactor Time speed factor to apply to waveform data
   */
  private updateSoundData(
    soundData: number[],
    waveformData: WaveformPoint[],
    newValue: number,
    timeSpeedFactor: number
  ): void {
    // Update sound data with new value (shift off oldest value)
    soundData.push(newValue);
    soundData.shift();

    // Apply time speed factor to the waveform display
    this.updateWaveformData(soundData, waveformData, timeSpeedFactor);
  }

  /**
   * Update waveform data based on sound data and time speed factor
   * @param soundData Source sound data array
   * @param waveformData Target waveform data array to update
   * @param timeSpeedFactor Time speed factor to apply
   */
  private updateWaveformData(
    soundData: number[],
    waveformData: WaveformPoint[],
    timeSpeedFactor: number
  ): void {
    // Apply time speed factor to the waveform display
    for (let i = 0; i < soundData.length; i++) {
      waveformData[i] = {
        t: (i / soundData.length) * timeSpeedFactor, // in seconds (s)
        y: soundData[i], // dimensionless amplitude
      };
    }
  }

  /**
   * Clear waveform with no signal (for when no waves have reached observer)
   */
  public clearObservedWaveform(): void {
    this.observedSoundData.push(0);
    this.observedSoundData.shift();
    
    // Update the waveform visualization data
    this.updateWaveformData(this.observedSoundData, this.observedWaveformData, 1);
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
    this.initializeArrays(soundDataSize);
  }
}
