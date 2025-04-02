/**
 * VectorDisplayManager.ts
 *
 * Manages the display of velocity vectors for the source and observer.
 */

import { ArrowNode, Vector2, ModelViewTransform2 } from "scenerystack";

/**
 * Manager for handling velocity vector visualization
 */
export class VectorDisplayManager {
  /**
   * Constructor for the VectorDisplayManager
   *
   * @param modelViewTransform - Transform between model and view coordinates
   * @param velocityScale - Scale factor for velocity vectors
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly velocityScale: number,
  ) {}

  /**
   * Update the velocity vector visualizations
   *
   * @param sourceVector - Arrow node for the source velocity
   * @param observerVector - Arrow node for the observer velocity
   * @param sourcePosition - Current source position
   * @param observerPosition - Current observer position
   * @param sourceVelocity - Current source velocity
   * @param observerVelocity - Current observer velocity
   */
  public updateVectors(
    sourceVector: ArrowNode,
    observerVector: ArrowNode,
    sourcePosition: Vector2,
    observerPosition: Vector2,
    sourceVelocity: Vector2,
    observerVelocity: Vector2,
  ): void {
    // Update source velocity vector
    this.updateVelocityVector(sourceVector, sourcePosition, sourceVelocity);

    // Update observer velocity vector
    this.updateVelocityVector(
      observerVector,
      observerPosition,
      observerVelocity,
    );
  }

  /**
   * Update a velocity vector visualization
   *
   * @param node - The arrow node to update
   * @param position - Position of the object
   * @param velocity - Velocity of the object
   */
  private updateVelocityVector(
    node: ArrowNode,
    position: Vector2,
    velocity: Vector2,
  ): void {
    // Convert model coordinates to view coordinates
    const viewPosition = this.modelViewTransform.modelToViewPosition(position);

    // Scale velocity vector for visualization
    // First scale by the model-view transform to convert m/s to pixels/s
    // Then scale by velocityScale to make it more visible
    const scaledVelocity = velocity.timesScalar(this.velocityScale);
    const viewVelocity =
      this.modelViewTransform.modelToViewDelta(scaledVelocity);

    // Update arrow node
    node.setTailAndTip(
      viewPosition.x,
      viewPosition.y,
      viewPosition.x + viewVelocity.x,
      viewPosition.y + viewVelocity.y,
    );
  }
}
