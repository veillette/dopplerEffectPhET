import { Vector2, Property, NumberProperty, BooleanProperty } from 'scenerystack';
import { ObservableArray } from 'scenerystack/axon';
import { createObservableArray } from 'scenerystack/axon';
/**
 * Model for the Doppler Effect simulation
 */
export class SimModel {
  // CONSTANTS
  public readonly CONSTANTS = {
    // Physical constants in SI units
    PHYSICS: {
      SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
      REAL_TIME_FACTOR: 0.5, // Slows down real-time for better visualization
      EMITTED_FREQ: 4, // Base frequency of emitted sound (Hz)
      FREQ_MIN: 0.1, // Minimum allowable frequency (Hz)
      FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted
      VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging
      MIN_VELOCITY_MAG: 0.01, // Minimum velocity magnitude to display vector (m/s)
      TIME_STEP_MAX: 0.05, // Maximum time step (seconds) to prevent jumps
    },
    
    // Wave properties
    WAVE: {
      MAX_AGE: 10, // Maximum age of a wave in seconds
    }
  };
  
  // Properties for physics simulation
  public readonly soundSpeedProperty: NumberProperty;
  public readonly emittedFrequencyProperty: NumberProperty;
  
  // Properties for source
  public readonly sourcePositionProperty: Property<Vector2>;
  public readonly sourceVelocityProperty: Property<Vector2>;
  public readonly sourceMovingProperty: BooleanProperty;
  
  // Properties for observer
  public readonly observerPositionProperty: Property<Vector2>;
  public readonly observerVelocityProperty: Property<Vector2>;
  public readonly observerMovingProperty: BooleanProperty;
  
  // Properties for simulation state
  public readonly simulationTimeProperty: NumberProperty;
  public readonly observedFrequencyProperty: NumberProperty;
  public readonly pausedProperty: BooleanProperty;
  
  // Wave collection
  public readonly waves: ObservableArray<{
    position: Vector2;
    radius: number;
    birthTime: number;
    sourceVelocity: Vector2;
    sourceFrequency: number;
    phaseAtEmission: number;
  }>;
  
  // Sound data for graphs
  public readonly emittedSoundData: number[] = [];
  public readonly observedSoundData: number[] = [];
  
  // Phase accumulators
  private emittedPhase: number = 0;
  private observedPhase: number = 0;
  
  // Time tracking
  private lastWaveTime: number = 0;
  
  /**
   * Constructor for the Doppler Effect SimModel
   */
  public constructor() {
    // Initialize physics properties
    this.soundSpeedProperty = new NumberProperty(this.CONSTANTS.PHYSICS.SOUND_SPEED);
    this.emittedFrequencyProperty = new NumberProperty(this.CONSTANTS.PHYSICS.EMITTED_FREQ);
    
    // Initialize source properties
    this.sourcePositionProperty = new Property<Vector2>(new Vector2(100, 300));
    this.sourceVelocityProperty = new Property<Vector2>(new Vector2(0, 0));
    this.sourceMovingProperty = new BooleanProperty(false);
    
    // Initialize observer properties
    this.observerPositionProperty = new Property<Vector2>(new Vector2(500, 300));
    this.observerVelocityProperty = new Property<Vector2>(new Vector2(0, 0));
    this.observerMovingProperty = new BooleanProperty(false);
    
    // Initialize simulation state
    this.simulationTimeProperty = new NumberProperty(0);
    this.observedFrequencyProperty = new NumberProperty(this.CONSTANTS.PHYSICS.EMITTED_FREQ);
    this.pausedProperty = new BooleanProperty(false);
    // Initialize waves array
    this.waves = createObservableArray<{
      position: Vector2;
      radius: number;
      birthTime: number;
      sourceVelocity: Vector2;
      sourceFrequency: number;
      phaseAtEmission: number;
    }>([]);
    
    // Initialize sound data arrays
    for (let i = 0; i < 200; i++) {
      this.emittedSoundData.push(0);
      this.observedSoundData.push(0);
    }
  }
  
  /**
   * Reset the simulation to initial state
   */
  public reset(): void {
    // Reset physics properties
    this.soundSpeedProperty.reset();
    this.emittedFrequencyProperty.reset();
    
    // Reset source properties
    this.sourcePositionProperty.value = new Vector2(100, 300);
    this.sourceVelocityProperty.value = new Vector2(0, 0);
    this.sourceMovingProperty.value = false;
    
    // Reset observer properties
    this.observerPositionProperty.value = new Vector2(500, 300);
    this.observerVelocityProperty.value = new Vector2(0, 0);
    this.observerMovingProperty.value = false;
    
    // Reset simulation state
    this.simulationTimeProperty.reset();
    this.observedFrequencyProperty.value = this.CONSTANTS.PHYSICS.EMITTED_FREQ;
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
   * @param dt - elapsed time in seconds
   */
  public step(dt: number): void {
    if (this.pausedProperty.value) return;
    
    // Apply time factor
    const scaledDt = dt * this.CONSTANTS.PHYSICS.REAL_TIME_FACTOR;
    
    // Update simulation time
    this.simulationTimeProperty.value += scaledDt;
    
    // Update positions based on velocities
    this.updatePositions(scaledDt);
    
    // Generate new waves
    this.generateWaves();
    
    // Update waves
    this.updateWaves();
    
    // Calculate Doppler effect
    this.calculateDopplerEffect(scaledDt);
  }
  
  /**
   * Update source and observer positions based on velocities
   */
  private updatePositions(dt: number): void {
    // Update source position if moving
    if (this.sourceMovingProperty.value) {
      const sourcePos = this.sourcePositionProperty.value;
      const sourceVel = this.sourceVelocityProperty.value;
      
      // Update position based on velocity
      this.sourcePositionProperty.value = sourcePos.plus(sourceVel.timesScalar(dt));
      
      // Check if velocity is too small
      if (sourceVel.magnitude < this.CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
        this.sourceMovingProperty.value = false;
      }
    } else if (!this.sourceMovingProperty.value && this.sourceVelocityProperty.value.magnitude > 0) {
      // Apply velocity decay when not actively moving
      const sourceVel = this.sourceVelocityProperty.value;
      this.sourceVelocityProperty.value = sourceVel.timesScalar(this.CONSTANTS.PHYSICS.VELOCITY_DECAY);
    }
    
    // Update observer position if moving
    if (this.observerMovingProperty.value) {
      const observerPos = this.observerPositionProperty.value;
      const observerVel = this.observerVelocityProperty.value;
      
      // Update position based on velocity
      this.observerPositionProperty.value = observerPos.plus(observerVel.timesScalar(dt));
      
      // Check if velocity is too small
      if (observerVel.magnitude < this.CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
        this.observerMovingProperty.value = false;
      }
    } else if (!this.observerMovingProperty.value && this.observerVelocityProperty.value.magnitude > 0) {
      // Apply velocity decay when not actively moving
      const observerVel = this.observerVelocityProperty.value;
      this.observerVelocityProperty.value = observerVel.timesScalar(this.CONSTANTS.PHYSICS.VELOCITY_DECAY);
    }
  }
  
  /**
   * Generate new waves based on emitted frequency
   */
  private generateWaves(): void {
    // Calculate wave interval based on emitted frequency
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
      
      // Calculate age
      const age = this.simulationTimeProperty.value - wave.birthTime;
      
      // Update radius based on age and sound speed
      wave.radius = age * this.soundSpeedProperty.value;
      
      // Remove waves that are too old
      if (age > this.CONSTANTS.WAVE.MAX_AGE) {
        this.waves.remove(wave);
      }
    }
  }
  
  /**
   * Calculate Doppler effect for the observer
   */
  private calculateDopplerEffect(dt: number): void {
    // Calculate emitted waveform
    this.emittedPhase += this.emittedFrequencyProperty.value * dt * Math.PI * 2;
    
    // Update emitted sound data
    this.emittedSoundData.push(Math.sin(this.emittedPhase) * 30);
    this.emittedSoundData.shift();
    
    // Find waves affecting the observer
    const wavesAtObserver: Array<{ wave: any, arrivalTime: number }> = [];
    
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves.get(i);
      
      // Calculate distance from wave origin to observer
      const distanceToObserver = wave.position.distance(this.observerPositionProperty.value);
      
      // Check if wave has reached observer
      if (wave.radius >= distanceToObserver) {
        // Calculate arrival time
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
    
    // Calculate time since wave arrival
    const timeSinceArrival = this.simulationTimeProperty.value - arrivalTime;
    
    // Get phase at arrival from original wave
    const phaseAtArrival = currentWave.phaseAtEmission;
    
    // Calculate Doppler frequency
    const observedFrequency = this.calculateObservedFrequency(currentWave);
    
    // Update the property
    this.observedFrequencyProperty.value = observedFrequency;
    
    // Calculate additional phase based on observed frequency
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
      this.CONSTANTS.PHYSICS.FREQ_MIN,
      Math.min(
        observedFreq,
        wave.sourceFrequency * this.CONSTANTS.PHYSICS.FREQ_MAX_FACTOR
      )
    );
  }
  
  /**
   * Setup a preset scenario with the source moving toward observer
   */
  public setupScenario1(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(5, 0);
    this.observerVelocityProperty.value = new Vector2(0, 0);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = false;
  }
  
  /**
   * Setup a preset scenario with observer moving toward source
   */
  public setupScenario2(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(0, 0);
    this.observerVelocityProperty.value = new Vector2(-5, 0);
    this.sourceMovingProperty.value = false;
    this.observerMovingProperty.value = true;
  }
  
  /**
   * Setup a preset scenario with source and observer moving away from each other
   */
  public setupScenario3(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(-5, 0);
    this.observerVelocityProperty.value = new Vector2(5, 0);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = true;
  }
  
  /**
   * Setup a preset scenario with perpendicular movement
   */
  public setupScenario4(): void {
    this.reset();
    this.sourceVelocityProperty.value = new Vector2(0, 3);
    this.observerVelocityProperty.value = new Vector2(0, -3);
    this.sourceMovingProperty.value = true;
    this.observerMovingProperty.value = true;
  }
}