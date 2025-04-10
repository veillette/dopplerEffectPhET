/**
 * StringManager.ts
 *
 * Centralizes string management for the simulation.
 * Provides access to localized strings for all components.
 */

import { LocalizedString, ReadOnlyProperty } from "scenerystack";
import strings_en from "./strings_en.json";
import strings_fr from "./strings_fr.json";

/**
 * Manages all localized strings for the simulation
 */
export class StringManager {
  // The cached singleton instance
  private static instance: StringManager;

  // All string properties organized by category
  private readonly stringProperties;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Create localized string properties
    this.stringProperties = LocalizedString.getNestedStringProperties({
      en: strings_en,
      fr: strings_fr,
    });
  }

  /**
   * Get the singleton instance of StringManager
   * @returns The StringManager instance
   */
  public static getInstance(): StringManager {
    if (!StringManager.instance) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  /**
   * Get strings for status text display
   */
  public getStatusTextStrings() {
    return {
      emittedFrequencyPatternStringProperty:
        this.stringProperties.graphs.emittedFrequencyStringProperty,
      observedFrequencyPatternStringProperty:
        this.stringProperties.graphs.observedFrequencyStringProperty,
      selectedObjectPatternStringProperty:
        this.stringProperties.selectedObjectStringProperty,
      blueshiftStringProperty:
        this.stringProperties.shift.blueshiftStringProperty,
      redshiftStringProperty:
        this.stringProperties.shift.redshiftStringProperty,
      sourceStringProperty: this.stringProperties.sourceStringProperty,
      observerStringProperty: this.stringProperties.observerStringProperty,
    };
  }

  /**
   * Get strings for the control panel
   */
  public getControlPanelStrings() {
    return {
      valuesStringProperty: this.stringProperties.controls.valuesStringProperty,
      velocityArrowsStringProperty:
        this.stringProperties.controls.velocityArrowsStringProperty,
      lineOfSightStringProperty:
        this.stringProperties.controls.lineOfSightStringProperty,
      soundSpeedStringProperty:
        this.stringProperties.controls.soundSpeedStringProperty,
      frequencyStringProperty:
        this.stringProperties.controls.frequencyStringProperty,
      motionTrailsStringProperty:
        this.stringProperties.controls.motionTrailsStringProperty,
      gridStringProperty: this.stringProperties.controls.gridStringProperty,
      metersPerSecondStringProperty:
        this.stringProperties.units.metersPerSecondStringProperty,
      hertzStringProperty: this.stringProperties.units.hertzStringProperty,
      microphoneClicksStringProperty:
        this.stringProperties.controls.microphoneClicksStringProperty,
    };
  }

  /**
   * Get strings for graph display
   */
  public getGraphDisplayStrings() {
    return {
      emittedSoundStringProperty:
        this.stringProperties.graphs.emittedSoundStringProperty,
      observedSoundStringProperty:
        this.stringProperties.graphs.observedSoundStringProperty,
    };
  }

  /**
   * Get strings for instructions panel
   */
  public getInstructionsStrings() {
    return {
      titleStringProperty: this.stringProperties.titleStringProperty,
      dragAndDropStringProperty:
        this.stringProperties.help.dragAndDropStringProperty,
      keyboardControlsStringProperty:
        this.stringProperties.help.keyboardControlsStringProperty,
      sections: {
        navigationStringProperty: this.stringProperties.help.sections.navigationStringProperty,
        simulationControlsStringProperty: this.stringProperties.help.sections.simulationControlsStringProperty,
        parameterAdjustmentStringProperty: this.stringProperties.help.sections.parameterAdjustmentStringProperty,
        scenariosStringProperty: this.stringProperties.help.sections.scenariosStringProperty,
        visibilityOptionsStringProperty: this.stringProperties.help.sections.visibilityOptionsStringProperty
      },
      objectSelection: {
        selectSourceStringProperty: this.stringProperties.help.objectSelection.selectSourceStringProperty,
        selectObserverStringProperty: this.stringProperties.help.objectSelection.selectObserverStringProperty,
        moveObjectStringProperty: this.stringProperties.help.objectSelection.moveObjectStringProperty
      },
      controls: {
        pauseResumeStringProperty: this.stringProperties.help.controls.pauseResumeStringProperty,
        resetStringProperty: this.stringProperties.help.controls.resetStringProperty,
        toggleHelpStringProperty: this.stringProperties.help.controls.toggleHelpStringProperty
      },
      adjust: {
        frequencyStringProperty: this.stringProperties.help.adjust.frequencyStringProperty,
        soundSpeedStringProperty: this.stringProperties.help.adjust.soundSpeedStringProperty
      },
      scenarioKeys: {
        freePlayStringProperty: this.stringProperties.help.scenarioKeys.freePlayStringProperty,
        sourceApproachingStringProperty: this.stringProperties.help.scenarioKeys.sourceApproachingStringProperty,
        sourceRecedingStringProperty: this.stringProperties.help.scenarioKeys.sourceRecedingStringProperty,
        observerApproachingStringProperty: this.stringProperties.help.scenarioKeys.observerApproachingStringProperty,
        observerRecedingStringProperty: this.stringProperties.help.scenarioKeys.observerRecedingStringProperty,
        sameDirectionStringProperty: this.stringProperties.help.scenarioKeys.sameDirectionStringProperty,
        perpendicularStringProperty: this.stringProperties.help.scenarioKeys.perpendicularStringProperty
      },
      toggleMotionTrailsStringProperty:
        this.stringProperties.help.toggleMotionTrailsStringProperty,
      toggleMicrophoneStringProperty:
        this.stringProperties.help.toggleMicrophoneStringProperty,
      dragMicrophoneStringProperty:
        this.stringProperties.help.dragMicrophoneStringProperty,
      a11y: {
        objectSelection: {
          selectSourceStringProperty: this.stringProperties.help.a11y.objectSelection.selectSourceStringProperty,
          selectObserverStringProperty: this.stringProperties.help.a11y.objectSelection.selectObserverStringProperty,
          moveObjectStringProperty: this.stringProperties.help.a11y.objectSelection.moveObjectStringProperty
        },
        controls: {
          pauseResumeStringProperty: this.stringProperties.help.a11y.controls.pauseResumeStringProperty,
          resetStringProperty: this.stringProperties.help.a11y.controls.resetStringProperty,
          toggleHelpStringProperty: this.stringProperties.help.a11y.controls.toggleHelpStringProperty
        },
        adjust: {
          frequencyStringProperty: this.stringProperties.help.a11y.adjust.frequencyStringProperty,
          soundSpeedStringProperty: this.stringProperties.help.a11y.adjust.soundSpeedStringProperty
        },
        scenarioKeys: {
          freePlayStringProperty: this.stringProperties.help.a11y.scenarioKeys.freePlayStringProperty,
          sourceApproachingStringProperty: this.stringProperties.help.a11y.scenarioKeys.sourceApproachingStringProperty,
          sourceRecedingStringProperty: this.stringProperties.help.a11y.scenarioKeys.sourceRecedingStringProperty,
          observerApproachingStringProperty: this.stringProperties.help.a11y.scenarioKeys.observerApproachingStringProperty,
          observerRecedingStringProperty: this.stringProperties.help.a11y.scenarioKeys.observerRecedingStringProperty,
          sameDirectionStringProperty: this.stringProperties.help.a11y.scenarioKeys.sameDirectionStringProperty,
          perpendicularStringProperty: this.stringProperties.help.a11y.scenarioKeys.perpendicularStringProperty
        },
        toggleMotionTrailsStringProperty: this.stringProperties.help.a11y.toggleMotionTrailsStringProperty,
        toggleMicrophoneStringProperty: this.stringProperties.help.a11y.toggleMicrophoneStringProperty
      }
    };
  }

  /**
   * Get the title string property
   */
  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return this.stringProperties.titleStringProperty;
  }

  /**
   * Get the scenario strings for the combo box
   */
  public getScenarioStrings() {
    return {
      freePlayStringProperty:
        this.stringProperties.scenarios.freePlayStringProperty,
      sourceApproachingStringProperty:
        this.stringProperties.scenarios.sourceApproachingStringProperty,
      sourceRecedingStringProperty:
        this.stringProperties.scenarios.sourceRecedingStringProperty,
      observerApproachingStringProperty:
        this.stringProperties.scenarios.observerApproachingStringProperty,
      observerRecedingStringProperty:
        this.stringProperties.scenarios.observerRecedingStringProperty,
      sameDirectionStringProperty:
        this.stringProperties.scenarios.sameDirectionStringProperty,
      perpendicularStringProperty:
        this.stringProperties.scenarios.perpendicularStringProperty,
    };
  }

  /**
   * Get the source and observer string properties
   */
  public getObjectStrings() {
    return {
      sourceStringProperty: this.stringProperties.sourceStringProperty,
      observerStringProperty: this.stringProperties.observerStringProperty,
    };
  }

  /**
   * Get all raw string properties
   * This can be used if direct access is needed to a specific string property
   */
  public getAllStringProperties() {
    return this.stringProperties;
  }
}
