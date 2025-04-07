/**
 * StringManager.ts
 * 
 * Centralizes string management for the simulation.
 * Provides access to localized strings for all components.
 */

import {
  LocalizedString,
  ReadOnlyProperty,
} from "scenerystack";
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
      emittedFrequencyPatternStringProperty: this.stringProperties.graphs.emittedFrequencyStringProperty,
      observedFrequencyPatternStringProperty: this.stringProperties.graphs.observedFrequencyStringProperty,
      selectedObjectPatternStringProperty: this.stringProperties.selectedObjectStringProperty,
      blueshiftStringProperty: this.stringProperties.shift.blueshiftStringProperty,
      redshiftStringProperty: this.stringProperties.shift.redshiftStringProperty,
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
      velocityArrowsStringProperty: this.stringProperties.controls.velocityArrowsStringProperty,
      lineOfSightStringProperty: this.stringProperties.controls.lineOfSightStringProperty,
      soundSpeedStringProperty: this.stringProperties.controls.soundSpeedStringProperty,
      frequencyStringProperty: this.stringProperties.controls.frequencyStringProperty,
      motionTrailsStringProperty: this.stringProperties.controls.motionTrailsStringProperty,
      metersPerSecondStringProperty: this.stringProperties.units.metersPerSecondStringProperty,
      hertzStringProperty: this.stringProperties.units.hertzStringProperty,
      microphoneClicksStringProperty: this.stringProperties.controls.microphoneClicksStringProperty,
    };
  }

  /**
   * Get strings for graph display
   */
  public getGraphDisplayStrings() {
    return {
      emittedSoundStringProperty: this.stringProperties.graphs.emittedSoundStringProperty,
      observedSoundStringProperty: this.stringProperties.graphs.observedSoundStringProperty,
    };
  }

  /**
   * Get strings for instructions panel
   */
  public getInstructionsStrings() {
    return {
      titleStringProperty: this.stringProperties.titleStringProperty,
      dragAndDropStringProperty: this.stringProperties.help.dragAndDropStringProperty,
      keyboardControlsStringProperty: this.stringProperties.help.keyboardControlsStringProperty,
      objectSelectionStringProperty: this.stringProperties.help.objectSelectionStringProperty,
      controlsStringProperty: this.stringProperties.help.controlsStringProperty,
      adjustStringProperty: this.stringProperties.help.adjustStringProperty,
      scenariosStringProperty: this.stringProperties.help.scenariosStringProperty,
      toggleMotionTrailsStringProperty: this.stringProperties.help.toggleMotionTrailsStringProperty,
      toggleMicrophoneStringProperty: this.stringProperties.help.toggleMicrophoneStringProperty,
      dragMicrophoneStringProperty: this.stringProperties.help.dragMicrophoneStringProperty,
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
      freePlayStringProperty: this.stringProperties.scenarios.freePlayStringProperty,
      sourceMovingTowardObserverStringProperty: this.stringProperties.scenarios.sourceMovingTowardObserverStringProperty,
      observerMovingTowardSourceStringProperty: this.stringProperties.scenarios.observerMovingTowardSourceStringProperty,
      movingAwayStringProperty: this.stringProperties.scenarios.movingAwayStringProperty,
      perpendicularStringProperty: this.stringProperties.scenarios.perpendicularStringProperty,
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