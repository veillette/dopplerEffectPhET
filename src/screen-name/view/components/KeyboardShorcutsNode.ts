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
  KeyboardHelpSectionRow,
  KeyboardHelpSection
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";
import { 
  KeyboardHelpIconFactory, 
  LetterKeyNode, 
  BasicActionsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent
} from "scenerystack/scenery-phet";

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
        new LetterKeyNode('S'),
        {
          labelInnerContent: strings.a11y.objectSelection.selectSourceStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.selectObserverStringProperty, 
        new LetterKeyNode('O'),
        {
          labelInnerContent: strings.a11y.objectSelection.selectObserverStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.moveObjectStringProperty, 
        KeyboardHelpIconFactory.arrowKeysRowIcon(),
        {
          labelInnerContent: strings.a11y.objectSelection.moveObjectStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.moveObjectStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('W'),
          KeyboardHelpIconFactory.iconToIcon(
            new LetterKeyNode('A'),
            KeyboardHelpIconFactory.iconToIcon(
              new LetterKeyNode('S'),
              new LetterKeyNode('D')
            )
          )
        ),
        {
          labelInnerContent: strings.a11y.objectSelection.moveObjectStringProperty
        }
      ),
    ],{textMaxWidth: TEXT_MAX_WIDTH});
    
    // Create the content for parameter adjustment
    const adjustmentSection = new KeyboardHelpSection(strings.sections.parameterAdjustmentStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.frequencyStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('+'), new LetterKeyNode('-')
        ),
        {
          labelInnerContent: strings.a11y.adjust.frequencyStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.soundSpeedStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode(','), new LetterKeyNode('.')
        ),
        {
          labelInnerContent: strings.a11y.adjust.soundSpeedStringProperty
        }
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for scenarios
    const scenariosSection = new KeyboardHelpSection(strings.sections.scenariosStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.scenarioKeys.freePlayStringProperty, 
        KeyboardHelpIconFactory.iconToIcon(
          new LetterKeyNode('0'),
          new LetterKeyNode('6')
        ),
        {
          labelInnerContent: strings.a11y.scenarioKeys.freePlayStringProperty
        }
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create the content for visibility toggles
    const visibilitySection = new KeyboardHelpSection(strings.sections.visibilityOptionsStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMotionTrailsStringProperty, 
        new LetterKeyNode('T'),
        {
          labelInnerContent: strings.a11y.toggleMotionTrailsStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.toggleMicrophoneStringProperty, 
        new LetterKeyNode('M'),
        {
          labelInnerContent: strings.a11y.toggleMicrophoneStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.controls.toggleHelpStringProperty, 
        new LetterKeyNode('H'),
        {
          labelInnerContent: strings.a11y.controls.toggleHelpStringProperty
        }
      )
    ],{textMaxWidth:  TEXT_MAX_WIDTH});
    
    // Create standard basic actions section (includes tab navigation, space/enter, etc.)
    const basicActionsSection = new BasicActionsKeyboardHelpSection({
      withCheckboxContent: true,
      textMaxWidth: TEXT_MAX_WIDTH
    });
    
    // Use TwoColumnKeyboardHelpContent for better organization
    const helpContent = new TwoColumnKeyboardHelpContent(
      // Left column sections
      [navigationSection, adjustmentSection, scenariosSection], 
      // Right column sections
      [visibilitySection, basicActionsSection]
    );
    
    this.addChild(helpContent);
    
    // Set the background panel size to enclose the content with padding
    helpContent.boundsProperty.link(bounds => {
      backgroundPanel.rectBounds = bounds.dilated(20);
    });
    
    // Position the entire node
    this.center = options.layoutBounds.center;
    
    // Align icons within each group
    KeyboardHelpSection.alignHelpSectionIcons([navigationSection, adjustmentSection, scenariosSection]);
    KeyboardHelpSection.alignHelpSectionIcons([visibilitySection]);
  }
  
  /**
   * Toggle visibility of the keyboard shortcuts
   */
  public toggleVisibility(): void {
    this.visibilityControlProperty.value = !this.visibilityControlProperty.value;
  }
}
