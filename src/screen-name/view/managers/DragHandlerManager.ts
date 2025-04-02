/**
 * DragHandlerManager.ts
 * 
 * Manages drag handlers for source and observer objects in the Doppler Effect simulation.
 */

import { 
  DragListener, 
  ModelViewTransform2, 
  Vector2, 
  Property,
  Bounds2 
} from "scenerystack";
import { Node } from "scenerystack";

/**
 * Manager for creating and attaching drag handlers to simulation objects
 */
export class DragHandlerManager {
  private readonly dragBounds: Bounds2;

  /**
   * Constructor for the DragHandlerManager
   * 
   * @param modelViewTransform - Transform between model and view coordinates
   * @param layoutBounds - View bounds for constraining drag
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly layoutBounds: { minX: number; minY: number; maxX: number; maxY: number }
  ) {
    // Create a Bounds2 object from the layoutBounds
    this.dragBounds = new Bounds2(
      layoutBounds.minX,
      layoutBounds.minY,
      layoutBounds.maxX,
      layoutBounds.maxY
    );
  }

  /**
   * Add drag handlers to source and observer nodes
   * 
   * @param sourceNode - The source visual node
   * @param observerNode - The observer visual node
   * @param sourcePositionProperty - Model property for source position
   * @param observerPositionProperty - Model property for observer position
   * @param sourceVelocityProperty - Model property for source velocity
   * @param observerVelocityProperty - Model property for observer velocity
   * @param sourceMovingProperty - Model property for source moving state
   * @param observerMovingProperty - Model property for observer moving state
   * @param onSourceSelected - Callback for when source is selected
   * @param onObserverSelected - Callback for when observer is selected
   * @param maxSpeed - Maximum speed limit for objects
   */
  public attachDragHandlers(
    sourceNode: Node,
    observerNode: Node,
    sourcePositionProperty: Property<Vector2>,
    observerPositionProperty: Property<Vector2>,
    sourceVelocityProperty: Property<Vector2>,
    observerVelocityProperty: Property<Vector2>,
    sourceMovingProperty: Property<boolean>,
    observerMovingProperty: Property<boolean>,
    onSourceSelected: () => void,
    onObserverSelected: () => void,
    maxSpeed: number
  ): void {
    // Source drag handler
    const sourceDragListener = new DragListener({
      targetNode: sourceNode,
      dragBoundsProperty: new Property(this.dragBounds),
      start: (event) => {
        onSourceSelected();

        // Store the initial offset between pointer and source position
        const sourceViewPos = this.modelViewTransform.modelToViewPosition(
          sourcePositionProperty.value,
        );
        (
          sourceDragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = sourceViewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (sourceDragListener as DragListener & { dragOffset: Vector2 }).dragOffset,
        );
        const modelPoint = this.modelViewTransform.viewToModelPosition(viewPoint);

        // Calculate desired velocity (direction to target)
        const desiredVelocity = modelPoint.minus(
          sourcePositionProperty.value,
        );

        // Limit velocity to maximum speed
        if (desiredVelocity.magnitude > maxSpeed) {
          desiredVelocity.normalize().timesScalar(maxSpeed);
        }

        // Apply velocity
        sourceVelocityProperty.value = desiredVelocity;
        sourceMovingProperty.value = true;
      },
    });
    sourceNode.addInputListener(sourceDragListener);

    // Observer drag handler
    const observerDragListener = new DragListener({
      targetNode: observerNode,
      dragBoundsProperty: new Property(this.dragBounds),
      start: (event) => {
        onObserverSelected();

        // Store the initial offset between pointer and observer position
        const observerViewPos = this.modelViewTransform.modelToViewPosition(
          observerPositionProperty.value,
        );
        (
          observerDragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = observerViewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (observerDragListener as DragListener & { dragOffset: Vector2 }).dragOffset,
        );
        const modelPoint = this.modelViewTransform.viewToModelPosition(viewPoint);

        // Calculate desired velocity (direction to target)
        const desiredVelocity = modelPoint.minus(
          observerPositionProperty.value,
        );

        // Limit velocity to maximum speed
        if (desiredVelocity.magnitude > maxSpeed) {
          desiredVelocity.normalize().timesScalar(maxSpeed);
        }

        // Apply velocity
        observerVelocityProperty.value = desiredVelocity;
        observerMovingProperty.value = true;
      },
    });
    observerNode.addInputListener(observerDragListener);
  }
} 