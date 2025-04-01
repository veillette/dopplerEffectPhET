import {
  Circle,
  Color,
  DragListener,
  Line,
  ModelViewTransform2,
  Node,
  Path,
  Rectangle,
  SceneryEvent,
  Shape,
  Text,
  Vector2,
  LinearGradient,
} from "scenerystack";
import {
  ArrowNode,
  InfoButton,
  NumberControl,
  PhetFont,
  ResetAllButton,
  TimeControlNode,
} from "scenerystack/scenery-phet";
import {
  ComboBox,
  Panel,
  VerticalCheckboxGroup,
  VerticalCheckboxGroupItem,
} from "scenerystack/sun";
import { Scenario, SimModel, Wave } from "../model/SimModel";
import { PHYSICS, SCALE, WAVE, WaveformPoint } from "../model/SimConstants";
import { Property } from "scenerystack/axon";
import { ScreenView, ScreenViewOptions } from "scenerystack/sim";
import strings from "../../strings_en.json";

// Add this section at the top of the file, after imports
const STRINGS = {
  TITLE: strings["doppler-effect.title"].value,
  SOURCE: strings["doppler-effect.source"].value,
  OBSERVER: strings["doppler-effect.observer"].value,
  SELECTED_OBJECT: strings["doppler-effect.selectedObject"].value,
  CONTROLS: {
    VALUES: strings["doppler-effect.controls.values"].value,
    VELOCITY_ARROWS: strings["doppler-effect.controls.velocityArrows"].value,
    LINE_OF_SIGHT: strings["doppler-effect.controls.lineOfSight"].value,
    SOUND_SPEED: strings["doppler-effect.controls.soundSpeed"].value,
    FREQUENCY: strings["doppler-effect.controls.frequency"].value,
    MOTION_TRAILS: "Motion Trails",
  },
  UNITS: {
    METERS_PER_SECOND: strings["doppler-effect.units.metersPerSecond"].value,
    HERTZ: strings["doppler-effect.units.hertz"].value,
    METERS: strings["doppler-effect.units.meters"].value,
  },
  GRAPHS: {
    EMITTED_SOUND: strings["doppler-effect.graphs.emittedSound"].value,
    OBSERVED_SOUND: strings["doppler-effect.graphs.observedSound"].value,
    EMITTED_FREQUENCY: strings["doppler-effect.graphs.emittedFrequency"].value,
    OBSERVED_FREQUENCY:
      strings["doppler-effect.graphs.observedFrequency"].value,
  },
  SHIFT: {
    BLUESHIFT: strings["doppler-effect.shift.blueshift"].value,
    REDSHIFT: strings["doppler-effect.shift.redshift"].value,
  },
  HELP: {
    DRAG_AND_DROP: strings["doppler-effect.help.dragAndDrop"].value,
    KEYBOARD_CONTROLS: strings["doppler-effect.help.keyboardControls"].value,
    OBJECT_SELECTION: strings["doppler-effect.help.objectSelection"].value,
    CONTROLS: strings["doppler-effect.help.controls"].value,
    ADJUST: strings["doppler-effect.help.adjust"].value,
    SCENARIOS: strings["doppler-effect.help.scenarios"].value,
  },
};

/**
 * Simple Sound wrapper class for playing audio
 */
class Sound {
  private audio: HTMLAudioElement;
  private isLoaded: boolean = false;
  private isMuted: boolean = false;
  
  constructor(src: string) {
    this.audio = new Audio();
    
    // Add error handling for loading sound
    this.audio.addEventListener('canplaythrough', () => {
      this.isLoaded = true;
    });
    
    this.audio.addEventListener('error', (e) => {
      console.warn('Error loading sound:', e);
      this.isLoaded = false;
    });
    
    // Set source after adding listeners
    this.audio.src = src;
    
    // Try to load the audio
    this.audio.load();
  }
  
  play() {
    if (!this.isLoaded || this.isMuted) return;
    
    // Create a new audio element for each play to allow overlapping sounds
    const sound = new Audio(this.audio.src);
    sound.volume = 0.5; // Lower volume to prevent being too loud
    
    // Play and handle errors
    sound.play().catch(e => {
      console.warn('Error playing sound:', e);
    });
  }
  
  mute() {
    this.isMuted = true;
  }
  
  unmute() {
    this.isMuted = false;
  }
}

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

  // UI elements
  private readonly sourceNode: Circle;
  private readonly observerNode: Circle;
  private readonly microphoneNode: Node;
  private readonly sourceVelocityVector: ArrowNode;
  private readonly observerVelocityVector: ArrowNode;
  private readonly connectingLine: Line;
  private readonly selectionHighlight: Circle;
  private readonly sourceTrail: Path;
  private readonly observerTrail: Path;

  // Graph elements
  private readonly emittedGraph: Rectangle;
  private readonly observedGraph: Rectangle;
  private readonly emittedWaveform: Path;
  private readonly observedWaveform: Path;

  // Visibility properties
  private readonly visibleValuesProperty: Property<boolean>;
  private readonly visibleVelocityArrowProperty: Property<boolean>;
  private readonly visibleLineOfSightProperty: Property<boolean>;
  private readonly visibleTrailsProperty: Property<boolean>;

  // Status text elements
  private readonly statusTexts: {
    emittedFreq: Text;
    observedFreq: Text;
    shiftStatus: Text;
    selectedObject: Text;
  };

  // UI constants
  private readonly UI = {
    SOURCE_RADIUS: 10,
    OBSERVER_RADIUS: 10,
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
    TRAIL_WIDTH: 2,
  };

  // Selection tracking
  private selectedObject: "source" | "observer" = "source";
  // Wave nodes map for tracking
  private waveNodesMap: Map<Wave, Circle> = new Map();

  // Add a new property for the instruction box
  private readonly instructionsBox: Node;

  // Sound elements
  private readonly clickSound: Sound;

  /**
   * Constructor for the Doppler Effect SimScreenView
   */
  public constructor(model: SimModel, options?: ScreenViewOptions) {
    super(options);

    this.model = model;

    // Create model-view transform
    // Model space: Physical coordinates in meters (±100m in both dimensions)
    // View space: Screen coordinates in pixels
    this.modelViewTransform =
      ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        new Vector2(0, 0),
        new Vector2(this.layoutBounds.centerX, this.layoutBounds.centerY),
        SCALE.MODEL_VIEW,
      );

    this.visibleValuesProperty = new Property<boolean>(false);
    this.visibleVelocityArrowProperty = new Property<boolean>(false);
    this.visibleLineOfSightProperty = new Property<boolean>(false);
    this.visibleTrailsProperty = new Property<boolean>(false);

    // Create display layers
    this.waveLayer = new Node();
    this.objectLayer = new Node();
    this.controlLayer = new Node();
    this.graphLayer = new Node();

    // Add layers to the view in correct order (waves behind objects)
    this.addChild(this.waveLayer);
    this.addChild(this.objectLayer);
    this.addChild(this.graphLayer);
    this.addChild(this.controlLayer);

    // Ensure wave layer is visible
    this.waveLayer.visible = true;

    // Create source and observer nodes
    this.sourceNode = new Circle(this.UI.SOURCE_RADIUS, {
      fill: this.UI.SOURCE_COLOR,
      cursor: "pointer",
    });

    this.observerNode = new Circle(this.UI.OBSERVER_RADIUS, {
      fill: this.UI.OBSERVER_COLOR,
      cursor: "pointer",
    });

    // Create connecting line
    this.connectingLine = new Line(0, 0, 0, 0, {
      visibleProperty: this.visibleLineOfSightProperty,
      stroke: this.UI.CONNECTING_LINE_COLOR,
      lineWidth: 1,
      lineDash: [10, 5],
    });

    // Create selection highlight
    this.selectionHighlight = new Circle(this.UI.SOURCE_RADIUS + 5, {
      stroke: this.UI.SELECTION_COLOR,
      lineWidth: 2,
      pickable: false,
    });

    // Create velocity vector nodes
    this.sourceVelocityVector = new ArrowNode(0, 0, 0, 0, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 2,
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: this.visibleVelocityArrowProperty,
    });
    this.observerVelocityVector = new ArrowNode(0, 0, 0, 0, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 2,
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: this.visibleVelocityArrowProperty,
    });

    // Create trail paths
    this.sourceTrail = new Path(new Shape(), {
      stroke: this.UI.SOURCE_COLOR,
      lineWidth: this.UI.TRAIL_WIDTH,
    });
    this.observerTrail = new Path(new Shape(), {
      stroke: this.UI.OBSERVER_COLOR,
      lineWidth: this.UI.TRAIL_WIDTH,
    });

    // Add objects to object layer
    this.objectLayer.addChild(this.connectingLine);
    this.objectLayer.addChild(this.sourceNode);
    this.objectLayer.addChild(this.observerNode);
    this.objectLayer.addChild(this.selectionHighlight);
    this.objectLayer.addChild(this.sourceVelocityVector);
    this.objectLayer.addChild(this.observerVelocityVector);
    this.objectLayer.addChild(this.sourceTrail);
    this.objectLayer.addChild(this.observerTrail);

    // Create microphone node
    this.microphoneNode = this.createMicrophoneNode();
    this.objectLayer.addChild(this.microphoneNode);

    // Create graphs
    const graphElements = this.createGraphs();
    this.emittedGraph = graphElements.emittedGraph;
    this.observedGraph = graphElements.observedGraph;
    this.emittedWaveform = graphElements.emittedWaveform;
    this.observedWaveform = graphElements.observedWaveform;

    // Create status texts
    this.statusTexts = this.createStatusTexts();

    // Create scenario combo box
    const scenarioItems = [
      {
        value: Scenario.FREE_PLAY,
        createNode: () =>
          new Text("Free Play", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        value: Scenario.SCENARIO_1,
        createNode: () =>
          new Text("Source Moving Toward Observer", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        value: Scenario.SCENARIO_2,
        createNode: () =>
          new Text("Observer Moving Toward Source", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        value: Scenario.SCENARIO_3,
        createNode: () =>
          new Text("Observer and Source Moving Away", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        value: Scenario.SCENARIO_4,
        createNode: () =>
          new Text("Observer and Source Moving Perpendicular", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
    ];

    // Create combo box using SceneryStack API
    const scenarioComboBox = new ComboBox(
      model.scenarioProperty,
      scenarioItems,
      this,
    );

    // Position the combo box
    scenarioComboBox.left = 10;
    scenarioComboBox.top = 10;

    // Add to control layer
    this.controlLayer.addChild(scenarioComboBox);

    // Setup reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // Stop any ongoing interactions
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.controlLayer.addChild(resetAllButton);

    // Create scale mark node
    const scaleMarkNode = new Node({
      visibleProperty: this.visibleValuesProperty,
    });
    scaleMarkNode.left = resetAllButton.left - 50;
    scaleMarkNode.bottom = resetAllButton.bottom;

    // Create scale mark and label using the modelViewTransform
    const scaleModelLength = 10;
    const scaleViewLength =
      this.modelViewTransform.modelToViewDeltaY(scaleModelLength);

    // Create scale mark and label
    const scaleMark = new Line(0, 0, 0, scaleViewLength, {
      stroke: this.UI.CONNECTING_LINE_COLOR,
      lineWidth: 2,
    });

    // Position the scale mark to the left of the reset all button
    scaleMark.left = resetAllButton.left - 50; // Adjust as needed
    scaleMark.bottom = resetAllButton.bottom; // Align with the bottom of the reset button

    // Create end marks for the ruler effect
    const topEndMark = new Line(
      scaleMark.left - 5,
      scaleMark.top,
      scaleMark.left + 5,
      scaleMark.top,
      {
        stroke: this.UI.CONNECTING_LINE_COLOR,
        lineWidth: 2,
      },
    );

    // Create bottom end mark
    const bottomEndMark = new Line(
      scaleMark.left - 5,
      scaleMark.bottom,
      scaleMark.left + 5,
      scaleMark.bottom,
      {
        stroke: this.UI.CONNECTING_LINE_COLOR,
        lineWidth: 2,
      },
    );

    // Create scale label
    const scaleLabel = new Text(`${scaleModelLength}m`, {
      font: new PhetFont(14),
      fill: this.UI.TEXT_COLOR,
      left: scaleMark.right + 5, // Position label to the left of the scale mark
      centerY: scaleMark.centerY, // Position label slightly below the scale mark
    });

    // Add scale mark, end marks, and label to the scale mark node
    scaleMarkNode.addChild(scaleMark);
    scaleMarkNode.addChild(topEndMark);
    scaleMarkNode.addChild(bottomEndMark);
    scaleMarkNode.addChild(scaleLabel);
    this.controlLayer.addChild(scaleMarkNode);

    // Add time control node
    const timeControlNode = new TimeControlNode(this.model.playProperty, {
      timeSpeedProperty: this.model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            model.step(1 / 60, true);
          },
        },
      },
    });
    timeControlNode.centerX = this.layoutBounds.centerX;
    timeControlNode.bottom = this.layoutBounds.maxY - 10;
    this.controlLayer.addChild(timeControlNode);

    // Create instruction box
    this.instructionsBox = new Node();
    this.instructionsBox.visible = false; // Initially hidden
    this.controlLayer.addChild(this.instructionsBox);

    // Define padding
    const padding = 10; // Adjust padding as needed

    // Create the info button using the InfoButton from scenery-phet
    const infoButton = new InfoButton({
      listener: () => {
        this.instructionsBox.visible = !this.instructionsBox.visible;
        if (this.instructionsBox.visible) {
          this.drawInstructions(); // Draw instructions when shown
        }
      },
      // Position the button in the lower left corner with padding
      left: this.layoutBounds.minX + padding,
      bottom: this.layoutBounds.maxY - padding,
    });

    this.controlLayer.addChild(infoButton);

    // Create a panel
    this.createControlPanel();

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

    this.instructionsBox.centerX = this.layoutBounds.centerX;
    this.instructionsBox.centerY = this.layoutBounds.centerY;

    // Create and load click sound
    this.clickSound = new Sound('./assets/click.wav');

    // Update microphone visibility based on enabled property
    this.updateMicrophoneVisibility();
    this.model.microphoneEnabledProperty.lazyLink(() => {
      this.updateMicrophoneVisibility();
    });
  }

  /**
   * Reset the view to initial state
   */
  public reset(): void {
    // Reset selected object
    this.selectedObject = "source";

    // Update visibility directly
    this.instructionsBox.visible = false;

    this.visibleValuesProperty.reset();
    this.visibleVelocityArrowProperty.reset();
    this.visibleLineOfSightProperty.reset();
    this.visibleTrailsProperty.reset();

    // Clear wave nodes
    this.waveNodesMap.forEach((waveNode) => {
      this.waveLayer.removeChild(waveNode);
    });
    this.waveNodesMap.clear();

    // Reset microphone position
    this.updateMicrophoneVisibility();

    // Update view to match model
    this.updateView();
  }

  /**
   * Main step function called each frame
   */
  public step(): void {
    // Update view to match model
    this.updateView();
  }

  /**
   * Create graph elements
   */
  private createGraphs(): {
    emittedGraph: Rectangle;
    observedGraph: Rectangle;
    emittedWaveform: Path;
    observedWaveform: Path;
  } {
    const graphY1 = 30;
    const graphY2 = graphY1 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING;
    const graphX =
      this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN;

    // Create graph containers
    const emittedGraph = new Rectangle(
      graphX,
      graphY1,
      this.UI.GRAPH_WIDTH,
      this.UI.GRAPH_HEIGHT,
      {
        fill: this.UI.GRAPH_BACKGROUND,
        stroke: this.UI.GRAPH_GRID_COLOR,
        lineWidth: 1,
      },
    );

    const observedGraph = new Rectangle(
      graphX,
      graphY2,
      this.UI.GRAPH_WIDTH,
      this.UI.GRAPH_HEIGHT,
      {
        fill: this.UI.GRAPH_BACKGROUND,
        stroke: this.UI.GRAPH_GRID_COLOR,
        lineWidth: 1,
      },
    );

    // Create center lines for graphs
    const emittedCenterLine = new Line(
      graphX,
      graphY1 + this.UI.GRAPH_HEIGHT / 2,
      graphX + this.UI.GRAPH_WIDTH,
      graphY1 + this.UI.GRAPH_HEIGHT / 2,
      {
        stroke: this.UI.GRAPH_GRID_COLOR,
      },
    );

    const observedCenterLine = new Line(
      graphX,
      graphY2 + this.UI.GRAPH_HEIGHT / 2,
      graphX + this.UI.GRAPH_WIDTH,
      graphY2 + this.UI.GRAPH_HEIGHT / 2,
      {
        stroke: this.UI.GRAPH_GRID_COLOR,
      },
    );

    // Create waveform paths
    const emittedWaveform = new Path(new Shape(), {
      stroke: this.UI.SOURCE_COLOR,
      lineWidth: 2,
    });

    const observedWaveform = new Path(new Shape(), {
      stroke: this.UI.OBSERVER_COLOR,
      lineWidth: 2,
    });

    // Add graph titles
    const emittedTitle = new Text(STRINGS.GRAPHS.EMITTED_SOUND, {
      font: new PhetFont(12),
      fill: this.UI.TEXT_COLOR,
      left: graphX + 5,
      top: graphY1 + 15,
    });

    const observedTitle = new Text(STRINGS.GRAPHS.OBSERVED_SOUND, {
      font: new PhetFont(12),
      fill: this.UI.TEXT_COLOR,
      left: graphX + 5,
      top: graphY2 + 15,
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
      observedWaveform,
    };
  }

  /**
   * Create status text elements
   */
  private createStatusTexts() {
    const emittedFreq = new Text("", {
      font: new PhetFont(14),
      fill: this.UI.TEXT_COLOR,
      left: this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN,
      top: 15,
      visibleProperty: this.visibleValuesProperty,
    });

    const observedFreq = new Text("", {
      font: new PhetFont(14),
      fill: this.UI.TEXT_COLOR,
      left: this.layoutBounds.maxX - this.UI.GRAPH_WIDTH - this.UI.GRAPH_MARGIN,
      top: 30 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING - 15,
      visibleProperty: this.visibleValuesProperty,
    });

    const shiftStatus = new Text("", {
      font: new PhetFont(14),
      fill: this.UI.TEXT_COLOR,
      left: observedFreq.right + 0.75 * this.UI.GRAPH_WIDTH,
      top: 30 + this.UI.GRAPH_HEIGHT + this.UI.GRAPH_SPACING - 15,
      visibleProperty: this.visibleValuesProperty,
    });

    const selectedObject = new Text(
      STRINGS.SELECTED_OBJECT.replace("{{object}}", "Source"),
      {
        font: new PhetFont(14),
        fill: this.UI.SELECTION_COLOR,
        left: 120,
        bottom: this.layoutBounds.maxY - 15,
      },
    );

    // Add to control layer
    this.controlLayer.addChild(emittedFreq);
    this.controlLayer.addChild(observedFreq);
    this.controlLayer.addChild(shiftStatus);
    this.controlLayer.addChild(selectedObject);

    return {
      emittedFreq,
      observedFreq,
      shiftStatus,
      selectedObject,
    };
  }

  /**
   * Add model listeners to update view when model changes
   */
  private addModelListeners(): void {
    // Update source position
    this.model.sourcePositionProperty.lazyLink(() => {
      this.updatePositions();
    });

    // Update observer position
    this.model.observerPositionProperty.lazyLink(() => {
      this.updatePositions();
    });

    // Update source velocity
    this.model.sourceVelocityProperty.lazyLink(() => {
      this.updateVectors();
    });

    // Update observer velocity
    this.model.observerVelocityProperty.lazyLink(() => {
      this.updateVectors();
    });

    // Update frequencies
    this.model.emittedFrequencyProperty.lazyLink(() => {
      this.updateStatus();
    });

    this.model.observedFrequencyProperty.lazyLink(() => {
      this.updateStatus();
    });

    // Listen to waves collection
    this.model.waves.addItemAddedListener((wave) => {
      this.addWaveNode(wave);
    });

    this.model.waves.addItemRemovedListener((wave) => {
      this.removeWaveNode(wave);
    });

    // Listen for time speed changes to update waveform displays
    this.model.timeSpeedProperty.lazyLink(() => {
      this.updateGraphics();
    });

    // Listen for wave detection to play click sound
    this.model.waveDetectedProperty.lazyLink((detected) => {
      if (detected) {
        this.clickSound.play();
      }
    });
  }

  /**
   * Add drag handlers to source and observer nodes
   */
  private addDragHandlers(): void {
    // Source drag handler
    const sourceDragListener = new DragListener({
      targetNode: this.sourceNode,
      dragBoundsProperty: new Property(this.layoutBounds),
      start: (event) => {
        this.selectedObject = "source";
        this.updateSelectionHighlight();

        // Store the initial offset between pointer and source position
        const sourceViewPos = this.modelToView(
          this.model.sourcePositionProperty.value,
        );
        (
          sourceDragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = sourceViewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (sourceDragListener as DragListener & { dragOffset: Vector2 })
            .dragOffset,
        );
        const modelPoint = this.viewToModel(viewPoint);

        // Calculate desired velocity (direction to target)
        const desiredVelocity = modelPoint.minus(
          this.model.sourcePositionProperty.value,
        );

        // Limit velocity to maximum speed
        if (desiredVelocity.magnitude > PHYSICS.MAX_SPEED) {
          desiredVelocity.normalize().timesScalar(PHYSICS.MAX_SPEED);
        }

        // Apply velocity
        this.model.sourceVelocityProperty.value = desiredVelocity;
        this.model.sourceMovingProperty.value = true;
      },
    });
    this.sourceNode.addInputListener(sourceDragListener);

    // Observer drag handler
    const observerDragListener = new DragListener({
      targetNode: this.observerNode,
      dragBoundsProperty: new Property(this.layoutBounds),
      start: (event) => {
        this.selectedObject = "observer";
        this.updateSelectionHighlight();

        // Store the initial offset between pointer and observer position
        const observerViewPos = this.modelToView(
          this.model.observerPositionProperty.value,
        );
        (
          observerDragListener as DragListener & { dragOffset: Vector2 }
        ).dragOffset = observerViewPos.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(
          (observerDragListener as DragListener & { dragOffset: Vector2 })
            .dragOffset,
        );
        const modelPoint = this.viewToModel(viewPoint);

        // Calculate desired velocity (direction to target)
        const desiredVelocity = modelPoint.minus(
          this.model.observerPositionProperty.value,
        );

        // Limit velocity to maximum speed
        if (desiredVelocity.magnitude > PHYSICS.MAX_SPEED) {
          desiredVelocity.normalize().timesScalar(PHYSICS.MAX_SPEED);
        }

        // Apply velocity
        this.model.observerVelocityProperty.value = desiredVelocity;
        this.model.observerMovingProperty.value = true;
      },
    });
    this.observerNode.addInputListener(observerDragListener);
  }

  /**
   * Add keyboard listeners for controls
   */
  private addKeyboardListeners(): void {
    // Create a shared handler function for keydown events
    const handleKeydown = (key: string) => {
      // Handle object selection
      if (key === "s") {
        this.selectedObject = "source";
        this.updateSelectionHighlight();
      } else if (key === "o") {
        this.selectedObject = "observer";
        this.updateSelectionHighlight();
      }

      // Handle arrow key movement
      if (this.model.playProperty.value) {
        let targetVel, isMoving;

        // Determine which object to control
        if (this.selectedObject === "source") {
          targetVel = this.model.sourceVelocityProperty;
          isMoving = this.model.sourceMovingProperty;
        } else {
          targetVel = this.model.observerVelocityProperty;
          isMoving = this.model.observerMovingProperty;
        }

        // Set velocity based on key
        const velocity = new Vector2(0, 0);

        if (key === "arrowleft") {
          velocity.x = -60.0;
        } else if (key === "arrowright") {
          velocity.x = 60.0;
        }

        if (key === "arrowup") {
          velocity.y = -60.0;
        } else if (key === "arrowdown") {
          velocity.y = 60.0;
        }

        // Apply velocity if any keys were pressed
        if (velocity.magnitude > 0) {
          targetVel.value = velocity;
          isMoving.value = true;
        }
      }

      // Handle visibility toggles
      if (key === "t") {
        this.visibleTrailsProperty.value = !this.visibleTrailsProperty.value;
      }

      // Handle pause toggle
      if (key === " ") {
        this.model.playProperty.value = !this.model.playProperty.value;
      }

      // Handle reset
      if (key === "r") {
        this.model.reset();
        this.reset();
      }

      // Handle help toggle
      if (key === "h") {
        this.instructionsBox.visible = !this.instructionsBox.visible;
      }

      // Preset scenarios
      if (key === "1") {
        this.model.setupScenario(Scenario.SCENARIO_1);
      } else if (key === "2") {
        this.model.setupScenario(Scenario.SCENARIO_2);
      } else if (key === "3") {
        this.model.setupScenario(Scenario.SCENARIO_3);
      } else if (key === "4") {
        this.model.setupScenario(Scenario.SCENARIO_4);
      }

      // Adjust emitted frequency
      if (key === "+" || key === "=") {
        this.model.emittedFrequencyProperty.value += 0.01;
      } else if (key === "-" || key === "_") {
        this.model.emittedFrequencyProperty.value = Math.max(
          0.1,
          this.model.emittedFrequencyProperty.value - 0.01,
        );
      }

      // Adjust sound speed
      if (key === "." || key === ">") {
        this.model.soundSpeedProperty.value += 1.0;
      } else if (key === "," || key === "<") {
        this.model.soundSpeedProperty.value = Math.max(
          1.0,
          this.model.soundSpeedProperty.value - 1.0,
        );
      }

      // Handle microphone toggle with 'm' key
      if (key === "m") {
        this.model.microphoneEnabledProperty.value = !this.model.microphoneEnabledProperty.value;
      }
    };

    // Add key listeners to the view
    const keydownListener = {
      listener: (event: SceneryEvent<KeyboardEvent>) => {
        if (!event.domEvent) return;
        const key = event.domEvent.key.toLowerCase();
        handleKeydown(key);
      },
    };

    // Add the keyboard listener to the view
    this.addInputListener(keydownListener);

    // Also add a global keyboard listener to ensure we catch all keyboard events
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      handleKeydown(key);
    });
  }

  /**
   * Draw instructions on the instruction layer
   */
  private drawInstructions(): void {
    // Clear previous instructions
    this.instructionsBox.removeAllChildren();

    const background = new Rectangle(0, 0, this.layoutBounds.width / 2, 200, {
      fill: new Color(255, 255, 255, 0.8),
      cornerRadius: 5,
    });
    this.instructionsBox.addChild(background);

    // Title
    const title = new Text(STRINGS.TITLE, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      fill: this.UI.TEXT_COLOR,
      centerX: background.centerX,
      top: 10,
    });
    this.instructionsBox.addChild(title);

    // Instructions text
    const instructions = [
      STRINGS.HELP.DRAG_AND_DROP,
      STRINGS.HELP.KEYBOARD_CONTROLS,
      STRINGS.HELP.OBJECT_SELECTION,
      STRINGS.HELP.CONTROLS,
      STRINGS.HELP.ADJUST,
      STRINGS.HELP.SCENARIOS,
      "Press 'T' to toggle motion trails that show object paths.",
      "Press 'M' to toggle the microphone that clicks when waves pass through it.",
      "Drag the microphone to position it anywhere in the simulation."
    ];

    let yPosition = title.bottom + 15;

    instructions.forEach((instruction) => {
      const line = new Text(instruction, {
        font: new PhetFont(14),
        fill: this.UI.TEXT_COLOR,
        left: 15,
        top: yPosition,
      });
      this.instructionsBox.addChild(line);
      yPosition = line.bottom + 10;
    });

    // Adjust background to fit content
    background.setRectHeight(yPosition + 10);
    background.centerX = this.layoutBounds.centerX / 2;
    background.centerY = this.layoutBounds.centerY / 2;
  }

  /**
   * Update the view to match the model state
   */
  private updateView(): void {
    this.updatePositions();
    this.updateVectors();
    this.updateStatus();
    this.updateGraphics();
    this.updateTrails();
    this.updateMicrophoneVisibility();
  }

  /**
   * Update positions of objects in the view
   */
  private updatePositions(): void {
    // Update source and observer positions
    const sourcePos = this.model.sourcePositionProperty.value;
    const observerPos = this.model.observerPositionProperty.value;

    this.sourceNode.center = this.modelToView(sourcePos);
    this.observerNode.center = this.modelToView(observerPos);

    // Update connecting line between source and observer
    const viewSourcePos = this.modelToView(sourcePos);
    const viewObserverPos = this.modelToView(observerPos);

    this.connectingLine.setLine(
      viewSourcePos.x,
      viewSourcePos.y,
      viewObserverPos.x,
      viewObserverPos.y,
    );

    // Update selection highlight position
    if (this.selectedObject === "source") {
      this.selectionHighlight.radius = this.UI.SOURCE_RADIUS + 5;
      this.selectionHighlight.center = viewSourcePos;
    } else {
      this.selectionHighlight.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlight.center = viewObserverPos;
    }
  }

  /**
   * Update velocity vectors for source and observer
   */
  private updateVectors(): void {
    // Update source velocity vector
    this.updateVelocityVector(
      this.sourceVelocityVector,
      this.model.sourcePositionProperty.value,
      this.model.sourceVelocityProperty.value
    );

    // Update observer velocity vector
    this.updateVelocityVector(
      this.observerVelocityVector,
      this.model.observerPositionProperty.value,
      this.model.observerVelocityProperty.value
    );
  }

  /**
   * Update status displays and text information
   */
  private updateStatus(): void {
    // Update selection status text
    const selectedObjectName =
      this.selectedObject === "source" ? STRINGS.SOURCE : STRINGS.OBSERVER;

    this.statusTexts.selectedObject.string = STRINGS.SELECTED_OBJECT.replace(
      "{{object}}",
      selectedObjectName,
    );

    // Update frequency text displays
    const emittedFreq = this.model.emittedFrequencyProperty.value;
    const observedFreq = this.model.observedFrequencyProperty.value;

    this.statusTexts.emittedFreq.string =
      STRINGS.GRAPHS.EMITTED_FREQUENCY.replace(
        "{{value}}",
        emittedFreq.toFixed(2),
      );
    this.statusTexts.observedFreq.string =
      STRINGS.GRAPHS.OBSERVED_FREQUENCY.replace(
        "{{value}}",
        observedFreq.toFixed(2),
      );

    // Update Doppler shift status text
    if (observedFreq > emittedFreq) {
      this.statusTexts.shiftStatus.string = STRINGS.SHIFT.BLUESHIFT;
      this.statusTexts.shiftStatus.fill = this.UI.BLUESHIFT_COLOR;
    } else if (observedFreq < emittedFreq) {
      this.statusTexts.shiftStatus.string = STRINGS.SHIFT.REDSHIFT;
      this.statusTexts.shiftStatus.fill = this.UI.REDSHIFT_COLOR;
    } else {
      this.statusTexts.shiftStatus.string = "";
    }
  }

  /**
   * Update graphical elements (waves and waveforms)
   */
  private updateGraphics(): void {
    // Update waveforms in the graph displays
    this.updateWaveforms();

    // Update wave circles
    this.updateWaves();
  }

  /**
   * Update the selection highlight position and size
   */
  private updateSelectionHighlight(): void {
    if (this.selectedObject === "source") {
      this.selectionHighlight.radius = this.UI.SOURCE_RADIUS + 5;
      this.selectionHighlight.center = this.modelToView(
        this.model.sourcePositionProperty.value,
      );
      this.statusTexts.selectedObject.string = STRINGS.SELECTED_OBJECT.replace(
        "{{object}}",
        STRINGS.SOURCE,
      );
    } else {
      this.selectionHighlight.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlight.center = this.modelToView(
        this.model.observerPositionProperty.value,
      );
      this.statusTexts.selectedObject.string = STRINGS.SELECTED_OBJECT.replace(
        "{{object}}",
        STRINGS.OBSERVER,
      );
    }
  }

  /**
   * Add a wave node for a new wave in the model
   */
  private addWaveNode(wave: Wave): void {
    const waveNode = new Circle(0, {
      stroke: this.UI.WAVE_COLOR,
      fill: null,
      lineWidth: 2,
      opacity: 0.7,
      pickable: false,
    });

    this.waveLayer.addChild(waveNode);
    this.waveNodesMap.set(wave, waveNode);

    // Initial update
    this.updateWaveNode(wave);
  }

  /**
   * Remove a wave node when removed from the model
   */
  private removeWaveNode(wave: Wave): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      this.waveLayer.removeChild(waveNode);
      this.waveNodesMap.delete(wave);
    }
  }

  /**
   * Update visualization for a specific wave
   */
  private updateWaveNode(wave: Wave): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      // Update position to match wave's origin (convert to view coordinates)
      waveNode.center = this.modelToView(wave.position);

      // Update radius to match wave's propagation (convert to view coordinates)
      waveNode.radius = this.modelToViewDelta(new Vector2(wave.radius, 0)).x;

      // Update opacity based on age
      const maxAge = WAVE.MAX_AGE;
      const age = this.model.simulationTimeProperty.value - wave.birthTime;
      const opacity = 0.7 * (1 - age / maxAge);

      waveNode.opacity = Math.max(0, opacity);
    }
  }

  /**
   * Update all wave nodes to match model
   */
  private updateWaves(): void {
    // Update each wave node
    this.model.waves.forEach((wave) => {
      this.updateWaveNode(wave);
    });
  }

  /**
   * Update waveforms in the graph displays
   */
  private updateWaveforms(): void {
    // Update emitted sound waveform
    this.emittedWaveform.shape = this.createWaveformShape(
      this.emittedGraph.left,
      this.emittedGraph.centerY,
      this.emittedGraph.width,
      this.model.emittedWaveformData,
    );

    // Update observed sound waveform
    this.observedWaveform.shape = this.createWaveformShape(
      this.observedGraph.left,
      this.observedGraph.centerY,
      this.observedGraph.width,
      this.model.observedWaveformData,
    );
  }

  /**
   * Create a waveform shape from waveform data
   * @param graphX The x-coordinate of the left edge of the graph
   * @param graphY The y-coordinate of the center of the graph
   * @param graphWidth The width of the graph
   * @param waveformData The waveform data to render
   * @returns A Shape object representing the waveform
   */
  private createWaveformShape(
    graphX: number,
    graphY: number,
    graphWidth: number,
    waveformData: WaveformPoint[],
  ): Shape {
    const shape = new Shape();

    // Start at left edge
    shape.moveToPoint(new Vector2(graphX, graphY));

    let firstValidPointFound = false;

    for (let i = 0; i < waveformData.length; i++) {
      // Calculate x position using t instead of x
      const tRatio = Math.max(0, Math.min(1, waveformData[i].t));
      const x = graphX + tRatio * graphWidth;
      const y = graphY - waveformData[i].y;

      if (!firstValidPointFound) {
        shape.moveToPoint(new Vector2(x, y));
        firstValidPointFound = true;
      } else {
        shape.lineToPoint(new Vector2(x, y));
      }
    }

    return shape;
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
   * Update a velocity vector visualization
   */
  private updateVelocityVector(
    node: ArrowNode,
    position: Vector2,
    velocity: Vector2,
  ): void {

    // Convert model coordinates to view coordinates
    const viewPosition = this.modelToView(position);

    // Scale velocity vector for visualization
    // First scale by the model-view transform to convert m/s to pixels/s
    // Then scale by VELOCITY_VECTOR_SCALE to make it more visible
    const scaledVelocity = velocity.timesScalar(SCALE.VELOCITY_VECTOR);
    const viewVelocity = this.modelToViewDelta(scaledVelocity);

    // Create arrow node
    node.setTailAndTip(
      viewPosition.x,
      viewPosition.y,
      viewPosition.x + viewVelocity.x,
      viewPosition.y + viewVelocity.y,
    );
  }

  /**
   * Update motion trails for source and observer
   */
  private updateTrails(): void {
    // Get trail data from model
    const sourceTrail = this.model.sourceTrail;
    const observerTrail = this.model.observerTrail;

    // Set visibility based on property
    this.sourceTrail.visible = this.visibleTrailsProperty.value && sourceTrail.length > 0;
    this.observerTrail.visible = this.visibleTrailsProperty.value && observerTrail.length > 0;

    // If not visible or no points, return early
    if (!this.visibleTrailsProperty.value) {
      return;
    }

    // Create shapes for the trails
    const sourceShape = new Shape();
    const observerShape = new Shape();

    // Draw source trail with gradient
    if (sourceTrail.length > 0) {
      // First, build a new path with all points
      const oldestPoint = this.modelToView(sourceTrail[0].position);
      sourceShape.moveToPoint(oldestPoint);

      // Add each subsequent point
      for (let i = 1; i < sourceTrail.length; i++) {
        const point = this.modelToView(sourceTrail[i].position);
        sourceShape.lineToPoint(point);
      }

      // Update the path with the new shape
      this.sourceTrail.shape = sourceShape;

      // Calculate the gradient direction (from oldest to newest point)
      const startPoint = this.modelToView(sourceTrail[0].position);
      const endPoint = this.modelToView(sourceTrail[sourceTrail.length - 1].position);

      // Create gradient from oldest to newest point
      const sourceGradient = new LinearGradient(
        startPoint.x, startPoint.y,
        endPoint.x, endPoint.y
      );

      // Add color stops - transparent at oldest point, full color at newest
      sourceGradient.addColorStop(0, new Color(
        this.UI.SOURCE_COLOR.r,
        this.UI.SOURCE_COLOR.g,
        this.UI.SOURCE_COLOR.b,
        0.1
      ));
      sourceGradient.addColorStop(0.5, new Color(
        this.UI.SOURCE_COLOR.r,
        this.UI.SOURCE_COLOR.g,
        this.UI.SOURCE_COLOR.b,
        0.4
      ));
      sourceGradient.addColorStop(1, new Color(
        this.UI.SOURCE_COLOR.r,
        this.UI.SOURCE_COLOR.g,
        this.UI.SOURCE_COLOR.b,
        0.8
      ));

      // Apply the gradient
      this.sourceTrail.stroke = sourceGradient;
    }

    // Draw observer trail with gradient
    if (observerTrail.length > 0) {
      // First, build a new path with all points
      const oldestPoint = this.modelToView(observerTrail[0].position);
      observerShape.moveToPoint(oldestPoint);

      // Add each subsequent point
      for (let i = 1; i < observerTrail.length; i++) {
        const point = this.modelToView(observerTrail[i].position);
        observerShape.lineToPoint(point);
      }

      // Update the path with the new shape
      this.observerTrail.shape = observerShape;

      // Calculate the gradient direction (from oldest to newest point)
      const startPoint = this.modelToView(observerTrail[0].position);
      const endPoint = this.modelToView(observerTrail[observerTrail.length - 1].position);

      // Create gradient from oldest to newest point
      const observerGradient = new LinearGradient(
        startPoint.x, startPoint.y,
        endPoint.x, endPoint.y
      );

      // Add color stops - transparent at oldest point, full color at newest
      observerGradient.addColorStop(0, new Color(
        this.UI.OBSERVER_COLOR.r,
        this.UI.OBSERVER_COLOR.g,
        this.UI.OBSERVER_COLOR.b,
        0.1
      ));
      observerGradient.addColorStop(0.5, new Color(
        this.UI.OBSERVER_COLOR.r,
        this.UI.OBSERVER_COLOR.g,
        this.UI.OBSERVER_COLOR.b,
        0.4
      ));
      observerGradient.addColorStop(1, new Color(
        this.UI.OBSERVER_COLOR.r,
        this.UI.OBSERVER_COLOR.g,
        this.UI.OBSERVER_COLOR.b,
        0.8
      ));

      // Apply the gradient
      this.observerTrail.stroke = observerGradient;
    }
  }

  /**
   * Create the microphone node
   */
  private createMicrophoneNode(): Node {
    const microphoneNode = new Node({
      cursor: 'pointer'
    });

    // Position microphone at initial position
    const viewPosition = this.modelToView(this.model.microphonePositionProperty.value);
    microphoneNode.center = viewPosition;

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
    microphoneNode.addChild(micStem);
    microphoneNode.addChild(micBase);
    microphoneNode.addChild(micBody);
    microphoneNode.addChild(gridPattern);

    // Add highlight ring that shows when detecting waves
    const detectionRing = new Circle(20, {
      stroke: new Color(255, 255, 0),
      lineWidth: 2,
      visible: false
    });
    microphoneNode.addChild(detectionRing);

    // Add drag listener
    // Track whether we're currently dragging to prevent position feedback loops
    let isDragging = false;
    
    const micDragListener = new DragListener({
      targetNode: this,
      dragBoundsProperty: new Property(this.layoutBounds),
      start: (event) => {
        // Store the initial offset between pointer and mic position
        const micViewPos = microphoneNode.center;
        (micDragListener as DragListener & { dragOffset: Vector2 }).dragOffset = 
          micViewPos.minus(event.pointer.point);
        
        // Set dragging flag
        isDragging = true;
      },
      drag: (event) => {
        // Apply the offset to get the intended position
        const viewPoint = event.pointer.point.plus(
          (micDragListener as DragListener & { dragOffset: Vector2 }).dragOffset
        );
        
        // Convert view coordinates to model coordinates
        const modelPoint = this.viewToModel(viewPoint);

        // Update microphone position in model
        this.model.microphonePositionProperty.value = modelPoint;
        
        // Update node position directly using the exact view coordinates
        // This ensures no transformation errors accumulate
        microphoneNode.center = viewPoint;
      },
      end: () => {
        // Clear dragging flag when drag ends
        isDragging = false;
      }
    });
    microphoneNode.addInputListener(micDragListener);
    
    // Update position from model changes, but only when not dragging
    this.model.microphonePositionProperty.lazyLink(() => {
      if (!isDragging) {
        const viewPosition = this.modelToView(this.model.microphonePositionProperty.value);
        microphoneNode.center = viewPosition;
      }
    });

    // Add listener for wave detection
    this.model.waveDetectedProperty.lazyLink((detected) => {
      if (detected) {
        // Show detection ring
        detectionRing.visible = true;
        
        // Play click sound
        this.clickSound.play();
        
        // Hide ring after a short delay
        setTimeout(() => {
          detectionRing.visible = false;
        }, 100);
      }
    });

    return microphoneNode;
  }

  /**
   * Create a panel
   */
  private createControlPanel(): void {
    const items: VerticalCheckboxGroupItem[] = [
      {
        property: this.visibleValuesProperty,
        createNode: () =>
          new Text(STRINGS.CONTROLS.VALUES, {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        property: this.visibleVelocityArrowProperty,
        createNode: () =>
          new Text(STRINGS.CONTROLS.VELOCITY_ARROWS, {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        property: this.visibleLineOfSightProperty,
        createNode: () =>
          new Text(STRINGS.CONTROLS.LINE_OF_SIGHT, {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        property: this.visibleTrailsProperty,
        createNode: () =>
          new Text(STRINGS.CONTROLS.MOTION_TRAILS, {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
      {
        property: this.model.microphoneEnabledProperty,
        createNode: () =>
          new Text("Microphone Clicks", {
            font: new PhetFont(14),
            fill: this.UI.TEXT_COLOR,
          }),
      },
    ];

    const checkboxGroup = new VerticalCheckboxGroup(items);

    const soundSpeedControl = new NumberControl(
      STRINGS.CONTROLS.SOUND_SPEED,
      this.model.soundSpeedProperty,
      this.model.soundSpeedRange,
      {
        layoutFunction: NumberControl.createLayoutFunction2({ ySpacing: 12 }),
        numberDisplayOptions: {
          valuePattern: STRINGS.UNITS.METERS_PER_SECOND,
        },
        titleNodeOptions: {
          font: new PhetFont(12),
          maxWidth: 140,
        },
      },
    );
    soundSpeedControl.top = checkboxGroup.bottom + 10;

    const frequencyControl = new NumberControl(
      STRINGS.CONTROLS.FREQUENCY,
      this.model.emittedFrequencyProperty,
      this.model.frequencyRange,
      {
        layoutFunction: NumberControl.createLayoutFunction2({ ySpacing: 12 }),
        numberDisplayOptions: {
          valuePattern: STRINGS.UNITS.HERTZ,
        },
        titleNodeOptions: {
          font: new PhetFont(12),
          maxWidth: 140,
        },
      },
    );
    frequencyControl.top = soundSpeedControl.bottom + 10;

    const panelContent = new Node({
      children: [checkboxGroup, soundSpeedControl, frequencyControl],
    });
    const panel = new Panel(panelContent, {
      right: this.observedGraph.right,
      top: this.observedGraph.bottom + 10,
    });

    this.controlLayer.addChild(panel);
  }
  
  /**
   * Update the microphone visibility based on the enabled property
   */
  private updateMicrophoneVisibility(): void {
    this.microphoneNode.visible = this.model.microphoneEnabledProperty.value;
  }
}
