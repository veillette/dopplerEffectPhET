/**
 * ViewTransformUtils.ts
 * 
 * Utility class for model-view coordinate transformations in the Doppler Effect simulation.
 */

import { Vector2, ModelViewTransform2 } from "scenerystack";

/**
 * Utility class for handling model-view coordinate transformations
 */
export class ViewTransformUtils {
  /**
   * Constructor for the ViewTransformUtils
   * 
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2
  ) {}

  /**
   * Convert model coordinates (meters) to view coordinates (pixels)
   * 
   * @param modelPoint - Point in model coordinates
   * @returns Point in view coordinates
   */
  public modelToView(modelPoint: Vector2): Vector2 {
    return this.modelViewTransform.modelToViewPosition(modelPoint);
  }

  /**
   * Convert view coordinates (pixels) to model coordinates (meters)
   * 
   * @param viewPoint - Point in view coordinates
   * @returns Point in model coordinates
   */
  public viewToModel(viewPoint: Vector2): Vector2 {
    return this.modelViewTransform.viewToModelPosition(viewPoint);
  }

  /**
   * Convert model distance (meters) to view distance (pixels)
   * 
   * @param modelDelta - Vector representing distance in model coordinates
   * @returns Vector representing distance in view coordinates
   */
  public modelToViewDelta(modelDelta: Vector2): Vector2 {
    return this.modelViewTransform.modelToViewDelta(modelDelta);
  }

  /**
   * Convert model X distance (meters) to view X distance (pixels)
   * 
   * @param distance - X distance in model coordinates
   * @returns X distance in view coordinates
   */
  public modelToViewDeltaX(distance: number): number {
    return this.modelViewTransform.modelToViewDeltaX(distance);
  }

  /**
   * Convert model Y distance (meters) to view Y distance (pixels)
   * 
   * @param distance - Y distance in model coordinates
   * @returns Y distance in view coordinates
   */
  public modelToViewDeltaY(distance: number): number {
    return this.modelViewTransform.modelToViewDeltaY(distance);
  }
} 