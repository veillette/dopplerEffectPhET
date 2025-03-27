import { Vector2, Property, NumberProperty, BooleanProperty, StringProperty } from 'scenerystack';
import { ObservableArray } from 'scenerystack/axon';
import { createObservableArray } from 'scenerystack/axon';
import { PHYSICS, WAVE, INITIAL_POSITIONS, SOUND_DATA, SCENARIOS, MODEL_VIEW } from './SimConstants';

// Define available scenarios
export const SCENARIO_OPTIONS = {
  FREE_PLAY: 'Free Play',
  SCENARIO_1: 'Scenario 1: Source Approaching',
  SCENARIO_2: 'Scenario 2: Source Receding',
  SCENARIO_3: 'Scenario 3: Observer Approaching',
  SCENARIO_4: 'Scenario 4: Observer Receding'
};

/**
 * Model for the Doppler Effect simulation
 * 
 * This model handles all the physics calculations and state management for the simulation.
 * All calculations are done in SI units:
 * - Distances in meters (m)
 * - Velocities in meters per second (m/s)
 * - Frequencies in Hertz (Hz)
 * - Times in seconds (s)
 * - Angles in radians
 * 
 * The model space is defined by MODEL_VIEW.MODEL_BOUNDS, which maps physical space
 * to a coordinate system centered at (0,0) with bounds of ±100m in both dimensions.
 * This space is then transformed to view coordinates by the SimScreenView.
 */
export class SimModel {
  // Properties for physics simulation
  public readonly soundSpeedProperty: NumberProperty; // Speed of sound in m/s
  public readonly emittedFrequencyProperty: NumberProperty; // Frequency in Hz
  public readonly scenarioProperty: StringProperty; // Current scenario
  
  // Properties for source
  public readonly sourcePositionProperty: Property<Vector2>; // Position in meters
  public readonly sourceVelocityProperty: Property<Vector2>; // Velocity in m/s
  public readonly sourceMovingProperty: BooleanProperty;
  
  // Properties for observer
  public readonly observerPositionProperty: Property<Vector2>; // Position in meters
  public readonly observerVelocityProperty: Property<Vector2>; // Velocity in m/s
  public readonly observerMovingProperty: BooleanProperty;
  
  // Properties for simulation state
  public readonly simulationTimeProperty: NumberProperty; // Time in seconds
  public readonly observedFrequencyProperty: NumberProperty; // Frequency in Hz
  public readonly pausedProperty: BooleanProperty;
  
  // Wave collection - each wave contains:
  // - position: Vector2 (meters)
  // - radius: number (meters)
  // - birthTime: number (seconds)
  // - sourceVelocity: Vector2 (m/s)
  // - sourceFrequency: number (Hz)
  // - phaseAtEmission: number (radians)
  public readonly waves: ObservableArray<{
    position: Vector2;
    radius: number;
    birthTime: number;
    sourceVelocity: Vector2;
    sourceFrequency: number;
    phaseAtEmission: number;
  }>;
  
  // Sound data for graphs (unitless amplitude values)
  public readonly emittedSoundData: number[] = [];
  public readonly observedSoundData: number[] = [];
  
  // Phase accumulators (in radians)
  private emittedPhase: number = 0;
  private observedPhase: number = 0;
  
  // Time tracking (in seconds)
  private lastWaveTime: number = 0;
  
  /**
   * Constructor for the Doppler Effect SimModel
   */
  public constructor() {
    // Initialize properties
    this.soundSpeedProperty = new NumberProperty(PHYSICS.SOUND_SPEED);
    this.emittedFrequencyProperty = new NumberProperty(PHYSICS.EMITTED_FREQ);
    this.scenarioProperty = new StringProperty(SCENARIO_OPTIONS.FREE_PLAY);
    
    // Initialize source properties
    this.sourcePositionProperty = new Property(new Vector2(INITIAL_POSITIONS.SOURCE.x, INITIAL_POSITIONS.SOURCE.y));
    this.sourceVelocityProperty = new Property(new Vector2(0, 0));
    this.sourceMovingProperty = new BooleanProperty(false);
    
    // Initialize observer properties
    this.observerPositionProperty = new Property(new Vector2(INITIAL_POSITIONS.OBSERVER.x, INITIAL_POSITIONS.OBSERVER.y));
    this.observerVelocityProperty = new Property(new Vector2(0, 0));
    this.observerMovingProperty = new BooleanProperty(false);
    
    // Initialize simulation state
    this.simulationTimeProperty = new NumberProperty(0);
    this.observedFrequencyProperty = new NumberProperty(PHYSICS.EMITTED_FREQ);
    this.pausedProperty = new BooleanProperty(false);
    
    // Create waves array
    this.waves = createObservableArray<{
      position: Vector2;
      radius: number;
      birthTime: number;
      sourceVelocity: Vector2;
      sourceFrequency: number;
      phaseAtEmission: number;
    }>([]);
    
    // Initialize sound data arrays
    for (let i = 0; i < SOUND_DATA.ARRAY_SIZE; i++) {
      this.emittedSoundData.push(0);
      this.observedSoundData.push(0);
    }
    
    // Add listener for scenario changes
    this.scenarioProperty.lazyLink(() => {
      this.applyScenario();
    });
  }
  
  /**
   * Reset the simulation to initial state
   */
  public reset(): void {
    // Reset scenario property
    this.scenarioProperty.reset();
    
    // Reset physics properties
    this.soundSpeedProperty.reset();
    this.emittedFrequencyProperty.reset();
    
    // Reset source properties
    this.sourcePositionProperty.value = new Vector2(INITIAL_POSITIONS.SOURCE.x, INITIAL_POSITIONS.SOURCE.y);
    this.sourceVelocityProperty.value = new Vector2(0, 0);
    this.sourceMovingProperty.value = false;
    
    // Reset observer properties
    this.observerPositionProperty.value = new Vector2(INITIAL_POSITIONS.OBSERVER.x, INITIAL_POSITIONS.OBSERVER.y);
    this.observerVelocityProperty.value = new Vector2(0, 0);
    this.observerMovingProperty.value = false;
    
    // Reset simulation state
    this.simulationTimeProperty.reset();
    this.observedFrequencyProperty.value = PHYSICS.EMITTED_FREQ;
    this.pausedProperty.reset();
    
    // Clear waves
    this.waves.clear();
    
    // Reset phase accumulators
    this.emittedPhase = 0;
    this.observedPhase = 0;
    
    // Reset time tracking
    this.lastWaveTime = 0;
    
    // Reset sound data
    for (let i = 0; i < this.emittedSoundData.length; i++) {
      this.emittedSoundData[i] = 0;
      this.observedSoundData[i] = 0;
    }
  }
  
  /**
   * Update the simulation state based on elapsed time
   * @param dt - elapsed time in seconds (real time)
   */
  public step(dt: number): void {
    if (this.pausedProperty.value) return;
    
    // Apply time scaling to convert real time to model time
    // This ensures that 1 second of real time = 0.5 seconds of model time
    const modelDt = dt * MODEL_VIEW.SCALE.TIME_SCALE;
    
    // Update simulation time (in model seconds)
    this.simulationTimeProperty.value += modelDt;
    
    // Update positions based on velocities
    this.updatePositions(modelDt);
    
    // Generate new waves
    this.generateWaves();
    
    // Update waves
    this.updateWaves();
    
    // Calculate Doppler effect
    this.calculateDopplerEffect(modelDt);
  }
  
  /**
   * Update source and observer positions based on velocities
   * @param dt - elapsed time in model seconds
   */
  private updatePositions(dt: number): void {
    // Update source position if moving
    if (this.sourceMovingProperty.value) {
      const sourcePos = this.sourcePositionProperty.value;
      const sourceVel = this.sourceVelocityProperty.value;
      
      // Update position based on velocity (in model space)
      this.sourcePositionProperty.value = sourcePos.plus(sourceVel.timesScalar(dt));
      
      // Check if velocity is too small
      if (sourceVel.magnitude < PHYSICS.MIN_VELOCITY_MAG) {
        this.sourceMovingProperty.value = false;
      }
    } else if (!this.sourceMovingProperty.value && this.sourceVelocityProperty.value.magnitude > 0) {
      // Apply velocity decay when not actively moving
      const sourceVel = this.sourceVelocityProperty.value;
      this.sourceVelocityProperty.value = sourceVel.timesScalar(PHYSICS.VELOCITY_DECAY);
    }
    
    // Update observer position if moving
    if (this.observerMovingProperty.value) {
      const observerPos = this.observerPositionProperty.value;
      const observerVel = this.observerVelocityProperty.value;
      
      // Update position based on velocity (in model space)
      this.observerPositionProperty.value = observerPos.plus(observerVel.timesScalar(dt));
      
      // Check if velocity is too small
      if (observerVel.magnitude < PHYSICS.MIN_VELOCITY_MAG) {
        this.observerMovingProperty.value = false;
      }
    } else if (!this.observerMovingProperty.value && this.observerVelocityProperty.value.magnitude > 0) {
      // Apply velocity decay when not actively moving
      const observerVel = this.observerVelocityProperty.value;
      this.observerVelocityProperty.value = observerVel.timesScalar(PHYSICS.VELOCITY_DECAY);
    }
  }
  
  /**
   * Generate new waves based on emitted frequency
   */
  private generateWaves(): void {
    // Calculate wave interval based on emitted frequency (in model seconds)
    const waveInterval = 1.0 / this.emittedFrequencyProperty.value;
    
    // Check if it's time to emit a new wave
    if (this.simulationTimeProperty.value - this.lastWaveTime > waveInterval) {
      // Create a new wave
      this.waves.add({
        position: this.sourcePositionProperty.value.copy(),
        radius: 0,
        birthTime: this.simulationTimeProperty.value,
        sourceVelocity: this.sourceVelocityProperty.value.copy(),
        sourceFrequency: this.emittedFrequencyProperty.value,
        phaseAtEmission: this.emittedPhase
      });
      
      // Update last wave time
      this.lastWaveTime = this.simulationTimeProperty.value;
    }
  }
  
  /**
   * Update existing waves (expand radius, remove old ones)
   */
  private updateWaves(): void {
    // Update existing waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves.get(i);
      
      // Calculate age (in model seconds)
      const age = this.simulationTimeProperty.value - wave.birthTime;
      
      // Update radius based on age and sound speed (in model meters)
      wave.radius = age * this.soundSpeedProperty.value;
      
      // Remove waves that are too old
      if (age > WAVE.MAX_AGE) {
        this.waves.remove(wave);
      }
    }
  }
  
  /**
   * Calculate Doppler effect for the observer
   * @param dt - elapsed time in model seconds
   */
  private calculateDopplerEffect(dt: number): void {
    // Calculate emitted waveform (in model time)
    this.emittedPhase += this.emittedFrequencyProperty.value * dt * Math.PI * 2;
    
    // Update emitted sound data
    this.emittedSoundData.push(Math.sin(this.emittedPhase) * 30);
    this.emittedSoundData.shift();
    
    // Find waves affecting the observer
    const wavesAtObserver: Array<{ wave: any, arrivalTime: number }> = [];
    
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves.get(i);
      
      // Calculate distance from wave origin to observer (in model meters)
      const distanceToObserver = wave.position.distance(this.observerPositionProperty.value);
      
      // Check if wave has reached observer
      if (wave.radius >= distanceToObserver) {
        // Calculate arrival time (in model seconds)
        const travelTime = distanceToObserver / this.soundSpeedProperty.value;
        const arrivalTime = wave.birthTime + travelTime;
        
        wavesAtObserver.push({
          wave,
          arrivalTime
        });
      }
    }
    
    // If no waves have reached observer yet, use default frequency
    if (wavesAtObserver.length === 0) {
      this.observedSoundData.push(0);
      this.observedSoundData.shift();
      return;
    }
    
    // Sort by arrival time (most recent first)
    wavesAtObserver.sort((a, b) => b.arrivalTime - a.arrivalTime);
    
    // Use most recently arrived wave
    const currentWave = wavesAtObserver[0].wave;
    const arrivalTime = wavesAtObserver[0].arrivalTime;
    
    // Calculate time since wave arrival (in model seconds)
    const timeSinceArrival = this.simulationTimeProperty.value - arrivalTime;
    
    // Get phase at arrival from original wave
    const phaseAtArrival = currentWave.phaseAtEmission;
    
    // Calculate Doppler frequency
    const observedFrequency = this.calculateObservedFrequency(currentWave);
    
    // Update the property
    this.observedFrequencyProperty.value = observedFrequency;
    
    // Calculate additional phase based on observed frequency (in model time)
    const additionalPhase = timeSinceArrival * observedFrequency * Math.PI * 2;
    this.observedPhase = phaseAtArrival + additionalPhase;
    
    // Update observed sound data
    this.observedSoundData.push(Math.sin(this.observedPhase) * 30);
    this.observedSoundData.shift();
  }
  
  /**
   * Calculate the frequency observed by the observer using the Doppler formula
   */
  private calculateObservedFrequency(wave: any): number {
    // Calculate unit vector from source to observer
    const direction = this.observerPositionProperty.value
      .minus(wave.position)
      .normalized();
    
    // Calculate velocity components along the direction vector
    const sourceVelocityComponent = wave.sourceVelocity.dot(direction);
    const observerVelocityComponent = this.observerVelocityProperty.value.dot(direction);
    
    // Calculate observed frequency using Doppler formula:
    // f' = f * (v - v_o) / (v - v_s)
    // where f is emitted frequency, v is sound speed,
    // v_o is observer velocity component, v_s is source velocity component
    const observedFreq = (wave.sourceFrequency * 
      (this.soundSpeedProperty.value - observerVelocityComponent)) /
      (this.soundSpeedProperty.value - sourceVelocityComponent);
    
    // Constrain to reasonable limits
    return Math.max(
      PHYSICS.FREQ_MIN,
      Math.min(
        observedFreq,
        wave.sourceFrequency * PHYSICS.FREQ_MAX_FACTOR
      )
    );
  }
  
  /**
   * Setup a preset scenario with the source moving toward observer
   */
  public setupScenario1(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(SCENARIOS.SOURCE_TOWARD_OBSERVER.sourceVelocity.x, SCENARIOS.SOURCE_TOWARD_OBSERVER.sourceVelocity.y);
    this.observerVelocityProperty.value = new Vector2(SCENARIOS.SOURCE_TOWARD_OBSERVER.observerVelocity.x, SCENARIOS.SOURCE_TOWARD_OBSERVER.observerVelocity.y);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = false;
  }
  
  /**
   * Setup a preset scenario with observer moving toward source
   */
  public setupScenario2(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(SCENARIOS.OBSERVER_TOWARD_SOURCE.sourceVelocity.x, SCENARIOS.OBSERVER_TOWARD_SOURCE.sourceVelocity.y);
    this.observerVelocityProperty.value = new Vector2(SCENARIOS.OBSERVER_TOWARD_SOURCE.observerVelocity.x, SCENARIOS.OBSERVER_TOWARD_SOURCE.observerVelocity.y);
    this.sourceMovingProperty.value = false;
    this.observerMovingProperty.value = true;
  }
  
  /**
   * Setup a preset scenario with source and observer moving away from each other
   */
  public setupScenario3(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(SCENARIOS.MOVING_APART.sourceVelocity.x, SCENARIOS.MOVING_APART.sourceVelocity.y);
    this.observerVelocityProperty.value = new Vector2(SCENARIOS.MOVING_APART.observerVelocity.x, SCENARIOS.MOVING_APART.observerVelocity.y);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = true;
  }
  
  /**
   * Setup a preset scenario with perpendicular movement
   */
  public setupScenario4(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(SCENARIOS.PERPENDICULAR.sourceVelocity.x, SCENARIOS.PERPENDICULAR.sourceVelocity.y);
    this.observerVelocityProperty.value = new Vector2(SCENARIOS.PERPENDICULAR.observerVelocity.x, SCENARIOS.PERPENDICULAR.observerVelocity.y);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = true;
  }
  
  /**
   * Apply the current scenario settings
   */
  private applyScenario(): void {
    // Reset velocities and positions first
    this.sourceVelocityProperty.value = new Vector2(0, 0);
    this.observerVelocityProperty.value = new Vector2(0, 0);
    this.sourcePositionProperty.value = new Vector2(INITIAL_POSITIONS.SOURCE.x, INITIAL_POSITIONS.SOURCE.y);
    this.observerPositionProperty.value = new Vector2(INITIAL_POSITIONS.OBSERVER.x, INITIAL_POSITIONS.OBSERVER.y);
    this.sourceMovingProperty.value = false;
    this.observerMovingProperty.value = false;

    // Apply scenario-specific settings
    switch (this.scenarioProperty.value) {
      case SCENARIO_OPTIONS.SCENARIO_1:
        this.setupScenario1();
        break;
      case SCENARIO_OPTIONS.SCENARIO_2:
        this.setupScenario2();
        break;
      case SCENARIO_OPTIONS.SCENARIO_3:
        this.setupScenario3();
        break;
      case SCENARIO_OPTIONS.SCENARIO_4:
        this.setupScenario4();
        break;
      case SCENARIO_OPTIONS.FREE_PLAY:
      default:
        // Free play mode - no initial velocities
        break;
    }
  }
}