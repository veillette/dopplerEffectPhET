/**
 * MoveableObjectView.ts
 *
 * A component that manages the view of a moveable object, including its trail path and velocity vector.
 */

import {
  Circle,
  ModelViewTransform2,
  Node,
  Property,
  Vector2,
  ProfileColorProperty,
} from "scenerystack";
import { VectorDisplay } from "./VectorDisplay";
import { TrailPath } from "./TrailPath";
import { PositionHistoryPoint } from "../../model/SimModel";

/**
 * Configuration options for the moveable object view
 */
type MoveableObjectViewOptions = {
  radius: number;
  fillColorProperty: ProfileColorProperty;
  velocityArrowColorProperty: ProfileColorProperty;
  trailColorProperty: ProfileColorProperty;
  visibleVelocityArrowProperty: Property<boolean>;
  visibleTrailsProperty: Property<boolean>;
  visibleValuesProperty: Property<boolean>;
  textColorProperty: ProfileColorProperty;
  velocityScale: number;
  trailWidth: number;
  accessibleName: string;
};

/**
 * Component that manages the view of a moveable object
 */
export class MoveableObjectView extends Node {
  private readonly objectNode: Circle;
  private readonly velocityVector: VectorDisplay;
  private readonly trailPath: TrailPath;

  /**
   * Constructor for the MoveableObjectView
   *
   * @param modelViewTransform - Transform between model and view coordinates
   * @param options - Configuration options for the moveable object view
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    options: MoveableObjectViewOptions,
  ) {
    super();

    // Create the object node
    this.objectNode = new Circle(options.radius, {
      fill: options.fillColorProperty,
      cursor: "pointer",
      tagName: "button",
      accessibleName: options.accessibleName,
    });
    this.addChild(this.objectNode);

    // Create the velocity vector display
    this.velocityVector = new VectorDisplay(
      this.modelViewTransform,
      options.velocityScale,
      {
        visibleProperty: options.visibleVelocityArrowProperty,
        fillColorProperty: options.velocityArrowColorProperty,
        strokeColorProperty: options.velocityArrowColorProperty,
        showVelocityValue: true,
        textColorProperty: options.textColorProperty,
        visibleValuesProperty: options.visibleValuesProperty,
      },
    );
    this.addChild(this.velocityVector);

    // Create the trail creator
    this.trailPath = new TrailPath(this.modelViewTransform, {
      trailColorProperty: options.trailColorProperty,
      visibleProperty: options.visibleTrailsProperty,
      trailWidth: options.trailWidth,
    });
    this.addChild(this.trailPath);
  }

  /**
   * Update the object's position, velocity, and trail
   *
   * @param position - Current position of the object
   * @param velocity - Current velocity of the object
   * @param trailPoints - History of position points for the trail
   */
  public update(
    position: Vector2,
    velocity: Vector2,
    trailPoints?: PositionHistoryPoint[],
  ): void {
    // Update object position
    this.objectNode.center =
      this.modelViewTransform.modelToViewPosition(position);

    // Update velocity vector
    this.velocityVector.updateVector(position, velocity);

    // Update trail if trail points are provided
    if (trailPoints !== undefined) {
      this.trailPath.updateTrail(trailPoints);
    }
  }

  /**
   * Reset the object's trail
   */
  public resetTrail(): void {
    this.trailPath.reset();
  }

  /**
   * Get the object node for drag handling
   */
  public getObjectNode(): Circle {
    return this.objectNode;
  }
}
