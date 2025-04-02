/**
 * DragHandlerManager.ts
 *
 * Manages a single drag handler for an object in the Doppler Effect simulation.
 */

import {
  DragListener,
  ModelViewTransform2,
  Vector2,
  Property,
  Bounds2,
} from "scenerystack";
import { Node } from "scenerystack";

/**
 * Manager for creating and attaching a drag handler to a simulation object
 */
export class DragHandlerManager {
  private readonly dragBounds: Bounds2;
  private dragListener: DragListener | null = null;

  /**
   * Constructor for the DragHandlerManager
   *
   * @param modelViewTransform - Transform between model and view coordinates
   * @param layoutBounds - View bounds for constraining drag
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly layoutBounds: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    },
  ) {
    // Create a Bounds2 object from the layoutBounds
    this.dragBounds = new Bounds2(
      layoutBounds.minX,
      layoutBounds.minY,
      layoutBounds.maxX,
      layoutBounds.maxY,
    );
  }

  /**
   * Add a drag handler to a node
   *
   * @param targetNode - The visual node to make draggable
   * @param positionProperty - Model property for object position
   * @param velocityProperty - Model property for object velocity
   * @param movingProperty - Model property for object moving state
   * @param onSelected - Callback for when object is selected
   * @param maxSpeed - Maximum speed limit for the object
   */
  public attachDragHandler(
    targetNode: Node,
    positionProperty: Property<Vector2>,
    velocityProperty: Property<Vector2>,
    movingProperty: Property<boolean>,
    onSelected: () => void,
    maxSpeed: number,
  ): void {
    // Create the drag listener
    this.dragListener = new DragListener({
      targetNode: targetNode,
      dragBoundsProperty: new Property(this.dragBounds),
      start: (event) => {
        onSelected();

        // Store the initial offset between pointer and object position
        const viewPos = this.modelViewTransform.modelToViewPosition(
          positionProperty.value,
        );
        (
          this.dragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = viewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (this.dragListener as DragListener & { dragOffset: Vector2 })
            .dragOffset,
        );
        const modelPoint =
          this.modelViewTransform.viewToModelPosition(viewPoint);

        // Calculate desired velocity (direction to target)
        const desiredVelocity = modelPoint.minus(positionProperty.value);

        // Limit velocity to maximum speed
        if (desiredVelocity.magnitude > maxSpeed) {
          desiredVelocity.normalize().timesScalar(maxSpeed);
        }

        // Apply velocity
        velocityProperty.value = desiredVelocity;
        movingProperty.value = true;
      },
    });

    // Add the listener to the target node
    targetNode.addInputListener(this.dragListener);
  }

  /**
   * Remove the drag handler from its target node
   */
  public detachDragHandler(): void {
    if (this.dragListener) {
      const targetNode = this.dragListener.targetNode;
      if (targetNode) {
        targetNode.removeInputListener(this.dragListener);
      }
      this.dragListener = null;
    }
  }
}
