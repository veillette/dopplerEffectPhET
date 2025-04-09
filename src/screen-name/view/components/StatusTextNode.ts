/**
 * StatusTextNode.ts
 *
 * Displays status text information including frequencies,
 * Doppler shift indicators, and selected object information.
 */

import {
  DerivedProperty,
  Node,
  PhetFont,
  ReadOnlyProperty,
  Text,
  ProfileColorProperty,
  Bounds2,
  Range,
} from "scenerystack";
import { StringManager } from "../../../i18n/StringManager";
import { NumberDisplay } from "scenerystack/scenery-phet";

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
  private readonly observedFreqDisplay: NumberDisplay;
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

    // Create NumberDisplay for observed frequency
    this.observedFreqDisplay = new NumberDisplay(observedFrequencyProperty, new Range(-100, 100), {
      decimalPlaces: 1,
      textOptions: {
        font: new PhetFont(14),
        fill: options.textColorProperty
      },
      visibleProperty: visibleValuesProperty,
      valuePattern: statusStringProperties.observedFrequencyPatternStringProperty.value,
      backgroundFill: 'transparent',
      backgroundStroke: null,
      xMargin: 0,
      yMargin: 0
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
    // Calculate the center position for the text elements
    const centerX = options.layoutBounds.centerX;

    // Position observed frequency display near the center, slightly to the left
    this.observedFreqDisplay.centerX = centerX - 100;
    this.observedFreqDisplay.bottom = 25;

    // Position shift status text to the right of the frequency display
    this.shiftStatusText.left = this.observedFreqDisplay.right + 20; // Add some spacing between elements
    this.shiftStatusText.bottom = 25;

    // Add all elements to this node
    this.addChild(this.observedFreqDisplay);
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
