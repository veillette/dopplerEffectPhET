/**
 * TrailManager.ts
 *
 * Manages motion trails for objects in the Doppler Effect simulation.
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
 * Manager for handling object motion trails
 */
export class TrailManager {
  /**
   * Constructor for the TrailManager
   *
   * @param sourceTrail - Path node for the source trail
   * @param observerTrail - Path node for the observer trail
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   * @param sourceColor - Color for the source trail
   * @param observerColor - Color for the observer trail
   * @param visibleProperty - Property controlling trail visibility
   */
  constructor(
    private readonly sourceTrail: Path,
    private readonly observerTrail: Path,
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly sourceColor: Color,
    private readonly observerColor: Color,
    private readonly visibleProperty: Property<boolean>,
  ) {}

  /**
   * Update motion trails for source and observer
   *
   * @param sourceTrailPoints - History of source positions
   * @param observerTrailPoints - History of observer positions
   */
  public updateTrails(
    sourceTrailPoints: PositionHistoryPoint[],
    observerTrailPoints: PositionHistoryPoint[],
  ): void {
    // Set visibility based on property
    this.sourceTrail.visible =
      this.visibleProperty.value && sourceTrailPoints.length > 0;
    this.observerTrail.visible =
      this.visibleProperty.value && observerTrailPoints.length > 0;

    // If not visible or no points, return early
    if (!this.visibleProperty.value) {
      return;
    }

    // Update source trail
    if (sourceTrailPoints.length > 0) {
      this.updateTrail(this.sourceTrail, sourceTrailPoints, this.sourceColor);
    }

    // Update observer trail
    if (observerTrailPoints.length > 0) {
      this.updateTrail(
        this.observerTrail,
        observerTrailPoints,
        this.observerColor,
      );
    }
  }

  /**
   * Update a specific trail
   *
   * @param trailPath - The path node to update
   * @param points - The position history points
   * @param color - The trail color
   */
  private updateTrail(
    trailPath: Path,
    points: PositionHistoryPoint[],
    color: Color,
  ): void {
    // Create shapes for the trails
    const trailShape = new Shape();

    // First, build a new path with all points
    const oldestPoint = this.modelViewTransform.modelToViewPosition(
      points[0].position,
    );
    trailShape.moveToPoint(oldestPoint);

    // Add each subsequent point
    for (let i = 1; i < points.length; i++) {
      const point = this.modelViewTransform.modelToViewPosition(
        points[i].position,
      );
      trailShape.lineToPoint(point);
    }

    // Update the path with the new shape
    trailPath.shape = trailShape;

    // Calculate the gradient direction (from oldest to newest point)
    const startPoint = this.modelViewTransform.modelToViewPosition(
      points[0].position,
    );
    const endPoint = this.modelViewTransform.modelToViewPosition(
      points[points.length - 1].position,
    );

    // Create gradient from oldest to newest point
    const gradient = new LinearGradient(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y,
    );

    // Add color stops - transparent at oldest point, full color at newest
    gradient.addColorStop(0, new Color(color.r, color.g, color.b, 0.1));
    gradient.addColorStop(0.5, new Color(color.r, color.g, color.b, 0.4));
    gradient.addColorStop(1, new Color(color.r, color.g, color.b, 0.8));

    // Apply the gradient
    trailPath.stroke = gradient;
  }

  /**
   * Reset the trail manager
   * Clears all trail shapes
   */
  public reset(): void {
    // Reset trails to empty shapes
    this.sourceTrail.shape = new Shape();
    this.observerTrail.shape = new Shape();

    // Hide trails
    this.sourceTrail.visible = false;
    this.observerTrail.visible = false;
  }
}
