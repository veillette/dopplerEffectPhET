/**
 * StatusTextNode.ts
 *
 * Displays status text information including frequencies,
 * Doppler shift indicators, and selected object information.
 */

import { Node, Text, Color, Property } from "scenerystack";
import { PhetFont } from "scenerystack/scenery-phet";

// Type for status text-related strings
type StatusStrings = {
  EMITTED_FREQUENCY: string;
  OBSERVED_FREQUENCY: string;
  SELECTED_OBJECT: string;
  BLUESHIFT: string;
  REDSHIFT: string;
  SOURCE: string;
  OBSERVER: string;
};

// Configuration options for the status text display
type StatusTextOptions = {
  layoutBounds: {
    maxX: number;
    maxY: number;
  };
  textColor: Color;
  blueshiftColor: Color;
  redshiftColor: Color;
  selectionColor: Color;
  graphWidth: number;
  graphHeight: number;
  graphMargin: number;
  graphSpacing: number;
};

/**
 * Component that displays status information for the simulation
 */
export class StatusTextNode extends Node {
  private readonly emittedFreqText: Text;
  private readonly observedFreqText: Text;
  private readonly selectedObjectText: Text;
  private readonly shiftStatusText: Text;
  private readonly strings: StatusStrings;

  /**
   * Constructor for the StatusTextNode
   *
   * @param strings - Text strings to display
   * @param visibleValuesProperty - Property that controls visibility of values
   * @param options - Configuration options
   */
  constructor(
    strings: StatusStrings,
    private readonly visibleValuesProperty: Property<boolean>,
    options: StatusTextOptions,
  ) {
    super();

    this.strings = strings;

    // Create text nodes
    this.emittedFreqText = new Text("", {
      font: new PhetFont(14),
      fill: options.textColor,
      visibleProperty: visibleValuesProperty,
    });

    this.observedFreqText = new Text("", {
      font: new PhetFont(14),
      fill: options.textColor,
      visibleProperty: visibleValuesProperty,
    });

    this.selectedObjectText = new Text("", {
      font: new PhetFont(14),
      fill: options.selectionColor,
      visibleProperty: visibleValuesProperty,
    });

    this.shiftStatusText = new Text("", {
      font: new PhetFont(16),
      fill: options.textColor,
      fontWeight: "bold",
      visibleProperty: visibleValuesProperty,
    });

    // Position text elements
    const textX =
      options.layoutBounds.maxX - options.graphMargin - options.graphWidth / 2;

    // TODO: improve positioning
    // Position text elements above the graphs
    this.shiftStatusText.centerX = textX;
    this.shiftStatusText.bottom = 25; // Position above the first graph

    this.selectedObjectText.centerX = textX;
    this.selectedObjectText.bottom = this.shiftStatusText.top - 10;

    this.observedFreqText.centerX = textX;
    this.observedFreqText.bottom = this.selectedObjectText.top - 5;

    this.emittedFreqText.centerX = textX;
    this.emittedFreqText.bottom = this.observedFreqText.top - 5;

    // Add all elements to this node
    this.addChild(this.emittedFreqText);
    this.addChild(this.observedFreqText);
    this.addChild(this.selectedObjectText);
    this.addChild(this.shiftStatusText);
  }

  /**
   * Update the displayed values
   *
   * @param emittedFrequency - The emitted frequency value
   * @param observedFrequency - The observed frequency value
   * @param selectedObjectName - The name of the selected object
   */
  public updateValues(
    emittedFrequency: number,
    observedFrequency: number,
    selectedObjectName: string,
  ): void {
    // Update frequency text displays
    this.emittedFreqText.string = this.strings.EMITTED_FREQUENCY.replace(
      "{{value}}",
      emittedFrequency.toFixed(2),
    );

    this.observedFreqText.string = this.strings.OBSERVED_FREQUENCY.replace(
      "{{value}}",
      observedFrequency.toFixed(2),
    );

    // Update selected object text
    this.selectedObjectText.string = this.strings.SELECTED_OBJECT.replace(
      "{{object}}",
      selectedObjectName,
    );

    // Update Doppler shift status text
    if (observedFrequency > emittedFrequency) {
      this.shiftStatusText.string = this.strings.BLUESHIFT;
      this.shiftStatusText.fill = this.visibleValuesProperty.value
        ? new Color(40, 40, 255)
        : new Color(0, 0, 0, 0);
    } else if (observedFrequency < emittedFrequency) {
      this.shiftStatusText.string = this.strings.REDSHIFT;
      this.shiftStatusText.fill = this.visibleValuesProperty.value
        ? new Color(255, 40, 40)
        : new Color(0, 0, 0, 0);
    } else {
      this.shiftStatusText.string = "";
    }
  }
}
