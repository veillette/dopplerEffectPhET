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

// Configuration options for the keyboard shortcuts display
type KeyboardShorcutsOptions = {
  visibleProperty: Property<boolean>;
  layoutBounds: Bounds2;
};

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
    
    // Helper function to create a simple key icon
    const createKeyIcon = (keyText: string) => {
      const keyRect = new Rectangle(0, 0, 30, 30, {
        fill: 'white',
        stroke: 'black',
        cornerRadius: 5
      });
      
      const keyLabel = new Text(keyText, {
        font: new PhetFont(14),
        fill: 'black',
        center: keyRect.center
      });
      
      return new Node({
        children: [keyRect, keyLabel]
      });
    };
    
    // Create a row icon for arrow keys
    const arrowKeysIcon = new Node({
      children: [
        new Rectangle(0, 0, 80, 30, {
          fill: 'white',
          stroke: 'black',
          cornerRadius: 5
        }),
        new Text('← ↑ ↓ →', {
          font: new PhetFont(14),
          fill: 'black',
          center: new Rectangle(0, 0, 80, 30).center
        })
      ]
    });
    
    // Create the content for object movement
    const navigationSection = new KeyboardHelpSection("Navigation", [
      KeyboardHelpSectionRow.labelWithIcon(strings.objectSelectionStringProperty.value.split("|")[0].trim(), createKeyIcon('S')),
      KeyboardHelpSectionRow.labelWithIcon(strings.objectSelectionStringProperty.value.split("|")[1].trim(), createKeyIcon('O')),
      KeyboardHelpSectionRow.labelWithIcon(strings.objectSelectionStringProperty.value.split("|")[2].trim(), arrowKeysIcon)
    ]);
    
    // Create the content for simulation controls
    const controlsSection = new KeyboardHelpSection("Simulation Controls", [
      KeyboardHelpSectionRow.labelWithIcon(strings.controlsStringProperty.value.split("|")[0].trim(), createKeyIcon('Space')),
      KeyboardHelpSectionRow.labelWithIcon(strings.controlsStringProperty.value.split("|")[1].trim(), createKeyIcon('R')),
      KeyboardHelpSectionRow.labelWithIcon(strings.controlsStringProperty.value.split("|")[2].trim(), createKeyIcon('H'))
    ]);
    
    // Create the content for parameter adjustment
    const adjustmentSection = new KeyboardHelpSection("Parameter Adjustment", [
      KeyboardHelpSectionRow.labelWithIcon(strings.adjustStringProperty.value.split("|")[0].trim(), createKeyIcon('+/-')),
      KeyboardHelpSectionRow.labelWithIcon(strings.adjustStringProperty.value.split("|")[1].trim(), createKeyIcon(',/.'))
    ]);
    
    // Create the content for scenarios
    const scenariosSection = new KeyboardHelpSection("Scenarios", [
      KeyboardHelpSectionRow.labelWithIcon(strings.scenariosStringProperty.value, createKeyIcon('0-6'))
    ]);
    
    // Create the content for visibility toggles
    const visibilitySection = new KeyboardHelpSection("Visibility Options", [
      KeyboardHelpSectionRow.labelWithIcon(strings.toggleMotionTrailsStringProperty.value, createKeyIcon('T')),
      KeyboardHelpSectionRow.labelWithIcon(strings.toggleMicrophoneStringProperty.value, createKeyIcon('M'))
    ]);
    
    // Helper to create a mouse icon
    const createMouseIcon = () => {
      return new Node({
        children: [
          new Rectangle(0, 0, 30, 40, {
            fill: 'white',
            stroke: 'black',
            cornerRadius: 15
          }),
          new Text('🖰', {
            font: new PhetFont(20),
            fill: 'black',
            center: new Rectangle(0, 0, 30, 40).center
          })
        ]
      });
    };
    
    // Create the content for drag and drop
    const interactionSection = new KeyboardHelpSection("Mouse Interaction", [
      KeyboardHelpSectionRow.labelWithIcon(strings.dragAndDropStringProperty.value, createMouseIcon()),
      KeyboardHelpSectionRow.labelWithIcon(strings.dragMicrophoneStringProperty.value, createMouseIcon())
    ]);
    
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
        interactionSection
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
