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
  KeyboardHelpSection
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
    const navigationSection = new KeyboardHelpSection(strings.sections.navigationStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.selectSourceStringProperty, 
        new LetterKeyNode('S')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.selectObserverStringProperty, 
        new LetterKeyNode('O')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.moveObjectStringProperty, 
        KeyboardHelpIconFactory.arrowKeysRowIcon()
      ),
    ],{textMaxWidth: TEXT_MAX_WIDTH});
    
    // Create the content for simulation controls
    const controlsSection = new KeyboardHelpSection(strings.sections.simulationControlsStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controls.pauseResumeStringProperty, 
        KeyboardHelpIconFactory.spaceOrEnter()
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controls.resetStringProperty, 
        new LetterKeyNode('R')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controls.toggleHelpStringProperty, 
        new LetterKeyNode('H')
      )
    ],{textMaxWidth: TEXT_MAX_WIDTH});
    
    // Create the content for parameter adjustment
    const adjustmentSection = new KeyboardHelpSection(strings.sections.parameterAdjustmentStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.frequencyStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('+'), new LetterKeyNode('-')
        )
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.soundSpeedStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode(','), new LetterKeyNode('.')
        )
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for scenarios
    const scenariosSection = new KeyboardHelpSection(strings.sections.scenariosStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.scenariosStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('0'),
          new LetterKeyNode('6')
        )
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for visibility toggles
    const visibilitySection = new KeyboardHelpSection(strings.sections.visibilityOptionsStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMotionTrailsStringProperty, 
        new LetterKeyNode('T')
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMicrophoneStringProperty, 
        new LetterKeyNode('M')
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Align icons for each group of related sections
    KeyboardHelpSection.alignHelpSectionIcons([navigationSection, controlsSection]);
    KeyboardHelpSection.alignHelpSectionIcons([adjustmentSection, scenariosSection]);
    KeyboardHelpSection.alignHelpSectionIcons([visibilitySection]);
    
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
    contentContainer.boundsProperty.link(bounds => {
      backgroundPanel.rectBounds = bounds.dilated(20);
    });
    
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
