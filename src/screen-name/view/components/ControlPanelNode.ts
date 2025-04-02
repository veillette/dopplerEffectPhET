/**
 * ControlPanelNode.ts
 *
 * Contains the control panel functionality for the Doppler Effect simulation,
 * including checkboxes for visibility options and controls for sound speed and frequency.
 */

import { Node, Color } from "scenerystack";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import {
  Panel,
  VerticalCheckboxGroup,
  VerticalCheckboxGroupItem,
} from "scenerystack/sun";
import { Property } from "scenerystack/axon";
import { Text } from "scenerystack";
import { Range } from "scenerystack/dot";

// Type for the text configuration
type ControlPanelStrings = {
  VALUES: string;
  VELOCITY_ARROWS: string;
  LINE_OF_SIGHT: string;
  SOUND_SPEED: string;
  FREQUENCY: string;
  MOTION_TRAILS: string;
  METERS_PER_SECOND: string;
  HERTZ: string;
  MICROPHONE_CLICKS: string;
};

// Configuration options for the control panel
type ControlPanelOptions = {
  // UI colors
  textColor: Color;

  // References to graph display for positioning
  graphRight: number;
  graphBottom: number;
};

/**
 * Component that renders the control panel for the simulation
 */
export class ControlPanelNode extends Node {
  // The panel component
  private readonly panel: Panel;

  /**
   * Constructor for the ControlPanelNode
   *
   * @param strings - Text strings for the controls
   * @param visibleValuesProperty - Property for toggling value displays
   * @param visibleVelocityArrowProperty - Property for toggling velocity arrows
   * @param visibleLineOfSightProperty - Property for toggling line of sight
   * @param visibleTrailsProperty - Property for toggling motion trails
   * @param microphoneEnabledProperty - Property for toggling microphone
   * @param soundSpeedProperty - Property for controlling sound speed
   * @param emittedFrequencyProperty - Property for controlling emitted frequency
   * @param soundSpeedRange - Range for the sound speed control
   * @param frequencyRange - Range for the frequency control
   * @param options - Configuration options
   */
  constructor(
    strings: ControlPanelStrings,
    visibleValuesProperty: Property<boolean>,
    visibleVelocityArrowProperty: Property<boolean>,
    visibleLineOfSightProperty: Property<boolean>,
    visibleTrailsProperty: Property<boolean>,
    microphoneEnabledProperty: Property<boolean>,
    soundSpeedProperty: Property<number>,
    emittedFrequencyProperty: Property<number>,
    soundSpeedRange: Range,
    frequencyRange: Range,
    options: ControlPanelOptions,
  ) {
    super();

    // Helper function to create checkbox items with consistent styling
    const createCheckboxItem = (
      property: Property<boolean>,
      label: string,
    ): VerticalCheckboxGroupItem => ({
      property,
      createNode: () =>
        new Text(label, {
          font: new PhetFont(14),
          fill: options.textColor,
        }),
    });

    // Create checkbox items
    const items: VerticalCheckboxGroupItem[] = [
      createCheckboxItem(visibleValuesProperty, strings.VALUES),
      createCheckboxItem(visibleVelocityArrowProperty, strings.VELOCITY_ARROWS),
      createCheckboxItem(visibleLineOfSightProperty, strings.LINE_OF_SIGHT),
      createCheckboxItem(visibleTrailsProperty, strings.MOTION_TRAILS),
      createCheckboxItem(microphoneEnabledProperty, strings.MICROPHONE_CLICKS),
    ];

    // Create vertical checkbox group
    const checkboxGroup = new VerticalCheckboxGroup(items);

    // Create sound speed control
    const soundSpeedControl = new NumberControl(
      strings.SOUND_SPEED,
      soundSpeedProperty,
      soundSpeedRange,
      {
        layoutFunction: NumberControl.createLayoutFunction2({ ySpacing: 12 }),
        numberDisplayOptions: {
          valuePattern: strings.METERS_PER_SECOND,
        },
        titleNodeOptions: {
          font: new PhetFont(12),
          maxWidth: 140,
        },
      },
    );
    soundSpeedControl.top = checkboxGroup.bottom + 10;

    // Create frequency control
    const frequencyControl = new NumberControl(
      strings.FREQUENCY,
      emittedFrequencyProperty,
      frequencyRange,
      {
        layoutFunction: NumberControl.createLayoutFunction2({ ySpacing: 12 }),
        numberDisplayOptions: {
          valuePattern: strings.HERTZ,
        },
        titleNodeOptions: {
          font: new PhetFont(12),
          maxWidth: 140,
        },
      },
    );
    frequencyControl.top = soundSpeedControl.bottom + 10;

    // Create the panel content with all controls
    const panelContent = new Node({
      children: [checkboxGroup, soundSpeedControl, frequencyControl],
    });

    // Create the panel with the content
    this.panel = new Panel(panelContent, {
      right: options.graphRight,
      top: options.graphBottom + 10,
    });

    // Add the panel to this node
    this.addChild(this.panel);
  }
}
