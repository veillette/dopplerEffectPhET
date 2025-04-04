/**
 * ScaleMarkNode.ts
 *
 * Displays a scale marker that shows the relationship between model units (meters)
 * and view units (pixels). The marker is a simple ruler-like display with a label
 * indicating the model length represented.
 */

import {
  Node,
  Line,
  Text,
  Color,
  Property,
  ModelViewTransform2,
} from "scenerystack";
import { PhetFont } from "scenerystack/scenery-phet";

// Configuration options for the scale mark display
type ScaleMarkOptions = {
  textColor: Color;
  lineColor: Color;
  layoutBounds?: {
    maxX?: number;
    maxY?: number;
  };
  scaleModelLength?: number;
};

/**
 * Component that displays a scale marker for the simulation
 */
export class ScaleMarkNode extends Node {
  private readonly scaleMark: Line;
  private readonly topEndMark: Line;
  private readonly bottomEndMark: Line;
  private readonly scaleLabel: Text;
  private readonly scaleModelLength: number;

  /**
   * Constructor for the ScaleMarkNode
   *
   * @param modelViewTransform - Transform from model coordinates to view coordinates
   * @param visibleValuesProperty - Property that controls visibility of the scale mark
   * @param options - Configuration options
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    visibleValuesProperty: Property<boolean>,
    options: ScaleMarkOptions,
  ) {
    super({
      visibleProperty: visibleValuesProperty,
    });

    // Default scale model length is 100 meters
    this.scaleModelLength = options.scaleModelLength || 100;

    // Calculate the view length that corresponds to the model length
    const scaleViewLength = Math.abs(
      this.modelViewTransform.modelToViewDeltaY(this.scaleModelLength),
    );

    // Create the main scale mark (vertical line)
    this.scaleMark = new Line(0, 0, 0, scaleViewLength, {
      stroke: options.lineColor,
      lineWidth: 2,
    });

    // Create end marks for the ruler effect
    this.topEndMark = new Line(-5, 0, 5, 0, {
      stroke: options.lineColor,
      lineWidth: 2,
    });

    // Create bottom end mark
    this.bottomEndMark = new Line(-5, scaleViewLength, 5, scaleViewLength, {
      stroke: options.lineColor,
      lineWidth: 2,
    });

    // Work out the number of minor tick marks to add
    const numberOfTicks = 4;
    const tickInterval = this.scaleModelLength / (numberOfTicks + 1);

    for (let i = 1; i <= numberOfTicks; i++) {
      const tickPosition = i * tickInterval;
      const tickY = Math.abs(
        this.modelViewTransform.modelToViewDeltaY(tickPosition),
      );

      // Create smaller intermediate tick marks
      const tickMark = new Line(-3, tickY, 3, tickY, {
        stroke: options.lineColor,
      });

      this.addChild(tickMark);
    }

    // Create scale label
    this.scaleLabel = new Text(`${this.scaleModelLength}m`, {
      font: new PhetFont(14),
      fill: options.textColor,
      left: 10, // Position label to the right of the scale mark
      centerY: scaleViewLength / 2, // Center label vertically
    });

    // Add components to this node
    this.addChild(this.scaleMark);
    this.addChild(this.topEndMark);
    this.addChild(this.bottomEndMark);
    this.addChild(this.scaleLabel);
  }
}
