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

// Interface for the text configuration
interface ControlPanelStrings {
  VALUES: string;
  VELOCITY_ARROWS: string;
  LINE_OF_SIGHT: string;
  SOUND_SPEED: string;
  FREQUENCY: string;
  MOTION_TRAILS: string;
  METERS_PER_SECOND: string;
  HERTZ: string;
}

// Configuration options for the control panel
interface ControlPanelOptions {
  // UI colors
  textColor: Color;

  // References to graph display for positioning
  graphRight: number;
  graphBottom: number;
}

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

    // Create checkbox items
    const items: VerticalCheckboxGroupItem[] = [
      {
        property: visibleValuesProperty,
        createNode: () =>
          new Text(strings.VALUES, {
            font: new PhetFont(14),
            fill: options.textColor,
          }),
      },
      {
        property: visibleVelocityArrowProperty,
        createNode: () =>
          new Text(strings.VELOCITY_ARROWS, {
            font: new PhetFont(14),
            fill: options.textColor,
          }),
      },
      {
        property: visibleLineOfSightProperty,
        createNode: () =>
          new Text(strings.LINE_OF_SIGHT, {
            font: new PhetFont(14),
            fill: options.textColor,
          }),
      },
      {
        property: visibleTrailsProperty,
        createNode: () =>
          new Text(strings.MOTION_TRAILS, {
            font: new PhetFont(14),
            fill: options.textColor,
          }),
      },
      {
        property: microphoneEnabledProperty,
        createNode: () =>
          new Text("Microphone Clicks", {
            font: new PhetFont(14),
            fill: options.textColor,
          }),
      },
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
