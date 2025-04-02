/**
 * TrailManager.ts
 *
 * Manages a single motion trail for an object in the Doppler Effect simulation.
 */

import {
  Path,
  Shape,
  Color,
  LinearGradient,
  ModelViewTransform2,
  Property,
} from "scenerystack";

// Import position history point interface from model
import { PositionHistoryPoint } from "../../model/SimModel";

/**
 * Manager for handling a single object motion trail
 */
export class TrailManager {
  /**
   * Constructor for the TrailManager
   *
   * @param trailPath - Path node for the trail
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   * @param trailColor - Color for the trail
   * @param visibleProperty - Property controlling trail visibility
   */
  constructor(
    private readonly trailPath: Path,
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly trailColor: Color,
    private readonly visibleProperty: Property<boolean>,
  ) {}

  /**
   * Update motion trail
   *
   * @param trailPoints - History of position points
   */
  public updateTrail(trailPoints: PositionHistoryPoint[]): void {
    // Set visibility based on property
    this.trailPath.visible =
      this.visibleProperty.value && trailPoints.length > 0;

    // If not visible or no points, return early
    if (!this.visibleProperty.value || trailPoints.length === 0) {
      return;
    }

    // Create shape for the trail
    const trailShape = new Shape();

    // First, build a new path with all points
    const oldestPoint = this.modelViewTransform.modelToViewPosition(
      trailPoints[0].position,
    );
    trailShape.moveToPoint(oldestPoint);

    // Add each subsequent point
    for (let i = 1; i < trailPoints.length; i++) {
      const point = this.modelViewTransform.modelToViewPosition(
        trailPoints[i].position,
      );
      trailShape.lineToPoint(point);
    }

    // Update the path with the new shape
    this.trailPath.shape = trailShape;

    // Calculate the gradient direction (from oldest to newest point)
    const startPoint = this.modelViewTransform.modelToViewPosition(
      trailPoints[0].position,
    );
    const endPoint = this.modelViewTransform.modelToViewPosition(
      trailPoints[trailPoints.length - 1].position,
    );

    // Create gradient from oldest to newest point
    const gradient = new LinearGradient(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y
    );

    // Add color stops - transparent at oldest point, full color at newest
    gradient.addColorStop(
      0,
      new Color(this.trailColor.r, this.trailColor.g, this.trailColor.b, 0.1)
    );
    gradient.addColorStop(
      0.5,
      new Color(this.trailColor.r, this.trailColor.g, this.trailColor.b, 0.4)
    );
    gradient.addColorStop(
      1,
      new Color(this.trailColor.r, this.trailColor.g, this.trailColor.b, 0.8)
    );

    // Apply the gradient
    this.trailPath.stroke = gradient;
  }

  /**
   * Reset the trail
   * Clears the trail shape
   */
  public reset(): void {
    // Reset trail to empty shape
    this.trailPath.shape = new Shape();

    // Hide trail
    this.trailPath.visible = false;
  }
}
