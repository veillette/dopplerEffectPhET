/**
 * DopplerEffectKeyboardHelpContent.ts
 *
 * Content for the standard keyboard-help dialog (the "?" button joist adds to
 * the navigation bar). Mirrors the keys wired up in the screen view: selecting
 * and moving the source/observer, adjusting frequency and sound speed, choosing
 * preset scenarios, and toggling the motion trails, microphone and help. The
 * basic-actions section covers Tab navigation, buttons and checkboxes.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  LetterKeyNode,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class DopplerEffectKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getInstructionsStrings();

    // Selecting and moving the source/observer.
    const navigationSection = new KeyboardHelpSection(strings.sections.navigationStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(strings.objectSelection.selectSourceStringProperty, new LetterKeyNode("S"), {
        labelInnerContent: strings.a11y.objectSelection.selectSourceStringProperty,
      }),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.selectObserverStringProperty,
        new LetterKeyNode("O"),
        {
          labelInnerContent: strings.a11y.objectSelection.selectObserverStringProperty,
        },
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.objectSelection.moveObjectStringProperty,
        KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon(),
        {
          labelInnerContent: strings.a11y.objectSelection.moveObjectStringProperty,
        },
      ),
    ]);

    // Adjusting frequency (+/-) and sound speed (,/.).
    const adjustmentSection = new KeyboardHelpSection(strings.sections.parameterAdjustmentStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.frequencyStringProperty,
        KeyboardHelpIconFactory.iconToIcon(new LetterKeyNode("+"), new LetterKeyNode("-")),
        {
          labelInnerContent: strings.a11y.adjust.frequencyStringProperty,
        },
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        strings.adjust.soundSpeedStringProperty,
        KeyboardHelpIconFactory.iconToIcon(new LetterKeyNode(","), new LetterKeyNode(".")),
        {
          labelInnerContent: strings.a11y.adjust.soundSpeedStringProperty,
        },
      ),
    ]);

    // Choosing a preset scenario (0–6).
    const scenariosSection = new KeyboardHelpSection(strings.sections.scenariosStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        strings.scenarioKeys.freePlayStringProperty,
        KeyboardHelpIconFactory.iconToIcon(new LetterKeyNode("0"), new LetterKeyNode("6")),
        {
          labelInnerContent: strings.a11y.scenarioKeys.freePlayStringProperty,
        },
      ),
    ]);

    // Toggling motion trails (T), microphone (M) and help (H).
    const visibilitySection = new KeyboardHelpSection(strings.sections.visibilityOptionsStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(strings.toggleMotionTrailsStringProperty, new LetterKeyNode("T"), {
        labelInnerContent: strings.a11y.toggleMotionTrailsStringProperty,
      }),
      KeyboardHelpSectionRow.labelWithIcon(strings.toggleMicrophoneStringProperty, new LetterKeyNode("M"), {
        labelInnerContent: strings.a11y.toggleMicrophoneStringProperty,
      }),
      KeyboardHelpSectionRow.labelWithIcon(strings.controls.toggleHelpStringProperty, new LetterKeyNode("H"), {
        labelInnerContent: strings.a11y.controls.toggleHelpStringProperty,
      }),
    ]);

    // Standard basic actions: Tab navigation, buttons, checkboxes, Reset All, Escape.
    const basicActionsSection = new BasicActionsKeyboardHelpSection({ withCheckboxContent: true });

    // Align the icon columns within each column's custom sections.
    KeyboardHelpSection.alignHelpSectionIcons([navigationSection, adjustmentSection, scenariosSection]);
    KeyboardHelpSection.alignHelpSectionIcons([visibilitySection]);

    super([navigationSection, adjustmentSection, scenariosSection], [visibilitySection, basicActionsSection]);
  }
}
