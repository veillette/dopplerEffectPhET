import {
  Circle,
  Color,
  Line,
  ModelViewTransform2,
  Node,
  Path,
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
import { Sound } from "./utils/Sound";
import { MicrophoneNode } from "./components/MicrophoneNode";

// Import components directly
import { ControlPanelNode } from "./components/ControlPanelNode";
import { GraphDisplayNode } from "./components/GraphDisplayNode";
import { InstructionsNode } from "./components/InstructionsNode";
import { StatusTextNode } from "./components/StatusTextNode";
import { ScaleMarkNode } from "./components/ScaleMarkNode";

// Import managers directly
import { DragHandlerManager } from "./managers/DragHandlerManager";
import { KeyboardHandlerManager } from "./managers/KeyboardHandlerManager";
import { WaveManager } from "./managers/WaveManager";
import { VectorDisplayManager } from "./managers/VectorDisplayManager";
import { TrailManager } from "./managers/TrailManager";

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
    MOTION_TRAILS: strings["doppler-effect.controls.motionTrails"].value,
    MICROPHONE_CLICKS:
      strings["doppler-effect.controls.microphoneClicks"].value,
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
    TOGGLE_MOTION_TRAILS:
      strings["doppler-effect.help.toggleMotionTrails"].value,
    TOGGLE_MICROPHONE: strings["doppler-effect.help.toggleMicrophone"].value,
    DRAG_MICROPHONE: strings["doppler-effect.help.dragMicrophone"].value,
  },
  SCENARIOS: {
    FREE_PLAY: strings["doppler-effect.scenarios.freePlay"].value,
    SOURCE_MOVING_TOWARD_OBSERVER:
      strings["doppler-effect.scenarios.sourceMovingTowardObserver"].value,
    OBSERVER_MOVING_TOWARD_SOURCE:
      strings["doppler-effect.scenarios.observerMovingTowardSource"].value,
    MOVING_AWAY: strings["doppler-effect.scenarios.movingAway"].value,
    PERPENDICULAR: strings["doppler-effect.scenarios.perpendicular"].value,
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
  private readonly waveManager: WaveManager;
  private readonly vectorManager: VectorDisplayManager;
  private readonly sourceTrailManager: TrailManager;
  private readonly observerTrailManager: TrailManager;
  private readonly sourceDragManager: DragHandlerManager;
  private readonly observerDragManager: DragHandlerManager;
  private readonly keyboardManager: KeyboardHandlerManager;

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

    // Create display layers and add to the view in correct order (waves behind objects)
    this.waveLayer = new Node();
    this.objectLayer = new Node();
    this.controlLayer = new Node();
    this.graphLayer = new Node();

    [
      this.waveLayer,
      this.objectLayer,
      this.graphLayer,
      this.controlLayer,
    ].forEach((layer) => this.addChild(layer));

    // Create source and observer nodes
    this.sourceNode = new Circle(this.UI.SOURCE_RADIUS, {
      fill: this.UI.SOURCE_COLOR,
      cursor: "pointer"
    });

    this.observerNode = new Circle(this.UI.OBSERVER_RADIUS, {
      fill: this.UI.OBSERVER_COLOR,
      cursor: "pointer"
    });

    // Create connecting line
    this.connectingLine = new Line(0, 0, 0, 0, {
      visibleProperty: this.visibleLineOfSightProperty,
      stroke: this.UI.CONNECTING_LINE_COLOR,
      lineDash: [10, 5],
    });

    // Create selection highlight
    this.selectionHighlight = new Circle(this.UI.SOURCE_RADIUS + 5, {
      stroke: this.UI.SELECTION_COLOR,
      lineWidth: 2
    });

    // Create velocity vector nodes
    const velocityVectorOptions = {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 2,
      scaleTailToo: true,
      visibleProperty: this.visibleVelocityArrowProperty,
    };

    this.sourceVelocityVector = new ArrowNode(
      0,
      0,
      0,
      0,
      velocityVectorOptions,
    );
    this.observerVelocityVector = new ArrowNode(
      0,
      0,
      0,
      0,
      velocityVectorOptions,
    );

    // Create trail paths
    this.sourceTrail = new Path(new Shape(), {
      stroke: this.UI.SOURCE_COLOR,
      lineWidth: this.UI.TRAIL_WIDTH
    });
    this.observerTrail = new Path(new Shape(), {
      stroke: this.UI.OBSERVER_COLOR,
      lineWidth: this.UI.TRAIL_WIDTH
    });

    // Add objects to object layer
    this.objectLayer.addChild(this.connectingLine);
    this.objectLayer.addChild(this.selectionHighlight);
    this.objectLayer.addChild(this.sourceNode);
    this.objectLayer.addChild(this.observerNode);
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

    this.sourceTrailManager = new TrailManager(
      this.sourceTrail,
      this.modelViewTransform,
      this.UI.SOURCE_COLOR,
      this.visibleTrailsProperty,
    );

    this.observerTrailManager = new TrailManager(
      this.observerTrail,
      this.modelViewTransform,
      this.UI.OBSERVER_COLOR,
      this.visibleTrailsProperty,
    );

    // Create separate drag managers for source and observer
    const dragBounds = {
      minX: this.layoutBounds.minX,
      minY: this.layoutBounds.minY,
      maxX: this.layoutBounds.maxX,
      maxY: this.layoutBounds.maxY,
    };

    this.sourceDragManager = new DragHandlerManager(
      this.modelViewTransform,
      dragBounds,
    );
    this.observerDragManager = new DragHandlerManager(
      this.modelViewTransform,
      dragBounds,
    );

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
        TOGGLE_MOTION_TRAILS: STRINGS.HELP.TOGGLE_MOTION_TRAILS,
        TOGGLE_MICROPHONE: STRINGS.HELP.TOGGLE_MICROPHONE,
        DRAG_MICROPHONE: STRINGS.HELP.DRAG_MICROPHONE,
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
        MICROPHONE_CLICKS: STRINGS.CONTROLS.MICROPHONE_CLICKS,
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

    // Create scenario items for the combo box
    const scenarioItems = this.createScenarioItems(this.UI.TEXT_COLOR);

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

    // Create scale mark node to show model-to-view scale
    const scaleMarkNode = new ScaleMarkNode(
      this.modelViewTransform,
      this.visibleValuesProperty,
      {
        textColor: this.UI.TEXT_COLOR,
        lineColor: this.UI.CONNECTING_LINE_COLOR,
        scaleModelLength: 20, // 20 meters scale for better visibility
      },
    );

    // Position the scale mark to the left of the reset all button
    scaleMarkNode.right = resetAllButton.left - 30;
    scaleMarkNode.bottom = resetAllButton.bottom;
    this.controlLayer.addChild(scaleMarkNode);

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
    this.sourceDragManager.attachDragHandler(
      this.sourceNode,
      this.model.sourcePositionProperty,
      this.model.sourceVelocityProperty,
      this.model.sourceMovingProperty,
      () => {
        this.selectedObjectProperty.value = "source";
        this.updateSelectionHighlight();
      },
      PHYSICS.MAX_SPEED,
    );

    this.observerDragManager.attachDragHandler(
      this.observerNode,
      this.model.observerPositionProperty,
      this.model.observerVelocityProperty,
      this.model.observerMovingProperty,
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
    this.sourceTrailManager.reset();
    this.observerTrailManager.reset();

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
   * Add model listeners
   */
  private addModelListeners(): void {
    // Update view whenever position or velocity changes
    const updateOnChange = () => this.updateView();

    this.model.sourcePositionProperty.link(updateOnChange);
    this.model.observerPositionProperty.link(updateOnChange);
    this.model.sourceVelocityProperty.link(updateOnChange);
    this.model.observerVelocityProperty.link(updateOnChange);

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

    // Update text displays when relevant properties change
    const updateTextOnChange = () => this.updateText();

    this.model.emittedFrequencyProperty.link(updateTextOnChange);
    this.model.observedFrequencyProperty.link(updateTextOnChange);
    this.selectedObjectProperty.link(updateTextOnChange);

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
      this.model.sourcePositionProperty.value,
    );
    this.observerNode.center = this.modelViewTransform.modelToViewPosition(
      this.model.observerPositionProperty.value,
    );

    // Update selection highlight
    this.updateSelectionHighlight();

    // Update line of sight
    const sourcePos = this.modelViewTransform.modelToViewPosition(
      this.model.sourcePositionProperty.value,
    );
    const observerPos = this.modelViewTransform.modelToViewPosition(
      this.model.observerPositionProperty.value,
    );
    this.connectingLine.setLine(
      sourcePos.x,
      sourcePos.y,
      observerPos.x,
      observerPos.y,
    );

    // Update velocity vectors
    this.vectorManager.updateVectors(
      this.sourceVelocityVector,
      this.observerVelocityVector,
      this.model.sourcePositionProperty.value,
      this.model.observerPositionProperty.value,
      this.model.sourceVelocityProperty.value,
      this.model.observerVelocityProperty.value,
    );

    // Update motion trails
    this.sourceTrailManager.updateTrail(this.model.sourceTrail);
    this.observerTrailManager.updateTrail(this.model.observerTrail);

    // Update waves
    this.waveManager.updateWaves(
      this.model.waves,
      this.model.simulationTimeProperty.value,
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
      this.selectionHighlight.center =
        this.modelViewTransform.modelToViewPosition(
          this.model.sourcePositionProperty.value,
        );
    } else {
      this.selectionHighlight.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlight.center =
        this.modelViewTransform.modelToViewPosition(
          this.model.observerPositionProperty.value,
        );
    }
  }

  /**
   * Create scenario items for the combo box
   * @param textColor - The color for the scenario text
   * @returns Array of scenario items for the combo box
   */
  private createScenarioItems(textColor: Color) {
    return [
      {
        value: Scenario.FREE_PLAY,
        createNode: () =>
          new Text(STRINGS.SCENARIOS.FREE_PLAY, {
            font: new PhetFont(14),
            fill: textColor
          }),
      },
      {
        value: Scenario.SCENARIO_1,
        createNode: () =>
          new Text(STRINGS.SCENARIOS.SOURCE_MOVING_TOWARD_OBSERVER, {
            font: new PhetFont(14),
            fill: textColor
          }),
      },
      {
        value: Scenario.SCENARIO_2,
        createNode: () =>
          new Text(STRINGS.SCENARIOS.OBSERVER_MOVING_TOWARD_SOURCE, {
            font: new PhetFont(14),
            fill: textColor
          }),
      },
      {
        value: Scenario.SCENARIO_3,
        createNode: () =>
          new Text(STRINGS.SCENARIOS.MOVING_AWAY, {
            font: new PhetFont(14),
            fill: textColor
          }),
      },
      {
        value: Scenario.SCENARIO_4,
        createNode: () =>
          new Text(STRINGS.SCENARIOS.PERPENDICULAR, {
            font: new PhetFont(14),
            fill: textColor
          }),
      },
    ];
  }
}
