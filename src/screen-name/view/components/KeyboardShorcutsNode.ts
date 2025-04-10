/**
 * KeyboardShorcutsNode.ts
 *
 * Contains the keyboard shortcuts functionality for the Doppler Effect simulation.
 * Implements a structured help dialog with sections and rows for better organization.
 */

import {
  Bounds2,
  Node,
  Property,
  Rectangle,
  VBox,
  KeyboardHelpSectionRow,
  KeyboardHelpSection,
  Text,
  PhetFont
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";
import { KeyboardHelpIconFactory, LetterKeyNode } from "scenerystack/scenery-phet";

// Configuration options for the keyboard shortcuts display
type KeyboardShorcutsOptions = {
  visibleProperty: Property<boolean>;
  layoutBounds: Bounds2;
};

const TEXT_MAX_WIDTH = 1000;

/**
 * Component that renders the keyboard help instructions for the simulation in a structured format
 */
export class KeyboardShorcutsNode extends Node {
  // Store reference to visibility property
  private readonly visibilityControlProperty: Property<boolean>;
  
  /**
   * Constructor for the KeyboardShorcutsNode
   *
   * @param options - Configuration options
   */
  constructor(options: KeyboardShorcutsOptions) {
    super({
      visibleProperty: options.visibleProperty,
    });
    
    this.visibilityControlProperty = options.visibleProperty;

    // Get strings from string manager
    const strings = StringManager.getInstance().getInstructionsStrings();
    
    // Create background panel
    const backgroundPanel = new Rectangle(0, 0, 1, 1, {
      fill: 'rgba(240, 240, 240, 0.9)',
      stroke: 'black',
      cornerRadius: 10
    });
    this.addChild(backgroundPanel);
    
    // Create the content for object movement
    const navigationSection = new KeyboardHelpSection("Navigation", [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelectionStringProperty.value.split("|")[0].trim(), 
        new LetterKeyNode('S')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelectionStringProperty.value.split("|")[1].trim(), 
        new LetterKeyNode('O')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelectionStringProperty.value.split("|")[2].trim(), 
        KeyboardHelpIconFactory.arrowKeysRowIcon()
      ),
    ],{textMaxWidth: TEXT_MAX_WIDTH});
    
    // Create the content for simulation controls
    const controlsSection = new KeyboardHelpSection("Simulation Controls", [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controlsStringProperty.value.split("|")[0].trim(), 
        KeyboardHelpIconFactory.spaceOrEnter()
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controlsStringProperty.value.split("|")[1].trim(), 
        new LetterKeyNode('R')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controlsStringProperty.value.split("|")[2].trim(), 
        new LetterKeyNode('H')
      )
    ],{textMaxWidth: TEXT_MAX_WIDTH});
    
    // Create the content for parameter adjustment
    const adjustmentSection = new KeyboardHelpSection("Parameter Adjustment", [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjustStringProperty.value.split("|")[0].trim(), 
        new Text('+/-', { font: new PhetFont(14) })
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjustStringProperty.value.split("|")[1].trim(), 
        new Text(',/.', { font: new PhetFont(14) })
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for scenarios
    const scenariosSection = new KeyboardHelpSection("Scenarios", [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.scenariosStringProperty.value, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('0'),
          new LetterKeyNode('6')
        )
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for visibility toggles
    const visibilitySection = new KeyboardHelpSection("Visibility Options", [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMotionTrailsStringProperty.value, 
        new LetterKeyNode('T')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMicrophoneStringProperty.value, 
        new LetterKeyNode('M')
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Main content container
    const contentContainer = new VBox({
      align: 'left',
      spacing: 15,
      children: [
        navigationSection,
        controlsSection,
        adjustmentSection,
        scenariosSection,
        visibilitySection,
      ]
    });
    
    this.addChild(contentContainer);
    
    // Set the background panel size to enclose the content with padding
    backgroundPanel.rectBounds = contentContainer.bounds.dilated(20);
    
    // Position the entire node
    this.center = options.layoutBounds.center;
  }
  
  /**
   * Toggle visibility of the keyboard shortcuts
   */
  public toggleVisibility(): void {
    this.visibilityControlProperty.value = !this.visibilityControlProperty.value;
  }
}
