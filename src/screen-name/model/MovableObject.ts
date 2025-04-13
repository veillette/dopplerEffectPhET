import { BooleanProperty, Property, Vector2 } from "scenerystack";
import { PHYSICS, TRAIL } from "./SimConstants";

/**
 * Position history point interface
 */
export interface PositionHistoryPoint {
  position: Vector2; // in meters (m)
  timestamp: number; // in seconds (s)
}

/**
 * MovableObject represents an object that can move in the simulation,
 * such as the sound source or the observer.
 */
export class MovableObject {
  // Position and movement properties
  public readonly positionProperty: Property<Vector2>; // in meters (m)
  public readonly velocityProperty: Property<Vector2>; // in meters per second (m/s)
  public readonly movingProperty: BooleanProperty;

  // Position history for trail
  private positionHistory: PositionHistoryPoint[] = [];
  private lastTrailSampleTime: number = 0;

  /**
   * Create a new movable object
   * @param initialPosition Initial position vector in meters (m)
   */
  constructor(initialPosition: Vector2) {
    this.positionProperty = new Property<Vector2>(initialPosition); // in meters (m)
    this.velocityProperty = new Property<Vector2>(new Vector2(0, 0)); // in meters per second (m/s)
    this.movingProperty = new BooleanProperty(false);
  }

  /**
   * Update position based on velocity and elapsed time
   * @param dt Elapsed time in seconds (s)
   */
  public updatePosition(dt: number): void {
    if (this.movingProperty.value) {
      const position = this.positionProperty.value; // in meters (m)
      const velocity = this.velocityProperty.value; // in meters per second (m/s)

      // Update position based on velocity
      this.positionProperty.value = position.plus(velocity.timesScalar(dt)); // in meters (m)

      // Check if velocity is too small
      if (velocity.magnitude < PHYSICS.MIN_VELOCITY_MAG) {
        // PHYSICS.MIN_VELOCITY_MAG in m/s
        this.movingProperty.value = false;
        this.velocityProperty.value = new Vector2(0, 0);
      }
    }

    // Update position history for trail
    this.updatePositionHistory(dt);
  }

  /**
   * Update position history for trail
   * @param dt Elapsed time in seconds (s)
   */
  private updatePositionHistory(dt: number): void {
    const currentTime = this.lastTrailSampleTime + dt;

    // Only sample at specified intervals
    if (currentTime - this.lastTrailSampleTime >= TRAIL.SAMPLE_INTERVAL) {
      // Record position
      this.positionHistory.push({
        position: this.positionProperty.value.copy(),
        timestamp: currentTime,
      });

      // Update last sample time
      this.lastTrailSampleTime = currentTime;

      // Remove old positions based on age
      this.prunePositionHistory(currentTime);
    }
  }

  /**
   * Remove old positions from history that exceed the maximum age or count
   * @param currentTime Current simulation time in seconds (s)
   */
  private prunePositionHistory(currentTime: number): void {
    const maxAge = currentTime - TRAIL.MAX_AGE;

    // Prune trail
    while (
      this.positionHistory.length > TRAIL.MAX_POINTS ||
      (this.positionHistory.length > 0 &&
        this.positionHistory[0].timestamp < maxAge)
    ) {
      this.positionHistory.shift();
    }
  }

  /**
   * Get the position history for trail visualization
   * @returns Array of position history points
   */
  public getTrailPoints(): PositionHistoryPoint[] {
    return this.positionHistory;
  }

  /**
   * Reset the movable object to its initial position
   * @param initialPosition Position to reset to in meters (m)
   */
  public reset(initialPosition: Vector2): void {
    this.positionProperty.value = initialPosition.copy(); // in meters (m)
    this.velocityProperty.value = new Vector2(0, 0); // in meters per second (m/s)
    this.movingProperty.value = false;

    // Clear position history
    this.positionHistory = [];
    this.lastTrailSampleTime = 0;
  }
}
