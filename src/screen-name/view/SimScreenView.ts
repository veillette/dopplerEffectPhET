import {
  Circle,
  Color,
  Line,
  ModelViewTransform2,
  Node,
  Path,
  Rectangle,
  Shape,
  Text,
  Vector2,
} from "scenerystack";
import {
  ArrowNode,
  InfoButton,
  PhetFont,
  ResetAllButton,
} from "scenerystack/scenery-phet";
import { ComboBox } from "scenerystack/sun";
import { Scenario, SimModel } from "../model/SimModel";
import { PHYSICS, SCALE } from "../model/SimConstants";
import { Property } from "scenerystack/axon";
import { ScreenView, ScreenViewOptions } from "scenerystack/sim";
import strings from "../../strings_en.json";
import { Sound } from "./Sound";
import { MicrophoneNode } from "./MicrophoneNode";

// Import components directly
import { ControlPanelNode } from "./components/ControlPanelNode";
import { GraphDisplayNode } from "./components/GraphDisplayNode";
import { InstructionsNode } from "./components/InstructionsNode";
import { StatusTextNode } from "./components/StatusTextNode";

// Import managers directly
import { DragHandlerManager } from "./managers/DragHandlerManager";
import { KeyboardHandlerManager } from "./managers/KeyboardHandlerManager";
import { WaveManager } from "./managers/WaveManager";
import { VectorDisplayManager } from "./managers/VectorDisplayManager";
import { TrailManager } from "./managers/TrailManager";
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
    BLUEShift: strings["doppler-effect.shift.blueshift"].value,
    REDshift: strings["doppler-effect.shift.redshift"].value,
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
  private readonly microphoneNode: MicrophoneNode;
  private readonly sourceVelocityVector: ArrowNode;
  private readonly observerVelocityVector: ArrowNode;
  private readonly connectingLine: Line;
  private readonly selectionHighlight: Circle;
  private readonly sourceTrail: Path;
  private readonly observerTrail: Path;

  // Components
  private readonly graphDisplay: GraphDisplayNode;
  private readonly statusDisplay: StatusTextNode;
  private readonly controlPanel: ControlPanelNode;
  private readonly instructionsDisplay: InstructionsNode;

  // Managers
  private readonly dragManager: DragHandlerManager;
  private readonly keyboardManager: KeyboardHandlerManager;
  private readonly waveManager: WaveManager;
  private readonly vectorManager: VectorDisplayManager;
  private readonly trailManager: TrailManager;

  // Visibility properties
  private readonly visibleValuesProperty: Property<boolean>;
  private readonly visibleVelocityArrowProperty: Property<boolean>;
  private readonly visibleLineOfSightProperty: Property<boolean>;
  private readonly visibleTrailsProperty: Property<boolean>;

  // Selection tracking
  private readonly selectedObjectProperty: Property<"source" | "observer"> =
    new Property<"source" | "observer">("source");

  // UI constants
  private readonly UI = {
    SOURCE_RADIUS: 10,
    OBSERVER_RADIUS: 10,
    SOURCE_COLOR: new Color(255, 0, 0),
    OBSERVER_COLOR: new Color(0, 0, 255),
    CONNECTING_LINE_COLOR: new Color(100, 100, 100),
    WAVE_COLOR: new Color(100, 100, 100),
    SELECTION_COLOR: new Color(255, 255, 0),
    GRAPH_BACKGROUND: new Color(240, 240, 240),
    GRAPH_GRID_COLOR: new Color(200, 200, 200),
    TEXT_COLOR: new Color(0, 0, 0),
    REDSHIFT_COLOR: new Color(255, 40, 40),
    BLUESHIFT_COLOR: new Color(40, 40, 255),
    GRAPH_HEIGHT: 60,
    GRAPH_WIDTH: 300,
    GRAPH_MARGIN: 20,
    GRAPH_SPACING: 10,
    TRAIL_WIDTH: 2,
  };

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

    // Create property values
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
    this.microphoneNode = new MicrophoneNode(
      this.modelViewTransform,
      this.model.microphonePositionProperty,
      this.model.waveDetectedProperty,
      new Property(
        this.modelViewTransform.viewToModelBounds(this.layoutBounds),
      ),
    );
    this.objectLayer.addChild(this.microphoneNode);

    // Initialize managers
    this.waveManager = new WaveManager(
      this.waveLayer,
      this.modelViewTransform,
      this.UI.WAVE_COLOR,
    );

    this.vectorManager = new VectorDisplayManager(
      this.modelViewTransform,
      SCALE.VELOCITY_VECTOR,
    );

    this.trailManager = new TrailManager(
      this.sourceTrail,
      this.observerTrail,
      this.modelViewTransform,
      this.UI.SOURCE_COLOR,
      this.UI.OBSERVER_COLOR,
      this.visibleTrailsProperty,
    );

    this.dragManager = new DragHandlerManager(this.modelViewTransform, {
      minX: this.layoutBounds.minX,
      minY: this.layoutBounds.minY,
      maxX: this.layoutBounds.maxX,
      maxY: this.layoutBounds.maxY,
    });

    this.keyboardManager = new KeyboardHandlerManager();

    // Create graph display component
    this.graphDisplay = new GraphDisplayNode(
      {
        EMITTED_SOUND: STRINGS.GRAPHS.EMITTED_SOUND,
        OBSERVED_SOUND: STRINGS.GRAPHS.OBSERVED_SOUND,
      },
      {
        layoutBounds: {
          maxX: this.layoutBounds.maxX,
        },
        textColor: this.UI.TEXT_COLOR,
        graphBackground: this.UI.GRAPH_BACKGROUND,
        graphGridColor: this.UI.GRAPH_GRID_COLOR,
        sourceColor: this.UI.SOURCE_COLOR,
        observerColor: this.UI.OBSERVER_COLOR,
        graphHeight: this.UI.GRAPH_HEIGHT,
        graphWidth: this.UI.GRAPH_WIDTH,
        graphMargin: this.UI.GRAPH_MARGIN,
        graphSpacing: this.UI.GRAPH_SPACING,
      },
    );
    this.graphLayer.addChild(this.graphDisplay);

    // Create status text display
    this.statusDisplay = new StatusTextNode(
      {
        EMITTED_FREQUENCY: STRINGS.GRAPHS.EMITTED_FREQUENCY,
        OBSERVED_FREQUENCY: STRINGS.GRAPHS.OBSERVED_FREQUENCY,
        SELECTED_OBJECT: STRINGS.SELECTED_OBJECT,
        BLUESHIFT: STRINGS.SHIFT.BLUEShift,
        REDSHIFT: STRINGS.SHIFT.REDshift,
        SOURCE: STRINGS.SOURCE,
        OBSERVER: STRINGS.OBSERVER,
      },
      this.visibleValuesProperty,
      {
        layoutBounds: {
          maxX: this.layoutBounds.maxX,
          maxY: this.layoutBounds.maxY,
        },
        textColor: this.UI.TEXT_COLOR,
        blueshiftColor: this.UI.BLUESHIFT_COLOR,
        redshiftColor: this.UI.REDSHIFT_COLOR,
        selectionColor: this.UI.SELECTION_COLOR,
        graphWidth: this.UI.GRAPH_WIDTH,
        graphHeight: this.UI.GRAPH_HEIGHT,
        graphMargin: this.UI.GRAPH_MARGIN,
        graphSpacing: this.UI.GRAPH_SPACING,
      },
    );
    this.controlLayer.addChild(this.statusDisplay);

    // Create instructions display
    this.instructionsDisplay = new InstructionsNode(
      {
        TITLE: STRINGS.TITLE,
        DRAG_AND_DROP: STRINGS.HELP.DRAG_AND_DROP,
        KEYBOARD_CONTROLS: STRINGS.HELP.KEYBOARD_CONTROLS,
        OBJECT_SELECTION: STRINGS.HELP.OBJECT_SELECTION,
        CONTROLS: STRINGS.HELP.CONTROLS,
        ADJUST: STRINGS.HELP.ADJUST,
        SCENARIOS: STRINGS.HELP.SCENARIOS,
      },
      {
        layoutBounds: {
          centerX: this.layoutBounds.centerX,
          centerY: this.layoutBounds.centerY,
          width: this.layoutBounds.width,
        },
        textColor: this.UI.TEXT_COLOR,
      },
    );
    this.controlLayer.addChild(this.instructionsDisplay);

    // Create control panel
    this.controlPanel = new ControlPanelNode(
      {
        VALUES: STRINGS.CONTROLS.VALUES,
        VELOCITY_ARROWS: STRINGS.CONTROLS.VELOCITY_ARROWS,
        LINE_OF_SIGHT: STRINGS.CONTROLS.LINE_OF_SIGHT,
        SOUND_SPEED: STRINGS.CONTROLS.SOUND_SPEED,
        FREQUENCY: STRINGS.CONTROLS.FREQUENCY,
        MOTION_TRAILS: STRINGS.CONTROLS.MOTION_TRAILS,
        METERS_PER_SECOND: STRINGS.UNITS.METERS_PER_SECOND,
        HERTZ: STRINGS.UNITS.HERTZ,
      },
      this.visibleValuesProperty,
      this.visibleVelocityArrowProperty,
      this.visibleLineOfSightProperty,
      this.visibleTrailsProperty,
      this.model.microphoneEnabledProperty,
      this.model.soundSpeedProperty,
      this.model.emittedFrequencyProperty,
      this.model.soundSpeedRange,
      this.model.frequencyRange,
      {
        textColor: this.UI.TEXT_COLOR,
        graphRight: this.graphDisplay.right,
        graphBottom: this.graphDisplay.observedGraphBottom,
      },
    );
    this.controlLayer.addChild(this.controlPanel);

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

    // Create an info button to toggle instructions
    const infoButton = new InfoButton({
      listener: () => {
        this.instructionsDisplay.toggleVisibility();
      },
      // Position the button in the lower left corner with padding
      left: this.layoutBounds.minX + 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    this.controlLayer.addChild(infoButton);

    // Setup keyboard handlers
    this.keyboardManager.attachKeyboardHandlers(
      this,
      {
        onSourceSelected: () => this.updateSelectionHighlight(),
        onObserverSelected: () => this.updateSelectionHighlight(),
        onToggleTrails: () => {
          this.visibleTrailsProperty.value = !this.visibleTrailsProperty.value;
        },
        onToggleHelp: () => {
          this.instructionsDisplay.toggleVisibility();
        },
        onReset: () => {
          this.model.reset();
          this.reset();
        },
      },
      this.model.playProperty,
      this.model.setupScenario.bind(this.model),
      this.model.sourceVelocityProperty,
      this.model.observerVelocityProperty,
      this.model.sourceMovingProperty,
      this.model.observerMovingProperty,
      this.model.emittedFrequencyProperty,
      this.model.soundSpeedProperty,
      this.model.microphoneEnabledProperty,
      this.selectedObjectProperty,
    );

    // Setup drag handlers
    this.dragManager.attachDragHandlers(
      this.sourceNode,
      this.observerNode,
      this.model.sourcePositionProperty,
      this.model.observerPositionProperty,
      this.model.sourceVelocityProperty,
      this.model.observerVelocityProperty,
      this.model.sourceMovingProperty,
      this.model.observerMovingProperty,
      () => {
        this.selectedObjectProperty.value = "source";
        this.updateSelectionHighlight();
      },
      () => {
        this.selectedObjectProperty.value = "observer";
        this.updateSelectionHighlight();
      },
      PHYSICS.MAX_SPEED,
    );

    // Create and load click sound
    this.clickSound = new Sound("./assets/click.wav", true);

    // Setup model listeners
    this.addModelListeners();

    // Initial view update
    this.updateView();

    // Update microphone visibility based on enabled property
    this.microphoneNode.visible = this.model.microphoneEnabledProperty.value;
    this.model.microphoneEnabledProperty.lazyLink(() => {
      this.microphoneNode.visible = this.model.microphoneEnabledProperty.value;
    });
  }

  /**
   * Reset the view to initial state
   */
  public reset(): void {
    // Reset selected object
    this.selectedObjectProperty.reset();

    // Update visibility directly
    this.instructionsDisplay.setVisible(false);

    // Reset property values
    this.visibleValuesProperty.reset();
    this.visibleVelocityArrowProperty.reset();
    this.visibleLineOfSightProperty.reset();
    this.visibleTrailsProperty.reset();

    // Reset components
    this.waveManager.clearWaveNodes();
    this.graphDisplay.reset();
    this.trailManager.reset();

    // Update microphone visibility
    this.microphoneNode.visible = this.model.microphoneEnabledProperty.value;

    // Update microphone position to match model's reset position
    const micViewPos = this.modelViewTransform.modelToViewPosition(
      this.model.microphonePositionProperty.value,
    );
    this.microphoneNode.center = micViewPos;

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
   * Add model listeners
   */
  private addModelListeners(): void {
    // Update source position/velocity visualization when model properties change
    this.model.sourcePositionProperty.link(() => this.updateView());
    this.model.observerPositionProperty.link(() => this.updateView());
    this.model.sourceVelocityProperty.link(() => this.updateView());
    this.model.observerVelocityProperty.link(() => this.updateView());

    // Listen for changes to wave collection
    this.model.waves.addItemAddedListener((wave) => {
      this.waveManager.addWaveNode(wave);
    });

    this.model.waves.addItemRemovedListener((wave) => {
      this.waveManager.removeWaveNode(wave);
    });

    // Update waveforms when model changes
    this.model.simulationTimeProperty.link(() => {
      this.graphDisplay.updateWaveforms(
        this.model.emittedWaveformData,
        this.model.observedWaveformData,
      );
    });

    // Update text displays when frequency changes
    this.model.emittedFrequencyProperty.link(() => this.updateText());
    this.model.observedFrequencyProperty.link(() => this.updateText());

    // Update when selection changes
    this.selectedObjectProperty.link(() => this.updateText());

    // Listen for wave detection to play click sound
    this.model.waveDetectedProperty.link((detected) => {
      if (detected) {
        this.clickSound.play();
      }
    });
  }

  /**
   * Update the view
   */
  private updateView(): void {
    // Update object positions
    this.sourceNode.center = this.modelViewTransform.modelToViewPosition(
      this.model.sourcePositionProperty.value
    );
    this.observerNode.center = this.modelViewTransform.modelToViewPosition(
      this.model.observerPositionProperty.value
    );

    // Update selection highlight
    this.updateSelectionHighlight();

    // Update line of sight
    const sourcePos = this.modelViewTransform.modelToViewPosition(
      this.model.sourcePositionProperty.value
    );
    const observerPos = this.modelViewTransform.modelToViewPosition(
      this.model.observerPositionProperty.value
    );
    this.connectingLine.setLine(
      sourcePos.x,
      sourcePos.y,
      observerPos.x,
      observerPos.y
    );

    // Update velocity vectors
    this.vectorManager.updateVectors(
      this.sourceVelocityVector,
      this.observerVelocityVector,
      this.model.sourcePositionProperty.value,
      this.model.observerPositionProperty.value,
      this.model.sourceVelocityProperty.value,
      this.model.observerVelocityProperty.value
    );

    // Update motion trails
    this.trailManager.updateTrails(
      this.model.sourceTrail,
      this.model.observerTrail
    );

    // Update waves
    this.waveManager.updateWaves(
      this.model.waves,
      this.model.simulationTimeProperty.value
    );

    // Update text displays
    this.updateText();
  }

  /**
   * Update text displays with current values
   */
  private updateText(): void {
    const selectedObjectName =
      this.selectedObjectProperty.value === "source"
        ? STRINGS.SOURCE
        : STRINGS.OBSERVER;

    // Update status display with current values
    this.statusDisplay.updateValues(
      this.model.emittedFrequencyProperty.value,
      this.model.observedFrequencyProperty.value,
      selectedObjectName,
    );
  }

  /**
   * Update the selection highlight position and size
   */
  private updateSelectionHighlight(): void {
    if (this.selectedObjectProperty.value === "source") {
      this.selectionHighlight.radius = this.UI.SOURCE_RADIUS + 5;
      this.selectionHighlight.center = this.modelViewTransform.modelToViewPosition(
        this.model.sourcePositionProperty.value
      );
    } else {
      this.selectionHighlight.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlight.center = this.modelViewTransform.modelToViewPosition(
        this.model.observerPositionProperty.value
      );
    }
  }
}

