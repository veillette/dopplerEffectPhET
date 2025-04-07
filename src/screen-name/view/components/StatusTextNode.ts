/**
 * StatusTextNode.ts
 *
 * Displays status text information including frequencies,
 * Doppler shift indicators, and selected object information.
 */

import {
  Color,
  DerivedProperty,
  Node,
  PatternStringProperty,
  PhetFont,
  ReadOnlyProperty,
  Text,
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";

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

  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

  /**
   * Constructor for the StatusTextNode
   *
   * @param emittedFrequencyProperty - Property for the emitted frequency value
   * @param observedFrequencyProperty - Property for the observed frequency value
   * @param selectedObjectNameProperty - Property for the selected object name
   * @param visibleValuesProperty - Property that controls visibility of values
   * @param options - Configuration options
   */
  constructor(
    emittedFrequencyProperty: ReadOnlyProperty<number>,
    observedFrequencyProperty: ReadOnlyProperty<number>,
    selectedObjectNameProperty: ReadOnlyProperty<string>,
    visibleValuesProperty: ReadOnlyProperty<boolean>,
    options: StatusTextOptions,
  ) {
    super();

    // Get strings from string manager
    const statusStringProperties = this.stringManager.getStatusTextStrings();

    // Create text nodes
    this.emittedFreqText = new Text(emittedFrequencyProperty.value, {
      font: new PhetFont(14),
      fill: options.textColor,
      visibleProperty: visibleValuesProperty,
      stringProperty: new PatternStringProperty(
        statusStringProperties.emittedFrequencyPatternStringProperty,
        {
          value: emittedFrequencyProperty,
        },
      ),
    });

    this.observedFreqText = new Text(observedFrequencyProperty.value, {
      font: new PhetFont(14),
      fill: options.textColor,
      visibleProperty: visibleValuesProperty,
      stringProperty: new PatternStringProperty(
        statusStringProperties.observedFrequencyPatternStringProperty,
        {
          value: observedFrequencyProperty,
        },
      ),
    });

    this.selectedObjectText = new Text("", {
      font: new PhetFont(14),
      fill: options.selectionColor,
      visibleProperty: visibleValuesProperty,
      stringProperty: new PatternStringProperty(
        statusStringProperties.selectedObjectPatternStringProperty,
        {
          object: selectedObjectNameProperty,
        },
      ),
    });

    // Derived property for shift status text content
    const shiftStatusStringProperty = new DerivedProperty(
      [emittedFrequencyProperty, observedFrequencyProperty],
      (emitted, observed) => {
        if (observed > emitted) {
          return statusStringProperties.blueshiftStringProperty.value;
        } else if (observed < emitted) {
          return statusStringProperties.redshiftStringProperty.value;
        } else {
          return "";
        }
      },
    );

    this.shiftStatusText = new Text("", {
      font: new PhetFont(16),
      fill: options.textColor,
      fontWeight: "bold",
      visibleProperty: visibleValuesProperty,
      stringProperty: shiftStatusStringProperty,
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
}
