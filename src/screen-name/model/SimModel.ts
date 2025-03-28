import {
  Vector2,
  NumberProperty,
  BooleanProperty,
  StringProperty,
  EnumerationProperty,
  TimeSpeed,
  RangeWithValue,
} from "scenerystack";
import { ObservableArray } from "scenerystack/axon";
import { createObservableArray } from "scenerystack/axon";
import {
  PHYSICS,
  INITIAL_POSITIONS,
  SOUND_DATA,
  SCENARIOS,
  SCALE,
  WaveformPoint,
} from "./SimConstants";
import { WaveGenerator } from "./WaveGenerator";
import { WaveformManager } from "./WaveformManager";
import { MovableObject } from "./MovableObject";
import { DopplerCalculator } from "./DopplerCalculator";

// Export the Wave interface
export interface Wave {
  position: Vector2;
  radius: number;
  speedOfSound: number;
  birthTime: number;
  sourceVelocity: Vector2;
  sourceFrequency: number;
  phaseAtEmission: number;
}

// Define available scenarios
export const SCENARIO_OPTIONS = {
  FREE_PLAY: "Free Play",
  SCENARIO_1: "Scenario 1: Source Approaching",
  SCENARIO_2: "Scenario 2: Source Receding",
  SCENARIO_3: "Scenario 3: Observer Approaching",
  SCENARIO_4: "Scenario 4: Observer Receding",
};

// Define time speed values - the property will store these values
export const TIME_SPEED = {
  SLOW: 0.25,
  NORMAL: 1.0,
};

/**
 * Model for the Doppler Effect simulation
 *
 * This model is the main coordinator for the simulation, connecting the various
 * specialized classes that handle different aspects of the simulation.
 */
export class SimModel {
  // Properties for physics simulation
  public readonly soundSpeedProperty: NumberProperty;  // in meters per second (m/s)
  public readonly emittedFrequencyProperty: NumberProperty;  // in Hertz (Hz)
  public readonly scenarioProperty: StringProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;  // dimensionless factor
  public readonly soundSpeedRange: RangeWithValue;  // in meters per second (m/s)
  public readonly frequencyRange: RangeWithValue;  // in Hertz (Hz)

  // Source and observer objects
  private readonly source: MovableObject;  // position in meters (m)
  private readonly observer: MovableObject;  // position in meters (m)
  
  // For convenience, expose properties directly
  public readonly sourcePositionProperty;  // in meters (m)
  public readonly sourceVelocityProperty;  // in meters per second (m/s)
  public readonly sourceMovingProperty;
  public readonly observerPositionProperty;  // in meters (m)
  public readonly observerVelocityProperty;  // in meters per second (m/s)
  public readonly observerMovingProperty;

  // Simulation state properties
  public readonly simulationTimeProperty: NumberProperty;  // in seconds (s)
  public readonly observedFrequencyProperty: NumberProperty;  // in Hertz (Hz)
  public readonly playProperty: BooleanProperty;

  // Wave collection
  public readonly waves: ObservableArray<Wave>;  // radius in meters (m)

  // Specialized component classes
  private readonly waveGenerator: WaveGenerator;
  private readonly waveformManager: WaveformManager;
  private readonly dopplerCalculator: DopplerCalculator;

  // Expose waveform data for view access
  public get emittedWaveformData(): WaveformPoint[] { 
    return this.waveformManager.emittedWaveformData;
  }
  
  public get observedWaveformData(): WaveformPoint[] {
    return this.waveformManager.observedWaveformData;
  }
  
  // Expose sound data for backward compatibility
  public get emittedSoundData(): number[] {
    return this.waveformManager.emittedSoundData;
  }
  
  public get observedSoundData(): number[] {
    return this.waveformManager.observedSoundData;
  }

  /**
   * Constructor for the Doppler Effect SimModel
   */
  public constructor() {
    // Initialize physics properties
    this.soundSpeedProperty = new NumberProperty(PHYSICS.SOUND_SPEED);
    this.emittedFrequencyProperty = new NumberProperty(PHYSICS.EMITTED_FREQ);
    this.soundSpeedRange = new RangeWithValue(
      PHYSICS.SOUND_SPEED * 0.5,
      PHYSICS.SOUND_SPEED * 2,
      PHYSICS.SOUND_SPEED,
    );
    this.frequencyRange = new RangeWithValue(
      PHYSICS.EMITTED_FREQ * 0.5,
      PHYSICS.EMITTED_FREQ * 2,
      PHYSICS.EMITTED_FREQ,
    );
    this.scenarioProperty = new StringProperty(SCENARIO_OPTIONS.FREE_PLAY);
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // Initialize simulation state
    this.simulationTimeProperty = new NumberProperty(0);
    this.observedFrequencyProperty = new NumberProperty(PHYSICS.EMITTED_FREQ);
    this.playProperty = new BooleanProperty(true);

    // Create waves array
    this.waves = createObservableArray<Wave>([]);

    // Initialize source and observer
    this.source = new MovableObject(
      new Vector2(INITIAL_POSITIONS.SOURCE.x, INITIAL_POSITIONS.SOURCE.y)
    );
    this.observer = new MovableObject(
      new Vector2(INITIAL_POSITIONS.OBSERVER.x, INITIAL_POSITIONS.OBSERVER.y)
    );
    
    // Link properties for direct access
    this.sourcePositionProperty = this.source.positionProperty;
    this.sourceVelocityProperty = this.source.velocityProperty;
    this.sourceMovingProperty = this.source.movingProperty;
    this.observerPositionProperty = this.observer.positionProperty;
    this.observerVelocityProperty = this.observer.velocityProperty;
    this.observerMovingProperty = this.observer.movingProperty;

    // Create specialized component classes
    this.waveGenerator = new WaveGenerator(
      this.waves,
      () => this.simulationTimeProperty.value,
      () => this.sourcePositionProperty.value,
      () => this.sourceVelocityProperty.value,
      () => this.emittedFrequencyProperty.value,
      () => this.soundSpeedProperty.value,
      () => this.waveformManager.getEmittedPhase()
    );
    
    this.waveformManager = new WaveformManager(SOUND_DATA.ARRAY_SIZE);
    this.dopplerCalculator = new DopplerCalculator();

    // Add listeners
    this.scenarioProperty.lazyLink((scenario) => {
      this.applyScenario(scenario);
    });
    
    this.timeSpeedProperty.lazyLink(() => {
      // Just ensure latest data is used when time speed changes
      this.updateWaveforms(0);
    });
  }

  /**
   * Reset the simulation to initial state
   */
  public reset(): void {
    // Reset properties
    this.scenarioProperty.reset();
    this.soundSpeedProperty.reset();
    this.emittedFrequencyProperty.reset();
    this.timeSpeedProperty.reset();
    this.simulationTimeProperty.reset();
    this.observedFrequencyProperty.value = PHYSICS.EMITTED_FREQ;
    this.playProperty.reset();

    // Reset source and observer
    this.source.reset(new Vector2(INITIAL_POSITIONS.SOURCE.x, INITIAL_POSITIONS.SOURCE.y));
    this.observer.reset(new Vector2(INITIAL_POSITIONS.OBSERVER.x, INITIAL_POSITIONS.OBSERVER.y));

    // Reset components
    this.waveGenerator.reset();
    this.waveformManager.reset(SOUND_DATA.ARRAY_SIZE);
  }

  /**
   * Get the numeric value associated with the current TimeSpeed enum value
   */
  private getTimeSpeedValue(): number {
    switch (this.timeSpeedProperty.value) {
      case TimeSpeed.SLOW:
        return TIME_SPEED.SLOW;
      case TimeSpeed.NORMAL:
      default:
        return TIME_SPEED.NORMAL;
    }
  }

  /**
   * Update the simulation state based on elapsed time
   * @param dt - elapsed time in seconds (real time) (s)
   * @param force - optional parameter to force stepping even when paused
   */
  public step(dt: number, force: boolean = false): void {
    if (!this.playProperty.value && !force) return;

    // Apply time scaling
    const modelDt = dt * SCALE.TIME * this.getTimeSpeedValue();  // in seconds (s)

    // Update simulation time
    this.simulationTimeProperty.value += modelDt;  // in seconds (s)

    // Update positions
    this.source.updatePosition(modelDt);
    this.observer.updatePosition(modelDt);

    // Generate and update waves
    this.waveGenerator.generateWaves();
    this.waveGenerator.updateWaves(this.simulationTimeProperty.value);

    // Calculate Doppler effect and update waveforms
    this.updateWaveforms(modelDt);
  }

  /**
   * Update waveforms and calculate Doppler effect
   * @param dt Elapsed model time in seconds (s)
   */
  private updateWaveforms(dt: number): void {
    // Update emitted waveform
    this.waveformManager.updateEmittedWaveform(
      this.emittedFrequencyProperty.value,
      dt,
      this.getTimeSpeedValue()
    );

    // Find waves affecting the observer
    const wavesAtObserver = this.dopplerCalculator.findWavesAtObserver(
      this.waves,
      this.observerPositionProperty.value,
      this.soundSpeedProperty.value
    );

    // If no waves have reached observer yet, clear observed waveform
    if (wavesAtObserver.length === 0) {
      this.waveformManager.clearObservedWaveform();
      return;
    }

    // Use most recently arrived wave
    const currentWave = wavesAtObserver[0].wave;
    const arrivalTime = wavesAtObserver[0].arrivalTime;

    // Calculate time since wave arrival (in seconds)
    const timeSinceArrival = this.simulationTimeProperty.value - arrivalTime;  // in seconds (s)

    // Get phase at arrival from original wave
    const phaseAtArrival = currentWave.phaseAtEmission;

    // Calculate Doppler frequency
    const observedFrequency = this.dopplerCalculator.calculateObservedFrequency(
      currentWave,
      this.observerPositionProperty.value,
      this.observerVelocityProperty.value,
      this.soundSpeedProperty.value
    );

    // Update observed frequency property
    this.observedFrequencyProperty.value = observedFrequency;

    // Update observed waveform
    this.waveformManager.updateObservedWaveform(
      observedFrequency,
      phaseAtArrival,
      timeSinceArrival,
      this.getTimeSpeedValue()
    );
  }

  /**
   * Setup a preset scenario
   * @param scenario - the scenario to apply
   */
  public setupScenario(scenario: string): void {
    this.reset();
    
    switch (scenario) {
      case SCENARIO_OPTIONS.SCENARIO_1:
        this.sourceVelocityProperty.value = SCENARIOS.SOURCE_TOWARD_OBSERVER.sourceVelocity.copy();
        this.observerVelocityProperty.value = SCENARIOS.SOURCE_TOWARD_OBSERVER.observerVelocity.copy();
        this.sourceMovingProperty.value = true;
        this.observerMovingProperty.value = false;
        break;
        
      case SCENARIO_OPTIONS.SCENARIO_2:
        this.sourceVelocityProperty.value = SCENARIOS.OBSERVER_TOWARD_SOURCE.sourceVelocity.copy();
        this.observerVelocityProperty.value = SCENARIOS.OBSERVER_TOWARD_SOURCE.observerVelocity.copy();
        this.sourceMovingProperty.value = false;
        this.observerMovingProperty.value = true;
        break;
        
      case SCENARIO_OPTIONS.SCENARIO_3:
        this.sourceVelocityProperty.value = SCENARIOS.MOVING_APART.sourceVelocity.copy();
        this.observerVelocityProperty.value = SCENARIOS.MOVING_APART.observerVelocity.copy();
        this.sourceMovingProperty.value = true;
        this.observerMovingProperty.value = true;
        break;
        
      case SCENARIO_OPTIONS.SCENARIO_4:
        this.sourceVelocityProperty.value = SCENARIOS.PERPENDICULAR.sourceVelocity.copy();
        this.observerVelocityProperty.value = SCENARIOS.PERPENDICULAR.observerVelocity.copy();
        this.sourceMovingProperty.value = true;
        this.observerMovingProperty.value = true;
        break;
        
      case SCENARIO_OPTIONS.FREE_PLAY:
      default:
        // Free play mode - no initial velocities
        this.sourceVelocityProperty.value = new Vector2(0, 0);
        this.observerVelocityProperty.value = new Vector2(0, 0);
        this.sourceMovingProperty.value = false;
        this.observerMovingProperty.value = false;
        break;
    }
  }

  /**
   * Apply the current scenario settings
   * @param scenario - the scenario to apply
   */
  private applyScenario(scenario: string): void {
    // Reset positions
    this.sourcePositionProperty.value = new Vector2(
      INITIAL_POSITIONS.SOURCE.x,
      INITIAL_POSITIONS.SOURCE.y
    );
    this.observerPositionProperty.value = new Vector2(
      INITIAL_POSITIONS.OBSERVER.x,
      INITIAL_POSITIONS.OBSERVER.y
    );
    
    // Apply the scenario settings
    this.setupScenario(scenario);
  }
}
