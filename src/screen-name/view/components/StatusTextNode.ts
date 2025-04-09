/**
 * StatusTextNode.ts
 *
 * Displays status text information including frequencies,
 * Doppler shift indicators, and selected object information.
 */

import {
  DerivedProperty,
  Node,
  PatternStringProperty,
  PhetFont,
  ReadOnlyProperty,
  Text,
  ProfileColorProperty,
  Bounds2,
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";

// Configuration options for the status text display
type StatusTextOptions = {
  layoutBounds: Bounds2;
  textColorProperty: ProfileColorProperty;
  blueshiftColorProperty: ProfileColorProperty;
  redshiftColorProperty: ProfileColorProperty;
  graphWidth: number;
  graphHeight: number;
  graphMargin: number;
  graphSpacing: number;
};

/**
 * Component that displays status information for the simulation
 */
export class StatusTextNode extends Node {
  private readonly observedFreqText: Text;
  private readonly shiftStatusText: Text;

  // Store color references
  private readonly textColorProperty: ProfileColorProperty;
  private readonly blueshiftColorProperty: ProfileColorProperty;
  private readonly redshiftColorProperty: ProfileColorProperty;

  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

  /**
   * Constructor for the StatusTextNode
   *
   * @param observedFrequencyProperty - Property for the observed frequency value
   * @param visibleValuesProperty - Property that controls visibility of values
   * @param options - Configuration options
   */
  constructor(
    observedFrequencyProperty: ReadOnlyProperty<number>,
    visibleValuesProperty: ReadOnlyProperty<boolean>,
    options: StatusTextOptions,
  ) {
    super();

    // Store color references for later use
    this.textColorProperty = options.textColorProperty;
    this.blueshiftColorProperty = options.blueshiftColorProperty;
    this.redshiftColorProperty = options.redshiftColorProperty;

    // Get strings from string manager
    const statusStringProperties = this.stringManager.getStatusTextStrings();

    // Create text nodes
    this.observedFreqText = new Text("", {
      font: new PhetFont(14),
      fill: options.textColorProperty,
      visibleProperty: visibleValuesProperty,
      stringProperty: new PatternStringProperty(
        statusStringProperties.observedFrequencyPatternStringProperty,
        {
          value: new DerivedProperty([observedFrequencyProperty], (value) => Number(value.toFixed(1))),
        },
      ),
    });

    // Derived property for shift status text content
    const shiftStatusStringProperty = new DerivedProperty(
      [observedFrequencyProperty],
      (observed) => {
        if (observed > 0) {
          return statusStringProperties.blueshiftStringProperty.value;
        } else if (observed < 0) {
          return statusStringProperties.redshiftStringProperty.value;
        } else {
          return "";
        }
      },
    );

    this.shiftStatusText = new Text("", {
      font: new PhetFont(16),
      fill: options.textColorProperty,
      fontWeight: "bold",
      visibleProperty: visibleValuesProperty,
      stringProperty: shiftStatusStringProperty,
    });

    // Position text elements
    const textX =
      options.layoutBounds.maxX - options.graphMargin - options.graphWidth / 2;

    // Position text elements in the middle of the screen at the top
    this.shiftStatusText.centerX = textX;
    this.shiftStatusText.bottom = 25;

    this.observedFreqText.centerX = textX;
    this.observedFreqText.bottom = this.shiftStatusText.top - 5;

    // Add all elements to this node
    this.addChild(this.observedFreqText);
    this.addChild(this.shiftStatusText);

    // Update the color when frequencies change
    observedFrequencyProperty.link((value: number) => {
      this.updateShiftStatusColor(value);
    });
  }

  /**
   * Update the shift status text color based on frequency comparison
   */
  private updateShiftStatusColor(observed: number): void {
    if (observed > 0) {
      this.shiftStatusText.fill = this.blueshiftColorProperty;
    } else if (observed < 0) {
      this.shiftStatusText.fill = this.redshiftColorProperty;
    } else {
      this.shiftStatusText.fill = this.textColorProperty;
    }
  }
}
