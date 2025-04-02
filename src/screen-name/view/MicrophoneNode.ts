/**
 * MicrophoneNode.ts
 * 
 * Represents a visual microphone node that can be dragged around the simulation
 * and react to sound waves passing through it.
 */

import {
  Bounds2,
  Circle,
  Color,
  DragListener,
  ModelViewTransform2,
  Node,
  Path,
  Property,
  Rectangle,
  Shape,
  Vector2
} from "scenerystack";
import { Sound } from "./Sound";

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
    dragBoundsProperty: Property<Bounds2>
  ) {
    super({
      cursor: 'pointer'
    });

    // Create microphone body - a circle with stem
    const micBody = new Circle(15, {
      fill: new Color(100, 100, 100)
    });

    // Create microphone stem
    const micStem = new Rectangle(-5, 10, 10, 30, {
      fill: new Color(80, 80, 80)
    });

    // Create microphone base
    const micBase = new Rectangle(-12, 35, 24, 8, {
      fill: new Color(50, 50, 50),
      cornerRadius: 3
    });

    // Create microphone grid pattern
    const gridSize = 4;
    const gridPattern = new Path(new Shape(), {
      stroke: new Color(40, 40, 40),
      lineWidth: 1
    });

    // Draw horizontal grid lines
    const gridShape = new Shape();
    for (let y = -10; y <= 10; y += gridSize) {
      gridShape.moveTo(-10, y);
      gridShape.lineTo(10, y);
    }
    
    // Draw vertical grid lines
    for (let x = -10; x <= 10; x += gridSize) {
      gridShape.moveTo(x, -10);
      gridShape.lineTo(x, 10);
    }
    
    gridPattern.shape = gridShape;

    // Add components to microphone node
    this.addChild(micStem);
    this.addChild(micBase);
    this.addChild(micBody);
    this.addChild(gridPattern);

    // Add highlight ring that shows when detecting waves
    this.detectionRing = new Circle(20, {
      stroke: new Color(255, 255, 0),
      lineWidth: 2,
      visible: false
    });
    this.addChild(this.detectionRing);

    // Create and load click sound
    this.clickSound = new Sound('./assets/click.wav', true);

    // Position microphone at initial position
    this.center = this.modelViewTransform.modelToViewPosition(
      this.microphonePositionProperty.value
    );

    // Add drag listener with proper offset handling
    const micDragListener = new DragListener({
      targetNode: this,
      dragBoundsProperty: dragBoundsProperty,
      start: (event) => {
        // Store the initial offset between pointer and microphone position
        const micViewPos = this.modelViewTransform.modelToViewPosition(
          this.microphonePositionProperty.value
        );
        (
          micDragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = micViewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (micDragListener as DragListener & { dragOffset: Vector2 })
            .dragOffset
        );
        const modelPoint = this.modelViewTransform.viewToModelPosition(viewPoint);
        
        // Update microphone position in model
        this.microphonePositionProperty.value = modelPoint;
      }
    });
    this.addInputListener(micDragListener);

    // Add listener for wave detection
    this.waveDetectedProperty.lazyLink(this.handleWaveDetection.bind(this));

    // Add listener for position changes
    this.microphonePositionProperty.lazyLink(this.updatePosition.bind(this));
  }

  /**
   * Update the microphone position based on the model position
   */
  private updatePosition(): void {
    const viewPosition = this.modelViewTransform.modelToViewPosition(
      this.microphonePositionProperty.value
    );
    this.center = viewPosition;
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
      }, 100);
    }
  }
} 