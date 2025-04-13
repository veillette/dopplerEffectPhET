/**
 * TrailNode.ts
 *
 * Creates and manages motion trails for objects in the Doppler Effect simulation.
 * This class combines the creation of the trail path and its management.
 */

import {
  Path,
  Shape,
  Color,
  LinearGradient,
  ModelViewTransform2,
  Property,
  ProfileColorProperty,
  Node,
} from "scenerystack";

// Import position history point interface from model
import { PositionHistoryPoint } from "../../model/SimModel";

/**
 * Configuration options for the trail creator
 */
type TrailNodeOptions = {
  trailColorProperty: ProfileColorProperty;
  visibleProperty: Property<boolean>;
  trailWidth: number;
};

/**
 * Creates and manages motion trails for objects
 */
export class TrailNode extends Node {
  private readonly trailPath: Path;
  private trailColorValue: Color;

  /**
   * Constructor for the TrailNode
   *
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   * @param options - Configuration options for the trail
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    options: TrailNodeOptions,
  ) {
    super();

    // Create the trail path
    this.trailPath = new Path(new Shape(), {
      stroke: options.trailColorProperty,
      lineWidth: options.trailWidth,
      visibleProperty: options.visibleProperty,
      tagName: null,
    });
    this.addChild(this.trailPath);

        // Store initial color value and listen for changes
        this.trailColorValue = options.trailColorProperty.value;
        options.trailColorProperty.link((newColor) => {
          // Update the trail with the new color (it will be used next time updateTrail is called)
          this.trailColorValue = newColor;
          // If the trail is currently visible, update it immediately
          if (this.trailPath.visible) {
            // Force an update of the trail's gradient the next time updateTrail is called
            this.trailPath.stroke = newColor;
          }
        });
  }

  /**
   * Update motion trail
   *
   * @param trailPoints - History of position points
   */
  public updateTrail(trailPoints: PositionHistoryPoint[]): void {
    // Set visibility based on property and points
    this.trailPath.visible =
      this.trailPath.visible && trailPoints.length > 0;

    // If not visible or no points, return early
    if (!this.trailPath.visible || trailPoints.length === 0) {
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
      endPoint.y,
    );

    // Add color stops - transparent at oldest point, full color at newest
    gradient.addColorStop(
      0,
      new Color(
        this.trailColorValue.r,
        this.trailColorValue.g,
        this.trailColorValue.b,
        0.1,
      ),
    );
    gradient.addColorStop(
      0.5,
      new Color(
        this.trailColorValue.r,
        this.trailColorValue.g,
        this.trailColorValue.b,
        0.4,
      ),
    );
    gradient.addColorStop(
      1,
      new Color(
        this.trailColorValue.r,
        this.trailColorValue.g,
        this.trailColorValue.b,
        0.8,
      ),
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