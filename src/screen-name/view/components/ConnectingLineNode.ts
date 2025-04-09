import {
  Line,
  Node,
  Vector2,
  ModelViewTransform2,
  TReadOnlyProperty,
  Property,
  PhetFont,
  Range,
  Multilink,
} from "scenerystack";
import DopplerEffectColors from "../../../DopplerEffectColors";
import { NumberDisplay } from "scenerystack/scenery-phet";
import { StringManager } from "../../../i18n/StringManager";
import { SimModel } from "../../model/SimModel";

/**
 * A node that displays a connecting line between two points with a distance label
 */
export class ConnectingLineNode extends Node {
  private readonly line: Line;
  private readonly distanceLabel: NumberDisplay;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly sourcePositionProperty: TReadOnlyProperty<Vector2>;
  private readonly observerPositionProperty: TReadOnlyProperty<Vector2>;
  private readonly visibleValuesProperty: Property<boolean>;
  private readonly stringManager: StringManager = StringManager.getInstance();
  private readonly distanceProperty: TReadOnlyProperty<number>;

  /**
   * @param modelViewTransform - The transform between model and view coordinates
   * @param sourcePositionProperty - The position of the source
   * @param observerPositionProperty - The position of the observer
   * @param visibleValuesProperty - Property controlling visibility of the distance label
   * @param visibleLineOfSightProperty - Property controlling visibility of the line
   * @param simModel - The simulation model containing the source-observer distance property
   */
  public constructor(
    modelViewTransform: ModelViewTransform2,
    sourcePositionProperty: TReadOnlyProperty<Vector2>,
    observerPositionProperty: TReadOnlyProperty<Vector2>,
    visibleValuesProperty: Property<boolean>,
    visibleLineOfSightProperty: Property<boolean>,
    simModel: SimModel
  ) {
    super( {
      visibleProperty: visibleLineOfSightProperty,
    });

    this.modelViewTransform = modelViewTransform;
    this.sourcePositionProperty = sourcePositionProperty;
    this.observerPositionProperty = observerPositionProperty;
    this.visibleValuesProperty = visibleValuesProperty;
    this.distanceProperty = simModel.sourceObserverDistanceProperty;

    // Create the connecting line
    this.line = new Line(0, 0, 0, 0, {
      stroke: DopplerEffectColors.connectingLineColorProperty,
      lineDash: [10, 5],
    });
    this.addChild(this.line);

    // Create NumberDisplay for distance
    this.distanceLabel = new NumberDisplay(
      this.distanceProperty,
      new Range(0, 10000), // Reasonable range for distance in meters
      {
        decimalPlaces: 0,
        textOptions: {
          font: new PhetFont(14),
          fill: DopplerEffectColors.textColorProperty,
        },
        visibleProperty: this.visibleValuesProperty,
        valuePattern: this.stringManager.getAllStringProperties().units.metersStringProperty,
        backgroundFill: "transparent",
        backgroundStroke: null,
        xMargin: 0,
        yMargin: 0,
      }
    );
    this.addChild(this.distanceLabel);

    // Update the line and label when positions change
    Multilink.multilink([this.sourcePositionProperty, this.observerPositionProperty], ( sourcePosition, observerPosition)=>{
       // Convert source and observer positions to view coordinates
    const viewSourcePosition = this.modelViewTransform.modelToViewPosition(sourcePosition    );              
    const viewObserverPosition = this.modelViewTransform.modelToViewPosition(observerPosition)

    // Update the line position
    this.line.setPoint1(viewSourcePosition).setPoint2(viewObserverPosition);

    // Calculate the midpoint between source and observer in view coordinates
    const viewMidPosition = viewSourcePosition.blend(viewObserverPosition, 0.5);

    // Position the label at the midpoint of the line
    this.distanceLabel.center = viewMidPosition.addXY(0,-15); // offset above the line
    });
  }
} 