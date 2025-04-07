import { Vector2,BooleanProperty } from "scenerystack";
import { PHYSICS } from "./SimConstants";

import { Property } from "scenerystack";
/**
 * MovableObject represents an object that can move in the simulation,
 * such as the sound source or the observer.
 */
export class MovableObject {
  // Position and movement properties
  public readonly positionProperty: Property<Vector2>; // in meters (m)
  public readonly velocityProperty: Property<Vector2>; // in meters per second (m/s)
  public readonly movingProperty: BooleanProperty;

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
      }
    } else if (
      !this.movingProperty.value &&
      this.velocityProperty.value.magnitude > 0
    ) {
      // Apply velocity decay when not actively moving
      const velocity = this.velocityProperty.value; // in meters per second (m/s)
      this.velocityProperty.value = velocity.timesScalar(
        PHYSICS.VELOCITY_DECAY,
      ); // in meters per second (m/s)
    }
  }

  /**
   * Reset the movable object to its initial position
   * @param initialPosition Position to reset to in meters (m)
   */
  public reset(initialPosition: Vector2): void {
    this.positionProperty.value = initialPosition.copy(); // in meters (m)
    this.velocityProperty.value = new Vector2(0, 0); // in meters per second (m/s)
    this.movingProperty.value = false;
  }
}
