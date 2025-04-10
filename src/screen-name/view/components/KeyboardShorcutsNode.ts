/**
 * KeyboardShorcutsNode.ts
 *
 * Contains the keyboard shorcuts functionality for the Doppler Effect simulation.
 */

import {
  Bounds2,
  Node,
  PhetFont,
  Property,
  Text,
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";


// Configuration options for the instructions display
type KeyboardShorcutsOptions = {
  visibleProperty: Property<boolean>;
  layoutBounds: Bounds2;
};

/**
 * Component that renders the help instructions for the simulation
 */
export class KeyboardShorcutsNode extends Node {
  /**
   * Constructor for the InstructionsNode
   *
   * @param options - Configuration options
   */
  constructor(options: KeyboardShorcutsOptions) {
    super({
      visibleProperty: options.visibleProperty,
    });

    // Get strings from string manager
    const strings = StringManager.getInstance().getInstructionsStrings();

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
    let yPosition = 15;
    instructions.forEach((instruction) => {
      const line = new Text(instruction, {
        font: new PhetFont(14),
        fill: "black",
        left: 15,
        top: yPosition,
      });
      this.addChild(line);
      yPosition = line.bottom + 10;
    });

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
