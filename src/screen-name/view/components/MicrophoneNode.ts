/**
 * MicrophoneNode.ts
 *
 * Represents a visual microphone node that can be dragged around the simulation
 * and react to sound waves passing through it.
 */

import {
  Bounds2,
  Circle,
  DragListener,
  ModelViewTransform2,
  Node,
  Path,
  Property,
  Rectangle,
  Shape,
  Vector2,
} from "scenerystack";
import { Sound } from "../utils/Sound";
import DopplerEffectColors from "../../../DopplerEffectColors";

// Constants for microphone visualization and behavior
const MICROPHONE = {
  // Size constants
  BODY_RADIUS: 15,
  DETECTION_RING_RADIUS: 20,
  STEM_WIDTH: 10,
  STEM_HEIGHT: 30,
  BASE_WIDTH: 24,
  BASE_HEIGHT: 8,
  GRID_SIZE: 4,
  GRID_EXTENT: 10,

  // Positioning constants
  STEM_X_OFFSET: -5,
  STEM_Y_OFFSET: 10,
  BASE_X_OFFSET: -12,
  BASE_Y_OFFSET: 35,

  // Styling constants
  BODY_COLOR_PROPERTY: DopplerEffectColors.microphoneBodyColorProperty,
  STEM_COLOR_PROPERTY: DopplerEffectColors.microphoneStemColorProperty,
  BASE_COLOR_PROPERTY: DopplerEffectColors.microphoneBaseColorProperty,
  GRID_COLOR_PROPERTY: DopplerEffectColors.microphoneGridColorProperty,
  DETECTION_RING_COLOR_PROPERTY:
    DopplerEffectColors.microphoneDetectionRingColorProperty,
  BASE_CORNER_RADIUS: 3,
  GRID_LINE_WIDTH: 1,
  DETECTION_RING_LINE_WIDTH: 2,

  // Timing constants
  DETECTION_FLASH_DURATION: 100, // milliseconds
};

/**
 * MicrophoneNode that can be positioned within the simulation and
 * plays a sound when a wave passes through it
 */
export class MicrophoneNode extends Node {
  // Microphone visual elements
  private readonly detectionRing: Circle;
  private readonly clickSound: Sound;

  /**
   * Create a new microphone node
   *
   * @param modelViewTransform - Transform between model and view coordinates
   * @param microphonePositionProperty - Property to track microphone position in model coordinates
   * @param waveDetectedProperty - Property that indicates when a wave passes through the microphone
   * @param dragBoundsProperty - Property that defines the allowed drag bounds
   */
  constructor(
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly microphonePositionProperty: Property<Vector2>,
    private readonly waveDetectedProperty: Property<boolean>,
    dragBoundsProperty: Property<Bounds2>,
  ) {
    super({
      cursor: "pointer",
    });

    // Create microphone body - a circle with stem
    const micBody = new Circle(MICROPHONE.BODY_RADIUS, {
      fill: MICROPHONE.BODY_COLOR_PROPERTY,
    });

    // Create microphone stem
    const micStem = new Rectangle(
      MICROPHONE.STEM_X_OFFSET,
      MICROPHONE.STEM_Y_OFFSET,
      MICROPHONE.STEM_WIDTH,
      MICROPHONE.STEM_HEIGHT,
      {
        fill: MICROPHONE.STEM_COLOR_PROPERTY,
      },
    );

    // Create microphone base
    const micBase = new Rectangle(
      MICROPHONE.BASE_X_OFFSET,
      MICROPHONE.BASE_Y_OFFSET,
      MICROPHONE.BASE_WIDTH,
      MICROPHONE.BASE_HEIGHT,
      {
        fill: MICROPHONE.BASE_COLOR_PROPERTY,
        cornerRadius: MICROPHONE.BASE_CORNER_RADIUS,
      },
    );

    // Create microphone grid pattern
    const gridPattern = new Path(new Shape(), {
      stroke: MICROPHONE.GRID_COLOR_PROPERTY,
      lineWidth: MICROPHONE.GRID_LINE_WIDTH,
    });

    // Draw horizontal grid lines
    const gridShape = new Shape();
    for (
      let y = -MICROPHONE.GRID_EXTENT;
      y <= MICROPHONE.GRID_EXTENT;
      y += MICROPHONE.GRID_SIZE
    ) {
      gridShape.moveTo(-MICROPHONE.GRID_EXTENT, y);
      gridShape.lineTo(MICROPHONE.GRID_EXTENT, y);
    }

    // Draw vertical grid lines
    for (
      let x = -MICROPHONE.GRID_EXTENT;
      x <= MICROPHONE.GRID_EXTENT;
      x += MICROPHONE.GRID_SIZE
    ) {
      gridShape.moveTo(x, -MICROPHONE.GRID_EXTENT);
      gridShape.lineTo(x, MICROPHONE.GRID_EXTENT);
    }

    gridPattern.shape = gridShape;

    // Add components to microphone node
    this.addChild(micStem);
    this.addChild(micBase);
    this.addChild(micBody);
    this.addChild(gridPattern);

    // Add highlight ring that shows when detecting waves
    this.detectionRing = new Circle(MICROPHONE.DETECTION_RING_RADIUS, {
      stroke: MICROPHONE.DETECTION_RING_COLOR_PROPERTY,
      lineWidth: MICROPHONE.DETECTION_RING_LINE_WIDTH,
      visible: false,
    });
    this.addChild(this.detectionRing);

    // Create and load click sound
    this.clickSound = new Sound("./assets/click.wav", true);

    // Position microphone at initial position
    this.center = this.modelViewTransform.modelToViewPosition(
      this.microphonePositionProperty.value,
    );

    // Add drag listener with proper offset handling
    const micDragListener = new DragListener({
      targetNode: this,
      transform: this.modelViewTransform,
      positionProperty: this.microphonePositionProperty,
      dragBoundsProperty: dragBoundsProperty,
    });
    this.addInputListener(micDragListener);

    this.microphonePositionProperty.lazyLink(this.updatePosition.bind(this));

    // Add listener for wave detection
    this.waveDetectedProperty.lazyLink(this.handleWaveDetection.bind(this));
  }

  /**
   * Handle wave detection events
   * @param detected - Whether a wave was detected
   */
  private handleWaveDetection(detected: boolean): void {
    if (detected) {
      // Show detection ring
      this.detectionRing.visible = true;

      // Play click sound
      this.clickSound.play();

      // Hide ring after a short delay
      setTimeout(() => {
        this.detectionRing.visible = false;
      }, MICROPHONE.DETECTION_FLASH_DURATION);
    }
  }

  /**
   * Update the microphone position based on the model property
   */
  private updatePosition(): void {
    this.center = this.modelViewTransform.modelToViewPosition(
      this.microphonePositionProperty.value,
    );
  }
}
