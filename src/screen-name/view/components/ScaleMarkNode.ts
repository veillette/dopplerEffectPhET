/**
 * ScaleMarkNode.ts
 *
 * Displays a scale marker that shows the relationship between model units (meters)
 * and view units (pixels). The marker is a simple ruler-like display with a label
 * indicating the model length represented.
 */

import {
  Color,
  Line,
  ModelViewTransform2,
  Node,
  PatternStringProperty,
  PhetFont,
  Property,
  Text,
  ProfileColorProperty
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";

// Configuration options for the scale mark display
type ScaleMarkOptions = {
  textColor: Color | ProfileColorProperty;
  lineColor: Color | ProfileColorProperty;
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
  
  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

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

    // Get color values (handle both Color and ProfileColorProperty)
    const textColor = options.textColor instanceof ProfileColorProperty ? 
      options.textColor : options.textColor;
    const lineColor = options.lineColor instanceof ProfileColorProperty ? 
      options.lineColor : options.lineColor;

    // Calculate the view length that corresponds to the model length
    const scaleViewLength = Math.abs(
      this.modelViewTransform.modelToViewDeltaY(this.scaleModelLength),
    );

    // Create the main scale mark (vertical line)
    this.scaleMark = new Line(0, 0, 0, scaleViewLength, {
      stroke: lineColor,
      lineWidth: 2,
    });

    // Create end marks for the ruler effect
    this.topEndMark = new Line(-5, 0, 5, 0, {
      stroke: lineColor,
      lineWidth: 2,
    });

    // Create bottom end mark
    this.bottomEndMark = new Line(-5, scaleViewLength, 5, scaleViewLength, {
      stroke: lineColor,
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
        stroke: lineColor,
      });

      this.addChild(tickMark);
    }

    // Get the units.meters string from the string manager
    const unitsStringProperty = this.stringManager.getAllStringProperties().units.metersStringProperty;
    
    // Create scale label with pattern string property for localization
    this.scaleLabel = new Text("", {
      font: new PhetFont(14),
      fill: textColor,
      left: 10, // Position label to the right of the scale mark
      centerY: scaleViewLength / 2, // Center label vertically
      stringProperty: new PatternStringProperty(unitsStringProperty, {
        value: this.scaleModelLength
      })
    });

    // Add components to this node
    this.addChild(this.scaleMark);
    this.addChild(this.topEndMark);
    this.addChild(this.bottomEndMark);
    this.addChild(this.scaleLabel);
  }
}
