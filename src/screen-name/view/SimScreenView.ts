import { Node, Circle, Line, Path, Text, 
  Rectangle, Vector2, Color, Shape, DragListener, KeyboardUtils, SceneryEvent, ModelViewTransform2, Bounds2 } from 'scenerystack';
import { ResetAllButton } from 'scenerystack/scenery-phet';
import { SimModel } from '../model/SimModel';
import { PHYSICS, WAVE, MODEL_VIEW } from '../model/SimConstants';
import  { Property } from 'scenerystack/axon'; 
import { ScreenView, ScreenViewOptions } from 'scenerystack/sim';

/**
 * View for the Doppler Effect simulation
 * 
 * This view handles all visualization aspects of the simulation, including:
 * - Converting between model coordinates (meters) and view coordinates (pixels)
 * - Rendering the source, observer, waves, and connecting line
 * - Displaying velocity vectors and waveforms
 * - Handling user input and controls
 * 
 * The view uses a ModelViewTransform2 to convert between:
 * - Model space: Physical coordinates in meters (±100m in both dimensions)
 * - View space: Screen coordinates in pixels
 */
export class SimScreenView extends ScreenView {
  // Model reference
  private readonly model: SimModel;
  
  // Model-view transform
  private readonly modelViewTransform: ModelViewTransform2;
  
  // Display layers
  private readonly waveLayer: Node;
  private readonly objectLayer: Node;
  private readonly controlLayer: Node;
  private readonly graphLayer: Node;
  private readonly instructionLayer: Node;
  
  // UI elements
  private readonly sourceNode: Circle;
  private readonly observerNode: Circle;
  private readonly sourceVelocityVector: Node;
  private readonly observerVelocityVector: Node;
  private readonly connectingLine: Line;
  private readonly selectionHighlight: Circle;
  
  // Graph elements
  private readonly emittedGraph: Rectangle;
  private readonly observedGraph: Rectangle;
  private readonly emittedWaveform: Path;
  private readonly observedWaveform: Path;
  
  // Status text elements
  private readonly statusTexts: {
    emittedFreq: Text;
    observedFreq: Text;
    shiftStatus: Text;
    selectedObject: Text;
    pauseStatus: Text;
    soundSpeed: Text;
  };
  
  // UI constants
  private readonly UI = {
    SOURCE_RADIUS: 10,
    OBSERVER_RADIUS: 10,
    VECTOR_SCALE: 0.2,
    VELOCITY_STROKE_WEIGHT: 2,
    SOURCE_COLOR: new Color(255, 0, 0),
    OBSERVER_COLOR: new Color(0, 128, 0),
    CONNECTING_LINE_COLOR: new Color(100, 100, 100),
    WAVE_COLOR: new Color(0, 0, 255),
    SELECTION_COLOR: new Color(255, 0, 255),
    GRAPH_BACKGROUND: new Color(250, 250, 250),
    GRAPH_GRID_COLOR: new Color(200, 200, 200),
    TEXT_COLOR: new Color(0, 0, 0),
    REDSHIFT_COLOR: new Color(255, 0, 0),
    BLUESHIFT_COLOR: new Color(0, 0, 255),
    GRAPH_HEIGHT: 100,
    GRAPH_WIDTH: 300,
    GRAPH_MARGIN: 20,
    GRAPH_SPACING: 40,
    PLAY_PAUSE_BUTTON_SIZE: 40,
    PLAY_PAUSE_BUTTON_COLOR: new Color(0, 128, 0),
    PLAY_PAUSE_BUTTON_HOVER_COLOR: new Color(0, 160, 0),
    SPEED_BUTTON_SIZE: 30,
    SPEED_BUTTON_COLOR: new Color(100, 100, 100),
    SPEED_BUTTON_HOVER_COLOR: new Color(120, 120, 120),
    BUTTON_SPACING: 10
  };
  
  // Selection tracking
  private selectedObject: 'source' | 'observer' = 'source';
  
  // Instructions visible flag
  private showInstructions: boolean = true;
  
  // Wave nodes map for tracking
  private waveNodesMap: Map<any, Circle> = new Map();
  
  // Add new properties for play/pause controls
  private readonly playPauseButton: Rectangle;
  private readonly playPauseIcon: Path;
  private readonly speedButtons: Rectangle[];
  private readonly speedTexts: Text[];
  private readonly speedOptions = [0.05, 0.1, 0.2, 0.5, 1.0];
  private currentSpeedIndex = 4; // Start at 1.0x speed (last index)
  
  /**
   * Constructor for the Doppler Effect SimScreenView
   */
  public constructor(model: SimModel, options?: ScreenViewOptions) {
    super(options);
    
    this.model = model;
    
    // Create model-view transform
    // Model space: Physical coordinates in meters (±100m in both dimensions)
    // View space: Screen coordinates in pixels
    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2(
        MODEL_VIEW.MODEL_BOUNDS.MIN_X,
        MODEL_VIEW.MODEL_BOUNDS.MIN_Y,
        MODEL_VIEW.MODEL_BOUNDS.MAX_X,
        MODEL_VIEW.MODEL_BOUNDS.MAX_Y
      ),
      this.layoutBounds
    );
    
    // Create display layers
    this.waveLayer = new Node();
    this.objectLayer = new Node();
    this.controlLayer = new Node();
    this.graphLayer = new Node();
    this.instructionLayer = new Node();
    
    // Add layers to the view in correct order (waves behind objects)
    this.addChild(this.waveLayer);
    this.addChild(this.objectLayer);
    this.addChild(this.graphLayer);
    this.addChild(this.instructionLayer);
    this.addChild(this.controlLayer);
    
    // Ensure wave layer is visible
    this.waveLayer.visible = true;
    
    // Create source and observer nodes
    this.sourceNode = new Circle(this.UI.SOURCE_RADIUS, {
      fill: this.UI.SOURCE_COLOR,
      cursor: 'pointer'
    });
    
    this.observerNode = new Circle(this.UI.OBSERVER_RADIUS, {
      fill: this.UI.OBSERVER_COLOR,
      cursor: 'pointer'
    });
    
    // Create connecting line
    this.connectingLine = new Line(0, 0, 0, 0, {
      stroke: this.UI.CONNECTING_LINE_COLOR,
      lineWidth: 1
    });
    
    // Create selection highlight
    this.selectionHighlight = new Circle(this.UI.SOURCE_RADIUS + 5, {
      stroke: this.UI.SELECTION_COLOR,
      lineWidth: 2,
      pickable: false
    });
    
    // Create velocity vector nodes
    this.sourceVelocityVector = new Node();
    this.observerVelocityVector = new Node();
    
    // Add objects to object layer
    this.objectLayer.addChild(this.connectingLine);
    this.objectLayer.addChild(this.sourceNode);
    this.objectLayer.addChild(this.observerNode);
    this.objectLayer.addChild(this.selectionHighlight);
    this.objectLayer.addChild(this.sourceVelocityVector);
    this.objectLayer.addChild(this.observerVelocityVector);
    
    // Create graphs
    const graphElements = this.createGraphs();
    this.emittedGraph = graphElements.emittedGraph;
    this.observedGraph = graphElements.observedGraph;
    this.emittedWaveform = graphElements.emittedWaveform;
    this.observedWaveform = graphElements.observedWaveform;
    
    // Create status texts
    this.statusTexts = this.createStatusTexts();
    
    // Setup reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // Stop any ongoing interactions
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    });
    this.controlLayer.addChild(resetAllButton);

    // Create play/pause button
    this.playPauseButton = new Rectangle(0, 0, this.UI.PLAY_PAUSE_BUTTON_SIZE, this.UI.PLAY_PAUSE_BUTTON_SIZE, {
      fill: this.UI.PLAY_PAUSE_BUTTON_COLOR,
      cornerRadius: 5,
      cursor: 'pointer'
    });

    // Create play icon (triangle)
    this.playPauseIcon = new Path(new Shape()
      .moveTo(0, 0)
      .lineTo(0, 20)
      .lineTo(20, 10)
      .close(), {
      fill: Color.WHITE
    });
    this.playPauseIcon.center = this.playPauseButton.center;
    this.playPauseButton.addChild(this.playPauseIcon);

    // Create speed buttons
    this.speedButtons = [];
    this.speedTexts = [];
    
    this.speedOptions.forEach((speed, index) => {
      const button = new Rectangle(0, 0, this.UI.SPEED_BUTTON_SIZE, this.UI.SPEED_BUTTON_SIZE, {
        fill: index === this.currentSpeedIndex ? this.UI.SPEED_BUTTON_HOVER_COLOR : this.UI.SPEED_BUTTON_COLOR,
        cornerRadius: 5,
        cursor: 'pointer'
      });

      const text = new Text(speed + 'x', {
        font: '14px Arial',
        fill: Color.WHITE,
        centerX: button.centerX,
        centerY: button.centerY
      });
      button.addChild(text);

      this.speedButtons.push(button);
      this.speedTexts.push(text);
    });

    // Add play/pause button to control layer
    this.controlLayer.addChild(this.playPauseButton);

    // Add speed buttons to control layer
    this.speedButtons.forEach(button => {
      this.controlLayer.addChild(button);
    });

    // Position the controls
    this.updateControlPositions();

    // Add input listeners
    this.addPlayPauseListeners();
    this.addSpeedButtonListeners();
    
    // Setup keyboard handlers
    this.addKeyboardListeners();
    
    // Setup drag handlers
    this.addDragHandlers();
    
    // Setup model listeners
    this.addModelListeners();
    
    // Draw initial instructions
    this.drawInstructions();
    
    // Initial view update
    this.updateView();
  }
  
  /**
   * Reset the view to initial state
   */
  public reset(): void {
    // Reset selected object
    this.selectedObject = 'source';
    
    // Show instructions
    this.showInstructions = true;
    this.instructionLayer.visible = true;
    
    // Clear wave nodes
    this.waveNodesMap.forEach((waveNode) => {
      this.waveLayer.removeChild(waveNode);
    });
    this.waveNodesMap.clear();
    
    // Update view to match model
    this.updateView();
  }
  
  /**
   * Main step function called each frame
   */
  public step(dt: number): void {
    // Update view to match model
    this.updateView();
    
    // Update visibility of pause indication
    this.statusTexts.pauseStatus.visible = this.model.pausedProperty.value;
  }
  
  /**
   * Create graph elements
   */
  private createGraphs(): { emittedGraph: Rectangle, observedGraph: Rectangle, 
                           emittedWaveform: Path, observedWaveform: Path } {
    const graphY1 = 30;
    const graphY2 = graphY1 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING;
    const graphX = this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN;
    
    // Create graph containers
    const emittedGraph = new Rectangle(
      graphX, 
      graphY1, 
      this.UI.GRAPH_WIDTH, 
      this.UI.GRAPH_HEIGHT, 
      {
        fill: this.UI.GRAPH_BACKGROUND,
        stroke: this.UI.GRAPH_GRID_COLOR,
        lineWidth: 1
      }
    );
    
    const observedGraph = new Rectangle(
      graphX, 
      graphY2, 
      this.UI.GRAPH_WIDTH, 
      this.UI.GRAPH_HEIGHT, 
      {
        fill: this.UI.GRAPH_BACKGROUND,
        stroke: this.UI.GRAPH_GRID_COLOR,
        lineWidth: 1
      }
    );
    
    // Create center lines for graphs
    const emittedCenterLine = new Line(
      graphX, 
      graphY1 + this.UI.GRAPH_HEIGHT / 2, 
      graphX + this.UI.GRAPH_WIDTH, 
      graphY1 + this.UI.GRAPH_HEIGHT / 2, 
      {
        stroke: this.UI.GRAPH_GRID_COLOR
      }
    );
    
    const observedCenterLine = new Line(
      graphX, 
      graphY2 + this.UI.GRAPH_HEIGHT / 2, 
      graphX + this.UI.GRAPH_WIDTH, 
      graphY2 + this.UI.GRAPH_HEIGHT / 2, 
      {
        stroke: this.UI.GRAPH_GRID_COLOR
      }
    );
    
    // Create waveform paths
    const emittedWaveform = new Path(new Shape(), {
      stroke: this.UI.SOURCE_COLOR,
      lineWidth: 2
    });
    
    const observedWaveform = new Path(new Shape(), {
      stroke: this.UI.OBSERVER_COLOR,
      lineWidth: 2
    });
    
    // Add graph titles
    const emittedTitle = new Text('Emitted Sound', {
      font: '12px Arial',
      fill: this.UI.TEXT_COLOR,
      left: graphX + 5,
      top: graphY1 + 15
    });
    
    const observedTitle = new Text('Observed Sound', {
      font: '12px Arial',
      fill: this.UI.TEXT_COLOR,
      left: graphX + 5,
      top: graphY2 + 15
    });
    
    // Add to graph layer
    this.graphLayer.addChild(emittedGraph);
    this.graphLayer.addChild(observedGraph);
    this.graphLayer.addChild(emittedCenterLine);
    this.graphLayer.addChild(observedCenterLine);
    this.graphLayer.addChild(emittedWaveform);
    this.graphLayer.addChild(observedWaveform);
    this.graphLayer.addChild(emittedTitle);
    this.graphLayer.addChild(observedTitle);
    
    return {
      emittedGraph,
      observedGraph,
      emittedWaveform,
      observedWaveform
    };
  }
  
  /**
   * Create status text elements
   */
  private createStatusTexts() {
    const emittedFreq = new Text('', {
      font: '14px Arial',
      fill: this.UI.TEXT_COLOR,
      left: this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN,
      top: 15
    });
    
    const observedFreq = new Text('', {
      font: '14px Arial',
      fill: this.UI.TEXT_COLOR,
      left: this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN,
      top: 30 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING - 15
    });
    
    const shiftStatus = new Text('', {
      font: '14px Arial',
      fill: this.UI.TEXT_COLOR,
      right: this.layoutBounds.maxX - this.UI.GRAPH_MARGIN,
      top: 30 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING - 15
    });
    
    const selectedObject = new Text('Selected: Source', {
      font: '14px Arial',
      fill: this.UI.SELECTION_COLOR,
      left: 120,
      bottom: this.layoutBounds.maxY - 15
    });
    
    const pauseStatus = new Text('PAUSED', {
      font: '14px Arial',
      fill: new Color(255, 0, 0),
      left: 15,
      bottom: this.layoutBounds.maxY - 15,
      visible: false
    });
    
    const soundSpeed = new Text(`Sound Speed: ${this.model.soundSpeedProperty.value.toFixed(2)} m/s`, {
      font: '14px Arial',
      fill: this.UI.TEXT_COLOR,
      left: 300,
      bottom: this.layoutBounds.maxY - 15
    });
    
    // Add to control layer
    this.controlLayer.addChild(emittedFreq);
    this.controlLayer.addChild(observedFreq);
    this.controlLayer.addChild(shiftStatus);
    this.controlLayer.addChild(selectedObject);
    this.controlLayer.addChild(pauseStatus);
    this.controlLayer.addChild(soundSpeed);
    
    return {
      emittedFreq,
      observedFreq,
      shiftStatus,
      selectedObject,
      pauseStatus,
      soundSpeed
    };
  }

  /**
   * Add model listeners to update view when model changes
   */
  private addModelListeners(): void {
    // Update source position
    this.model.sourcePositionProperty.lazyLink(() => {
      this.updateSourcePosition();
    });

    // Update observer position
    this.model.observerPositionProperty.lazyLink(() => {
      this.updateObserverPosition();
    });

    // Update source velocity
    this.model.sourceVelocityProperty.lazyLink(() => {
      this.updateSourceVelocity();
    });

    // Update observer velocity
    this.model.observerVelocityProperty.lazyLink(() => {
      this.updateObserverVelocity();
    });

    // Update frequencies
    this.model.emittedFrequencyProperty.lazyLink(() => {
      this.updateFrequencyText();
    });

    this.model.observedFrequencyProperty.lazyLink(() => {
      this.updateFrequencyText();
    });

    // Update sound speed
    this.model.soundSpeedProperty.lazyLink(() => {
      this.updateSoundSpeedText();
    });

    // Update paused state
    this.model.pausedProperty.lazyLink(() => {
      this.updatePausedState();
    });

    // Listen to waves collection
    this.model.waves.addItemAddedListener(wave => {
      this.addWaveNode(wave);
    });

    this.model.waves.addItemRemovedListener(wave => {
      this.removeWaveNode(wave);
    });
  }

  /**
   * Add drag handlers to source and observer nodes
   */
  private addDragHandlers(): void {
    // Store previous positions for movement calculation
    let previousSourcePos = new Vector2(0, 0);
    let previousObserverPos = new Vector2(0, 0);
    
    // Source drag handler
    const sourceDragListener = new DragListener({
      targetNode: this.sourceNode,
      dragBoundsProperty: new Property(this.layoutBounds),
      start: () => {
        this.selectedObject = 'source';
        this.updateSelectionHighlight();
        previousSourcePos = this.model.sourcePositionProperty.value.copy();
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates
        const modelPoint = this.viewToModel(event.pointer.point);
        this.model.sourcePositionProperty.value = modelPoint;
        
        // Calculate velocity vector from movement
        const movement = this.model.sourcePositionProperty.value.minus(previousSourcePos);
        previousSourcePos = this.model.sourcePositionProperty.value.copy();
        
        if (movement.magnitude > 0) {
          this.model.sourceVelocityProperty.value = movement.timesScalar(5); // Scale factor for velocity
          this.model.sourceMovingProperty.value = true;
        }
      },
      end: () => {
        // Keep current velocity when drag ends
      }
    });
    this.sourceNode.addInputListener(sourceDragListener);
    
    // Observer drag handler
    const observerDragListener = new DragListener({
      targetNode: this.observerNode,
      dragBoundsProperty: new Property(this.layoutBounds),
      start: () => {
        this.selectedObject = 'observer';
        this.updateSelectionHighlight();
        previousObserverPos = this.model.observerPositionProperty.value.copy();
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates
        const modelPoint = this.viewToModel(event.pointer.point);
        this.model.observerPositionProperty.value = modelPoint;
        
        // Calculate velocity vector from movement
        const movement = this.model.observerPositionProperty.value.minus(previousObserverPos);
        previousObserverPos = this.model.observerPositionProperty.value.copy();
        
        if (movement.magnitude > 0) {
          this.model.observerVelocityProperty.value = movement.timesScalar(5); // Scale factor for velocity
          this.model.observerMovingProperty.value = true;
        }
      },
      end: () => {
        // Keep current velocity when drag ends
      }
    });
    this.observerNode.addInputListener(observerDragListener);
  }

  /**
   * Add keyboard listeners for controls
   */
  private addKeyboardListeners(): void {
    // Add key listeners to the view
    const keydownListener = {
      keydown: (event: SceneryEvent<KeyboardEvent>) => {
        if (!event.domEvent) return;
        const key = event.domEvent.key.toLowerCase();
        
        // Handle object selection
        if (key === 's') {
          this.selectedObject = 'source';
          this.updateSelectionHighlight();
        }
        else if (key === 'o') {
          this.selectedObject = 'observer';
          this.updateSelectionHighlight();
        }
        
        // Handle arrow key movement
        if (!this.model.pausedProperty.value) {
          let targetPos, targetVel, isMoving;
          
          // Determine which object to control
          if (this.selectedObject === 'source') {
            targetPos = this.model.sourcePositionProperty;
            targetVel = this.model.sourceVelocityProperty;
            isMoving = this.model.sourceMovingProperty;
          } else {
            targetPos = this.model.observerPositionProperty;
            targetVel = this.model.observerVelocityProperty;
            isMoving = this.model.observerMovingProperty;
          }
          
          // Set velocity based on key
          const velocity = new Vector2(0, 0);
          
          if (key === 'arrowleft') {
            velocity.x = -60.0;
          }
          else if (key === 'arrowright') {
            velocity.x = 60.0;
          }
          
          if (key === 'arrowup') {
            velocity.y = -60.0;
          }
          else if (key === 'arrowdown') {
            velocity.y = 60.0;
          }
          
          // Apply velocity if any keys were pressed
          if (velocity.magnitude > 0) {
            targetVel.value = velocity;
            isMoving.value = true;
          }
        }
        
        // Handle pause toggle
        if (key === ' ') {
          this.model.pausedProperty.value = !this.model.pausedProperty.value;
        }
        
        // Handle reset
        if (key === 'r') {
          this.model.reset();
          this.reset();
        }
        
        // Handle help toggle
        if (key === 'h') {
          this.showInstructions = !this.showInstructions;
          this.instructionLayer.visible = this.showInstructions;
        }
        
        // Preset scenarios
        if (key === '1') {
          this.model.setupScenario1();
        }
        else if (key === '2') {
          this.model.setupScenario2();
        }
        else if (key === '3') {
          this.model.setupScenario3();
        }
        else if (key === '4') {
          this.model.setupScenario4();
        }
        
        // Adjust emitted frequency
        if (key === '+' || key === '=') {
          this.model.emittedFrequencyProperty.value += 0.01;
        }
        else if (key === '-' || key === '_') {
          this.model.emittedFrequencyProperty.value = 
            Math.max(0.1, this.model.emittedFrequencyProperty.value - 0.01);
        }
        
        // Adjust sound speed
        if (key === '.' || key === '>') {
          this.model.soundSpeedProperty.value += 1.0;
        }
        else if (key === ',' || key === '<') {
          this.model.soundSpeedProperty.value = 
            Math.max(1.0, this.model.soundSpeedProperty.value - 1.0);
        }
      }
    };
    
    // Add the keyboard listener to the view
    this.addInputListener(keydownListener);
    
    // Also add a global keyboard listener to ensure we catch all keyboard events
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      
      // Handle object selection
      if (key === 's') {
        this.selectedObject = 'source';
        this.updateSelectionHighlight();
      }
      else if (key === 'o') {
        this.selectedObject = 'observer';
        this.updateSelectionHighlight();
      }
      
      // Handle arrow key movement
      if (!this.model.pausedProperty.value) {
        let targetPos, targetVel, isMoving;
        
        // Determine which object to control
        if (this.selectedObject === 'source') {
          targetPos = this.model.sourcePositionProperty;
          targetVel = this.model.sourceVelocityProperty;
          isMoving = this.model.sourceMovingProperty;
        } else {
          targetPos = this.model.observerPositionProperty;
          targetVel = this.model.observerVelocityProperty;
          isMoving = this.model.observerMovingProperty;
        }
        
        // Set velocity based on key
        const velocity = new Vector2(0, 0);
        
        if (key === 'arrowleft') {
          velocity.x = -60.0;
        }
        else if (key === 'arrowright') {
          velocity.x = 60.0;
        }
        
        if (key === 'arrowup') {
          velocity.y = -60.0;
        }
        else if (key === 'arrowdown') {
          velocity.y = 60.0;
        }
        
        // Apply velocity if any keys were pressed
        if (velocity.magnitude > 0) {
          targetVel.value = velocity;
          isMoving.value = true;
        }
      }
      
      // Handle pause toggle
      if (key === ' ') {
        this.model.pausedProperty.value = !this.model.pausedProperty.value;
      }
      
      // Handle reset
      if (key === 'r') {
        this.model.reset();
        this.reset();
      }
      
      // Handle help toggle
      if (key === 'h') {
        this.showInstructions = !this.showInstructions;
        this.instructionLayer.visible = this.showInstructions;
      }
      
      // Preset scenarios
      if (key === '1') {
        this.model.setupScenario1();
      }
      else if (key === '2') {
        this.model.setupScenario2();
      }
      else if (key === '3') {
        this.model.setupScenario3();
      }
      else if (key === '4') {
        this.model.setupScenario4();
      }
      
      // Adjust emitted frequency
      if (key === '+' || key === '=') {
        this.model.emittedFrequencyProperty.value += 0.01;
      }
      else if (key === '-' || key === '_') {
        this.model.emittedFrequencyProperty.value = 
          Math.max(0.1, this.model.emittedFrequencyProperty.value - 0.01);
      }
      
      // Adjust sound speed
      if (key === '.' || key === '>') {
        this.model.soundSpeedProperty.value += 1.0;
      }
      else if (key === ',' || key === '<') {
        this.model.soundSpeedProperty.value = 
          Math.max(1.0, this.model.soundSpeedProperty.value - 1.0);
      }
    });
  }

  /**
   * Draw instructions on the instruction layer
   */
  private drawInstructions(): void {
    const instructionsNode = new Node();
    
    // Background for instructions
    const background = new Rectangle(0, 0, this.layoutBounds.width / 2, 200, {
      fill: new Color(255, 255, 255, 0.8),
      cornerRadius: 5
    });
    instructionsNode.addChild(background);
    
    // Title
    const title = new Text('Doppler Effect Simulation Controls', {
      font: 'bold 16px Arial',
      fill: this.UI.TEXT_COLOR,
      centerX: background.centerX,
      top: 10
    });
    instructionsNode.addChild(title);
    
    // Instructions text
    const instructions = [
      'Click and drag source (red) or observer (green) to move them',
      'Keyboard Controls:',
      'S: Select source | O: Select observer | Arrow keys: Move selected object',
      'Space: Pause/Resume | R: Reset | H: Toggle help',
      '+/-: Adjust emitted frequency | ,/.: Adjust sound speed',
      '1-4: Load preset scenarios (approaching source, observer, etc.)'
    ];
    
    let yPosition = title.bottom + 15;
    
    instructions.forEach((instruction, index) => {
      const line = new Text(instruction, {
        font: '14px Arial',
        fill: this.UI.TEXT_COLOR,
        left: 15,
        top: yPosition
      });
      instructionsNode.addChild(line);
      yPosition = line.bottom + 10;
    });
    
    // Adjust background to fit content
    background.setRectHeight(yPosition + 10);
    background.centerX = this.layoutBounds.centerX / 2;
    background.centerY = this.layoutBounds.centerY / 2;
    
    this.instructionLayer.addChild(instructionsNode);
  }

  /**
   * Update the view to match the model state
   */
  private updateView(): void {
    this.updateSourcePosition();
    this.updateObserverPosition();
    this.updateSourceVelocity();
    this.updateObserverVelocity();
    this.updateSelectionHighlight();
    this.updateFrequencyText();
    this.updateSoundSpeedText();
    this.updateWaveforms();
    this.updateConnectingLine();
    this.updateWaves();
  }

  /**
   * Update source position
   */
  private updateSourcePosition(): void {
    const sourcePos = this.model.sourcePositionProperty.value;
    this.sourceNode.center = this.modelToView(sourcePos);
  }

  /**
   * Update observer position
   */
  private updateObserverPosition(): void {
    const observerPos = this.model.observerPositionProperty.value;
    this.observerNode.center = this.modelToView(observerPos);
  }

  /**
   * Update the source velocity vector visualization
   */
  private updateSourceVelocity(): void {
    const velocity = this.model.sourceVelocityProperty.value;
    this.updateVelocityVector(
      this.sourceVelocityVector, 
      this.model.sourcePositionProperty.value,
      velocity,
      this.UI.SOURCE_COLOR,
      PHYSICS.MIN_VELOCITY_MAG
    );
  }

  /**
   * Update the observer velocity vector visualization
   */
  private updateObserverVelocity(): void {
    const velocity = this.model.observerVelocityProperty.value;
    this.updateVelocityVector(
      this.observerVelocityVector, 
      this.model.observerPositionProperty.value,
      velocity,
      this.UI.OBSERVER_COLOR,
      PHYSICS.MIN_VELOCITY_MAG
    );
  }

  /**
   * Update a velocity vector visualization
   */
  private updateVelocityVector(
    node: Node, 
    position: Vector2, 
    velocity: Vector2, 
    color: Color,
    minMagnitude: number
  ): void {
    // Clear previous children
    node.removeAllChildren();
    
    // Only show velocity vector if magnitude is significant
    if (velocity.magnitude < minMagnitude) {
      return;
    }
    
    // Convert model coordinates to view coordinates
    const viewPosition = this.modelToView(position);
    
    // Scale velocity vector for visualization
    // First scale by the model-view transform to convert m/s to pixels/s
    // Then scale by VELOCITY_VECTOR_SCALE to make it more visible
    const scaledVelocity = velocity.timesScalar(MODEL_VIEW.SCALE.VELOCITY_VECTOR_SCALE);
    const viewVelocity = this.modelToViewDelta(scaledVelocity);
    
    // Create line for vector
    const line = new Line(
      viewPosition.x, 
      viewPosition.y,
      viewPosition.x + viewVelocity.x,
      viewPosition.y + viewVelocity.y,
      {
        stroke: color,
        lineWidth: this.UI.VELOCITY_STROKE_WEIGHT
      }
    );
    node.addChild(line);
    
    // Create arrowhead for vector
    const arrowhead = new Path(new Shape()
      .moveTo(0, 0)
      .lineTo(-10, 5)
      .lineTo(-10, -5)
      .close(),
      {
        fill: color
      }
    );
    
    // Position and rotate arrowhead
    arrowhead.center = new Vector2(
      viewPosition.x + viewVelocity.x,
      viewPosition.y + viewVelocity.y
    );
    arrowhead.rotation = Math.atan2(viewVelocity.y, viewVelocity.x);
    
    node.addChild(arrowhead);
  }

  /**
   * Update the selection highlight position and size
   */
  private updateSelectionHighlight(): void {
    if (this.selectedObject === 'source') {
      this.selectionHighlight.radius = this.UI.SOURCE_RADIUS + 5;
      this.selectionHighlight.center = this.modelToView(this.model.sourcePositionProperty.value);
      this.statusTexts.selectedObject.string = 'Selected: Source';
    } else {
      this.selectionHighlight.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlight.center = this.modelToView(this.model.observerPositionProperty.value);
      this.statusTexts.selectedObject.string = 'Selected: Observer';
    }
  }

  /**
   * Update the frequency text displays
   */
  private updateFrequencyText(): void {
    // Update emitted frequency text
    this.statusTexts.emittedFreq.string = 
      `Emitted Freq.: ${this.model.emittedFrequencyProperty.value.toFixed(2)} Hz`;
    
    // Update observed frequency text
    this.statusTexts.observedFreq.string = 
      `Observed Freq.: ${this.model.observedFrequencyProperty.value.toFixed(2)} Hz`;
    
    // Update shift status text (red/blue shift)
    const emittedFreq = this.model.emittedFrequencyProperty.value;
    const observedFreq = this.model.observedFrequencyProperty.value;
    
    if (observedFreq > emittedFreq) {
      this.statusTexts.shiftStatus.string = 'Blueshifted (approaching)';
      this.statusTexts.shiftStatus.fill = this.UI.BLUESHIFT_COLOR;
    } else if (observedFreq < emittedFreq) {
      this.statusTexts.shiftStatus.string = 'Redshifted (receding)';
      this.statusTexts.shiftStatus.fill = this.UI.REDSHIFT_COLOR;
    } else {
      this.statusTexts.shiftStatus.string = '';
    }
  }

  /**
   * Update the sound speed text display
   */
  private updateSoundSpeedText(): void {
    this.statusTexts.soundSpeed.string = 
      `Sound Speed: ${this.model.soundSpeedProperty.value.toFixed(2)} m/s`;
  }

  /**
   * Update the paused state
   */
  private updatePausedState(): void {
    this.statusTexts.pauseStatus.visible = this.model.pausedProperty.value;
  }

  /**
   * Update the connecting line between source and observer
   */
  private updateConnectingLine(): void {
    const sourcePos = this.model.sourcePositionProperty.value;
    const observerPos = this.model.observerPositionProperty.value;
    
    // Convert model coordinates to view coordinates
    const viewSourcePos = this.modelToView(sourcePos);
    const viewObserverPos = this.modelToView(observerPos);
    
    this.connectingLine.setLine(
      viewSourcePos.x, 
      viewSourcePos.y, 
      viewObserverPos.x, 
      viewObserverPos.y
    );
  }

  /**
   * Add a wave node for a new wave in the model
   */
  private addWaveNode(wave: any): void {
    const waveNode = new Circle(0, {
      stroke: this.UI.WAVE_COLOR,
      fill: null,
      lineWidth: 2,
      opacity: 0.7,
      pickable: false,
      visible: true // Ensure wave node is visible
    });
    
    this.waveLayer.addChild(waveNode);
    this.waveNodesMap.set(wave, waveNode);
    
    // Initial update
    this.updateWaveNode(wave);
  }

  /**
   * Remove a wave node when removed from the model
   */
  private removeWaveNode(wave: any): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      this.waveLayer.removeChild(waveNode);
      this.waveNodesMap.delete(wave);
    }
  }

  /**
   * Update visualization for a specific wave
   */
  private updateWaveNode(wave: any): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      // Update position to match wave's origin (convert to view coordinates)
      waveNode.center = this.modelToView(wave.position);
      
      // Update radius to match wave's propagation (convert to view coordinates)
      const viewRadius = this.modelToViewDelta(new Vector2(wave.radius, 0)).x;
      waveNode.radius = viewRadius;
      
      // Update opacity based on age
      const maxAge = WAVE.MAX_AGE;
      const age = this.model.simulationTimeProperty.value - wave.birthTime;
      const opacity = 0.7 * (1 - age / maxAge);
      
      waveNode.opacity = Math.max(0, opacity);
      
      // Ensure the wave is visible
      waveNode.visible = true;
    }
  }

  /**
   * Update all wave nodes to match model
   */
  private updateWaves(): void {
    // Update each wave node
    this.model.waves.forEach(wave => {
      this.updateWaveNode(wave);
    });
  }

  /**
   * Update waveforms in the graph displays
   */
  private updateWaveforms(): void {
    // Update emitted sound waveform
    const emittedShape = new Shape();
    const graphX = this.emittedGraph.left;
    const graphY = this.emittedGraph.centerY;
    const graphWidth = this.emittedGraph.width;

    // Start at left edge
    emittedShape.moveToPoint(new Vector2(graphX, graphY));

    // Draw waveform for emitted sound
    const emittedData = this.model.emittedSoundData;
    for (let i = 0; i < emittedData.length; i++) {
      const x = graphX + (i / emittedData.length) * graphWidth;
      const y = graphY - emittedData[i];
      emittedShape.lineToPoint(new Vector2(x, y));
    }

    this.emittedWaveform.shape = emittedShape;

    // Update observed sound waveform
    const observedShape = new Shape();
    const obsGraphX = this.observedGraph.left;
    const obsGraphY = this.observedGraph.centerY;

    // Start at left edge
    observedShape.moveToPoint(new Vector2(obsGraphX, obsGraphY));

    // Draw waveform for observed sound
    const observedData = this.model.observedSoundData;
    for (let i = 0; i < observedData.length; i++) {
      const x = obsGraphX + (i / observedData.length) * graphWidth;
      const y = obsGraphY - observedData[i];
      observedShape.lineToPoint(new Vector2(x, y));
    }

    this.observedWaveform.shape = observedShape;
  }

  /**
   * Convert model coordinates (meters) to view coordinates (pixels)
   */
  private modelToView(modelPoint: Vector2): Vector2 {
    return this.modelViewTransform.modelToViewPosition(modelPoint);
  }

  /**
   * Convert view coordinates (pixels) to model coordinates (meters)
   */
  private viewToModel(viewPoint: Vector2): Vector2 {
    return this.modelViewTransform.viewToModelPosition(viewPoint);
  }

  /**
   * Convert model distance (meters) to view distance (pixels)
   */
  private modelToViewDelta(modelDelta: Vector2): Vector2 {
    return this.modelViewTransform.modelToViewDelta(modelDelta);
  }

  /**
   * Convert view distance (pixels) to model distance (meters)
   */
  private viewToModelDelta(viewDelta: Vector2): Vector2 {
    return this.modelViewTransform.viewToModelDelta(viewDelta);
  }

  /**
   * Update positions of play/pause and speed controls
   */
  private updateControlPositions(): void {
    // Position play/pause button at bottom center
    this.playPauseButton.centerX = this.layoutBounds.centerX;
    this.playPauseButton.bottom = this.layoutBounds.maxY - 20;

    // Position speed buttons to the right of play/pause button
    let currentX = this.playPauseButton.right + this.UI.BUTTON_SPACING;
    this.speedButtons.forEach(button => {
      button.centerX = currentX;
      button.bottom = this.playPauseButton.bottom;
      currentX += this.UI.SPEED_BUTTON_SIZE + this.UI.BUTTON_SPACING;
    });
  }

  /**
   * Add input listeners for play/pause button
   */
  private addPlayPauseListeners(): void {
    this.playPauseButton.addInputListener({
      mouseover: () => {
        this.playPauseButton.fill = this.UI.PLAY_PAUSE_BUTTON_HOVER_COLOR;
      },
      mouseout: () => {
        this.playPauseButton.fill = this.UI.PLAY_PAUSE_BUTTON_COLOR;
      },
      up: () => {
        this.model.pausedProperty.value = !this.model.pausedProperty.value;
        this.updatePlayPauseIcon();
      }
    });
  }

  /**
   * Add input listeners for speed buttons
   */
  private addSpeedButtonListeners(): void {
    this.speedButtons.forEach((button, index) => {
      button.addInputListener({
        mouseover: () => {
          button.fill = this.UI.SPEED_BUTTON_HOVER_COLOR;
        },
        mouseout: () => {
          if (index !== this.currentSpeedIndex) {
            button.fill = this.UI.SPEED_BUTTON_COLOR;
          }
        },
        up: () => {
          this.setSimulationSpeed(index);
        }
      });
    });
  }

  /**
   * Set the simulation speed
   */
  private setSimulationSpeed(index: number): void {
    // Update button colors
    this.speedButtons[this.currentSpeedIndex].fill = this.UI.SPEED_BUTTON_COLOR;
    this.speedButtons[index].fill = this.UI.SPEED_BUTTON_HOVER_COLOR;
    
    // Update current speed index
    this.currentSpeedIndex = index;
    
    // Update model's real time factor
    this.model.realTimeFactorProperty.value = this.speedOptions[index];
  }

  /**
   * Update the play/pause icon based on simulation state
   */
  private updatePlayPauseIcon(): void {
    if (this.model.pausedProperty.value) {
      // Show play icon (triangle)
      this.playPauseIcon.shape = new Shape()
        .moveTo(0, 0)
        .lineTo(0, 20)
        .lineTo(20, 10)
        .close();
    } else {
      // Show pause icon (two rectangles)
      this.playPauseIcon.shape = new Shape()
        .moveTo(5, 0)
        .lineTo(5, 20)
        .moveTo(15, 0)
        .lineTo(15, 20);
    }
  }
}