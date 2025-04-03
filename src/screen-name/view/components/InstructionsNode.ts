/**
 * InstructionsNode.ts
 *
 * Contains the help instructions functionality for the Doppler Effect simulation.
 */

import { Node, Rectangle, Text, Color} from "scenerystack";
import { PhetFont } from "scenerystack/scenery-phet";
import { ReadOnlyProperty } from "scenerystack/axon";

// Type for instruction-related strings
type InstructionStrings = {
  titleStringProperty: ReadOnlyProperty<string>;
  dragAndDropStringProperty: ReadOnlyProperty<string>;
  keyboardControlsStringProperty: ReadOnlyProperty<string>;
  objectSelectionStringProperty: ReadOnlyProperty<string>;
  controlsStringProperty: ReadOnlyProperty<string>;
  adjustStringProperty: ReadOnlyProperty<string>;
  scenariosStringProperty: ReadOnlyProperty<string>;
  toggleMotionTrailsStringProperty: ReadOnlyProperty<string>;
  toggleMicrophoneStringProperty: ReadOnlyProperty<string>;
  dragMicrophoneStringProperty: ReadOnlyProperty<string>;
};

// Configuration options for the instructions display
type InstructionsOptions = {
  layoutBounds: {
    centerX: number;
    centerY: number;
    width: number;
  };
  textColor: Color;
};

/**
 * Component that renders the help instructions for the simulation
 */
export class InstructionsNode extends Node {
  // Background for the instructions
  private readonly background: Rectangle;

  /**
   * Constructor for the InstructionsNode
   *
   * @param strings - Text strings for the instructions
   * @param options - Configuration options
   */
  constructor(strings: InstructionStrings, options: InstructionsOptions) {
    super({
      visible: false, // Initially hidden
    });

    // Create background rectangle
    this.background = new Rectangle(0, 0, options.layoutBounds.width / 2, 200, {
      fill: new Color(255, 255, 255, 0.8),
      cornerRadius: 5,
    });
    this.addChild(this.background);

    // Add title
    const title = new Text(strings.titleStringProperty, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      fill: options.textColor,
      centerX: this.background.centerX,
      top: 10,
    });
    this.addChild(title);

    // Instructions text array
    const instructions = [
      strings.dragAndDropStringProperty,
      strings.keyboardControlsStringProperty,
      strings.objectSelectionStringProperty,
      strings.controlsStringProperty,
      strings.adjustStringProperty,
      strings.scenariosStringProperty,
      strings.toggleMotionTrailsStringProperty,
      strings.toggleMicrophoneStringProperty,
      strings.dragMicrophoneStringProperty,
    ];

    // Add instruction lines
    let yPosition = title.bottom + 15;
    instructions.forEach((instruction) => {
      const line = new Text(instruction, {
        font: new PhetFont(14),
        fill: options.textColor,
        left: 15,
        top: yPosition,
      });
      this.addChild(line);
      yPosition = line.bottom + 10;
    });

    // Adjust background to fit content
    this.background.setRectHeight(yPosition + 10);

    // Position the instructions box
    this.centerX = options.layoutBounds.centerX;
    this.centerY = options.layoutBounds.centerY;
  }

  /**
   * Toggle visibility of the instructions
   */
  public toggleVisibility(): void {
    this.visible = !this.visible;
  }
}
