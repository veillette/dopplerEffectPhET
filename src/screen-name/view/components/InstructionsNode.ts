/**
 * InstructionsNode.ts
 *
 * Contains the help instructions functionality for the Doppler Effect simulation.
 */

import { Node, PhetFont, Rectangle, Text } from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";
import DopplerEffectColors from "../../../DopplerEffectColors";

// Configuration options for the instructions display
type InstructionsOptions = {
  layoutBounds: {
    centerX: number;
    centerY: number;
    width: number;
  };
};

/**
 * Component that renders the help instructions for the simulation
 */
export class InstructionsNode extends Node {
  // Background for the instructions
  private readonly background: Rectangle;

  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

  /**
   * Constructor for the InstructionsNode
   *
   * @param options - Configuration options
   */
  constructor(options: InstructionsOptions) {
    super({
      visible: false, // Initially hidden
    });

    // Get strings from string manager
    const strings = this.stringManager.getInstructionsStrings();

    // Create background rectangle with semi-transparent white
    this.background = new Rectangle(0, 0, options.layoutBounds.width / 2, 200, {
      fill: DopplerEffectColors.controlPanelBackgroundProperty,
      cornerRadius: 5,
    });
    this.addChild(this.background);

    // Add title
    const title = new Text(strings.titleStringProperty, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      fill: DopplerEffectColors.textColorProperty,
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
        fill: DopplerEffectColors.textColorProperty,
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
