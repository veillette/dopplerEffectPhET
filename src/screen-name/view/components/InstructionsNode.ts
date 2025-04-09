/**
 * InstructionsNode.ts
 *
 * Contains the help instructions functionality for the Doppler Effect simulation.
 */

import { Bounds2, Node, PhetFont, Property, Rectangle, Text } from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";
import DopplerEffectColors from "../../../DopplerEffectColors";

// Configuration options for the instructions display
type InstructionsOptions = {
  visibleProperty: Property<boolean>;
  layoutBounds: Bounds2;
};

/**
 * Component that renders the help instructions for the simulation
 */
export class InstructionsNode extends Node {
  /**
   * Constructor for the InstructionsNode
   *
   * @param options - Configuration options
   */
  constructor(options: InstructionsOptions) {
    super({
      visibleProperty: options.visibleProperty,
    });

    // Get strings from string manager
    const strings = StringManager.getInstance().getInstructionsStrings();

    // Create background rectangle with semi-transparent white
    const background = new Rectangle(0, 0, options.layoutBounds.width / 2, 200, {
      fill: DopplerEffectColors.controlPanelBackgroundColorProperty,
      cornerRadius: 5,
    });
    this.addChild(background);

    // Add title
    const title = new Text(strings.titleStringProperty, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      fill: DopplerEffectColors.textColorProperty,
      centerX: background.centerX,
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
    background.setRectHeight(yPosition + 10);

    // Position the instructions box
    this.center = options.layoutBounds.center;

  }

  /**
   * Toggle visibility of the instructions
   */
  public toggleVisibility(): void {
    this.visibleProperty.value = !this.visibleProperty.value;
  }
}
