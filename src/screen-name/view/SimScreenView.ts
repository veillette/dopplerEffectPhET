import {
  ArrowNode,
  Circle,
  ComboBox,
  DerivedProperty,
  ModelViewTransform2,
  Node,
  Path,
  PhetFont,
  Property,
  ResetAllButton,
  Shape,
  Text,
  TimeControlNode,
  Vector2,
  ProfileColorProperty,
  Bounds2,
  TReadOnlyProperty,
} from "scenerystack";
import { ScreenView, ScreenViewOptions } from "scenerystack/sim";
import { Scenario, SimModel } from "../model/SimModel";
import { PHYSICS, SCALE } from "../model/SimConstants";
import { StringManager } from "../../i18n/StringManager";
import { Sound } from "./utils/Sound";
import { MicrophoneNode } from "./components/MicrophoneNode";
import DopplerEffectColors from "../../DopplerEffectColors";

// Import components directly
import { ControlPanelNode } from "./components/ControlPanelNode";
import { GraphDisplayNode } from "./components/GraphDisplayNode";
import { StatusTextNode } from "./components/StatusTextNode";
import { ScaleMarkNode } from "./components/ScaleMarkNode";
import { GridNode } from "./components/GridNode";
import { ConnectingLineNode } from "./components/ConnectingLineNode";
import { KeyboardShorcutsNode } from "./components/KeyboardShorcutsNode";

// Import managers directly
import { DragHandlerManager } from "./managers/DragHandlerManager";
import { KeyboardHandlerManager } from "./managers/KeyboardHandlerManager";
import { WaveManager } from "./managers/WaveManager";
import { VectorDisplayManager } from "./managers/VectorDisplayManager";
import { TrailManager } from "./managers/TrailManager";

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
  private readonly sourceVelocityVectorNode: ArrowNode;
  private readonly observerVelocityVectorNode: ArrowNode;
  private readonly connectingLineNode: ConnectingLineNode;
  private readonly selectionHighlightCircle: Circle;
  private readonly sourceTrailPath: Path;
  private readonly observerTrailPath: Path;

  // Components
  private readonly graphDisplayNode: GraphDisplayNode;
  private readonly statusDisplayNode: StatusTextNode;
  private readonly controlPanel: ControlPanelNode;
  private readonly gridNode: GridNode;
  private readonly keyboardShorcutsNode: KeyboardShorcutsNode;

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
  private readonly visibleGridProperty: Property<boolean>;
  private readonly keyboardHelpVisibleProperty: Property<boolean>;

  // Selection tracking
  private readonly selectedObjectProperty: Property<"source" | "observer"> =
    new Property<"source" | "observer">("source");

  // UI constants
  private readonly UI = {
    SOURCE_RADIUS: 10,
    OBSERVER_RADIUS: 10,
    GRAPH_HEIGHT: 60,
    GRAPH_WIDTH: 210,
    GRAPH_MARGIN: 20,
    GRAPH_SPACING: 10,
    TRAIL_WIDTH: 2,
  };

  // Sound elements
  private readonly clickSound: Sound;

  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

  // Derived property for interface bounds
  private readonly interfaceBoundsProperty: TReadOnlyProperty<Bounds2>;

  /**
   * Constructor for the Doppler Effect SimScreenView
   */
  public constructor(model: SimModel, options?: ScreenViewOptions) {
    // Call super first before accessing any instance properties
    super({
      tagName: "div",
      labelTagName: "h1",
      labelContent: StringManager.getInstance().getTitleStringProperty(),
      // Add a high-level description for screen readers
      descriptionContent: "An interactive simulation of the Doppler Effect. Drag the source and observer to see how their relative motion affects the observed frequency. The simulation shows how sound waves change when objects move toward or away from each other. Use the control panel to adjust settings, toggle features, and select different scenarios. The graph display shows the frequency changes in real-time.",
      ...options,
    });

    this.stringManager = StringManager.getInstance();
    this.model = model;

    // Create model-view transform - y-axis is inverted and centered on the screen
    this.modelViewTransform =
      ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        new Vector2(0, 0),
        this.layoutBounds.center,
        SCALE.MODEL_VIEW,
      );

    // Create property values
    this.visibleValuesProperty = new Property<boolean>(false);
    this.visibleVelocityArrowProperty = new Property<boolean>(true);
    this.visibleLineOfSightProperty = new Property<boolean>(false);
    this.visibleTrailsProperty = new Property<boolean>(false);
    this.visibleGridProperty = new Property<boolean>(false);
    this.keyboardHelpVisibleProperty = new Property<boolean>(false);

    // Matches visibleBounds horizontally, layoutBounds vertically
    this.interfaceBoundsProperty = new DerivedProperty(
      [this.visibleBoundsProperty],
      (visibleBounds) =>
        visibleBounds
          .withMinY(this.layoutBounds.minY)
          .withMaxY(this.layoutBounds.maxY),
    );

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

    // Create grid node
    const modelBoundsProperty = new DerivedProperty(
      [this.visibleBoundsProperty],
      (visibleBounds) => {
        return this.modelViewTransform.viewToModelBounds(visibleBounds);
      },
    );

    this.gridNode = new GridNode(
      this.modelViewTransform,
      this.visibleGridProperty,
      modelBoundsProperty,
      {
        majorGridSize: 1000, // 1000 meters between major grid lines
        minorLinesPerMajorLine: 4, // 4 minor lines between each major line
      },
    );
    this.gridNode.setAccessibleName("Grid lines showing distance scale");

    // Add grid to the scene - behind the waves
    this.insertChild(0, this.gridNode);

    // Create source and observer nodes with accessibility
    this.sourceNode = new Circle(this.UI.SOURCE_RADIUS, {
      fill: DopplerEffectColors.sourceColorProperty,
      cursor: "pointer",
      // Add accessibility attributes
      tagName: "button",
      accessibleName: "Sound source",
    });

    this.observerNode = new Circle(this.UI.OBSERVER_RADIUS, {
      fill: DopplerEffectColors.observerColorProperty,
      cursor: "pointer",
      // Add accessibility attributes
      tagName: "button",
      accessibleName: "Observer"
    });

    // Create connecting line using the new ConnectingLineNode class
    this.connectingLineNode = new ConnectingLineNode(
      this.modelViewTransform,
      this.model.sourcePositionProperty,
      this.model.observerPositionProperty,
      this.visibleValuesProperty,
      this.visibleLineOfSightProperty,
      this.model.sourceObserverDistanceProperty,
    );

    // Create selection highlight
    this.selectionHighlightCircle = new Circle(this.UI.SOURCE_RADIUS + 5, {
      stroke: DopplerEffectColors.selectionColorProperty,
      lineWidth: 2,
      // Make purely visual elements non-accessible
      tagName: null,
    });

    // Create velocity vector nodes
    const velocityVectorOptions = {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 2,
      scaleTailToo: true,
      visibleProperty: this.visibleVelocityArrowProperty,
      // Make purely visual elements non-accessible
      tagName: null,
    };

    this.sourceVelocityVectorNode = new ArrowNode(0, 0, 0, 0, {
      ...velocityVectorOptions,
      fill: DopplerEffectColors.sourceVelocityArrowColorProperty,
      stroke: DopplerEffectColors.sourceVelocityArrowColorProperty,
    });
    this.observerVelocityVectorNode = new ArrowNode(0, 0, 0, 0, {
      ...velocityVectorOptions,
      fill: DopplerEffectColors.observerVelocityArrowColorProperty,
      stroke: DopplerEffectColors.observerVelocityArrowColorProperty,
    });

    // Create trail paths
    this.sourceTrailPath = new Path(new Shape(), {
      stroke: DopplerEffectColors.sourceColorProperty,
      lineWidth: this.UI.TRAIL_WIDTH,
      // Make purely visual elements non-accessible
      tagName: null,
    });
    this.observerTrailPath = new Path(new Shape(), {
      stroke: DopplerEffectColors.observerColorProperty,
      lineWidth: this.UI.TRAIL_WIDTH,
      // Make purely visual elements non-accessible
      tagName: null,
    });

    // Add objects to object layer
    this.objectLayer.addChild(this.connectingLineNode);
    this.objectLayer.addChild(this.selectionHighlightCircle);
    this.objectLayer.addChild(this.sourceNode);
    this.objectLayer.addChild(this.observerNode);
    this.objectLayer.addChild(this.sourceVelocityVectorNode);
    this.objectLayer.addChild(this.observerVelocityVectorNode);
    this.objectLayer.addChild(this.sourceTrailPath);
    this.objectLayer.addChild(this.observerTrailPath);

    // Create microphone node
    this.microphoneNode = new MicrophoneNode(
      this.modelViewTransform,
      this.model.microphonePositionProperty,
      this.model.waveDetectedProperty,
      new Property(
        this.modelViewTransform.viewToModelBounds(this.layoutBounds),
      ),
    );
    this.microphoneNode.setAccessibleName("Microphone");
    this.objectLayer.addChild(this.microphoneNode);

    // Initialize managers
    this.waveManager = new WaveManager(
      this.waveLayer,
      this.modelViewTransform,
      DopplerEffectColors.waveColorProperty,
    );

    this.vectorManager = new VectorDisplayManager(
      this.modelViewTransform,
      SCALE.VELOCITY_VECTOR,
    );

    this.sourceTrailManager = new TrailManager(
      this.sourceTrailPath,
      this.modelViewTransform,
      DopplerEffectColors.sourceColorProperty,
      this.visibleTrailsProperty,
    );

    this.observerTrailManager = new TrailManager(
      this.observerTrailPath,
      this.modelViewTransform,
      DopplerEffectColors.observerColorProperty,
      this.visibleTrailsProperty,
    );

    this.sourceDragManager = new DragHandlerManager(
      this.modelViewTransform,
      this.layoutBounds,
    );
    this.observerDragManager = new DragHandlerManager(
      this.modelViewTransform,
      this.layoutBounds,
    );

    this.keyboardManager = new KeyboardHandlerManager();

    // Create graph display component
    this.graphDisplayNode = new GraphDisplayNode({
      layoutBounds: this.layoutBounds,
      graphHeight: this.UI.GRAPH_HEIGHT,
      graphWidth: this.UI.GRAPH_WIDTH,
      graphMargin: this.UI.GRAPH_MARGIN,
      graphSpacing: this.UI.GRAPH_SPACING,
    });
    this.graphDisplayNode.setAccessibleName("Frequency graphs");
    this.graphLayer.addChild(this.graphDisplayNode);

    // Create status text display
    this.statusDisplayNode = new StatusTextNode(
      this.model.observedFrequencyProperty,
      this.model.emittedFrequencyProperty,
      this.visibleValuesProperty,
      {
        layoutBounds: this.layoutBounds,
        textColorProperty: DopplerEffectColors.textColorProperty,
        blueshiftColorProperty: DopplerEffectColors.blueshiftColorProperty,
        redshiftColorProperty: DopplerEffectColors.redshiftColorProperty,
        graphWidth: this.UI.GRAPH_WIDTH,
        graphHeight: this.UI.GRAPH_HEIGHT,
        graphMargin: this.UI.GRAPH_MARGIN,
        graphSpacing: this.UI.GRAPH_SPACING,
      },
    );
    this.statusDisplayNode.setAccessibleName("Status information");
    this.statusDisplayNode.setAriaRole("status");
    this.controlLayer.addChild(this.statusDisplayNode);

    // Create control panel
    this.controlPanel = new ControlPanelNode(
      this.visibleValuesProperty,
      this.visibleVelocityArrowProperty,
      this.visibleLineOfSightProperty,
      this.visibleTrailsProperty,
      this.visibleGridProperty,
      this.model.microphoneEnabledProperty,
      this.model.soundSpeedProperty,
      this.model.emittedFrequencyProperty,
      this.model.soundSpeedRange,
      this.model.frequencyRange,
      {
        graphRight: this.graphDisplayNode.right,
        graphBottom: this.graphDisplayNode.observedGraphBottom,
      },
    );
    this.controlPanel.setAccessibleName("Control panel");
    this.controlLayer.addChild(this.controlPanel);

    // Create scenario items for the combo box
    const scenarioItems = this.createScenarioItems(
      DopplerEffectColors.textColorProperty,
    );

    const listParentNode = new Node();

    // Create combo box using SceneryStack API
    const scenarioComboBoxNode = new ComboBox(
      model.scenarioProperty,
      scenarioItems,
      listParentNode,
      {
        buttonFill: DopplerEffectColors.backgroundColorProperty,
        listFill: DopplerEffectColors.backgroundColorProperty,
        buttonStroke: DopplerEffectColors.textColorProperty,
        listStroke: DopplerEffectColors.textColorProperty,
        highlightFill: DopplerEffectColors.highlightColorProperty,
      },
    );
    scenarioComboBoxNode.setAccessibleName("Scenario selector");

    // Position the combo box
    scenarioComboBoxNode.left = 10;
    scenarioComboBoxNode.top = 10;

    // Add to control layer
    this.controlLayer.addChild(scenarioComboBoxNode);
    this.controlLayer.addChild(listParentNode);
    // Setup reset all button
    const resetAllButtonNode = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // Stop any ongoing interactions
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
    });
    resetAllButtonNode.setAccessibleName("Reset simulation");
    this.controlLayer.addChild(resetAllButtonNode);

    // Create scale mark node to show model-to-view scale
    const scaleMarkNode = new ScaleMarkNode(
      this.modelViewTransform,
      this.visibleValuesProperty,
      {
        scaleModelLength: 1000, // 1000 meters scale for better visibility
      },
    );
    scaleMarkNode.setAccessibleName("Scale: 1000 meters");

    // Position the scale mark
    scaleMarkNode.right = resetAllButtonNode.left - 30;
    scaleMarkNode.bottom = resetAllButtonNode.bottom;
    this.controlLayer.addChild(scaleMarkNode);

    // Add time control node
    const timeControlNode = new TimeControlNode(this.model.playProperty, {
      timeSpeedProperty: this.model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        includeStepBackwardButton: false,
        stepBackwardButtonOptions: {
          listener: () => {
            this.model.step(-1 / 60, true);
          },
        },
        stepForwardButtonOptions: {
          listener: () => {
            this.model.step(1 / 60, true);
          },
        },
      },

      speedRadioButtonGroupOptions: {
        labelOptions: {
          fill: DopplerEffectColors.textColorProperty,
        },
      },
    });
    timeControlNode.setAccessibleName("Simulation speed control");
    timeControlNode.centerX = this.layoutBounds.centerX;
    timeControlNode.bottom = this.layoutBounds.maxY - 10;
    this.controlLayer.addChild(timeControlNode);

    // Create keyboard shortcuts node
    this.keyboardShorcutsNode = new KeyboardShorcutsNode({
      visibleProperty: this.keyboardHelpVisibleProperty,
      layoutBounds: this.layoutBounds
    });
    this.keyboardShorcutsNode.setAccessibleName("Keyboard shortcuts help");
    this.controlLayer.addChild(this.keyboardShorcutsNode);

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
          this.keyboardHelpVisibleProperty.value = !this.keyboardHelpVisibleProperty.value;
        },
        onReset: () => {
          this.model.reset();
          this.reset();
        },
      },
      this.model.playProperty,
      this.model.sourceVelocityProperty,
      this.model.observerVelocityProperty,
      this.model.sourceMovingProperty,
      this.model.observerMovingProperty,
      this.model.emittedFrequencyProperty,
      this.model.soundSpeedProperty,
      this.model.microphoneEnabledProperty,
      this.selectedObjectProperty,
      this.model.scenarioProperty,
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

    // Update the interface bounds
    this.interfaceBoundsProperty.link((interfaceBounds) => {
      resetAllButtonNode.right = interfaceBounds.right - 10;
      resetAllButtonNode.bottom = interfaceBounds.bottom - 10;
      this.graphLayer.right = interfaceBounds.right - 10;
      this.graphLayer.top = interfaceBounds.top + 10;
      this.controlPanel.right = interfaceBounds.right - 10;
      this.controlPanel.top = this.graphLayer.bottom + 10;
      timeControlNode.centerX = interfaceBounds.centerX;
      timeControlNode.bottom = interfaceBounds.bottom - 10;
      scenarioComboBoxNode.left = interfaceBounds.minX + 10;
      scenarioComboBoxNode.top = interfaceBounds.top + 10;
      scaleMarkNode.right = resetAllButtonNode.left - 30;
      scaleMarkNode.bottom = resetAllButtonNode.bottom;
    });
  }

  /**
   * Reset the view to initial state
   */
  public reset(): void {
    // Reset selected object
    this.selectedObjectProperty.reset();

    // Reset property values
    this.visibleValuesProperty.reset();
    this.visibleVelocityArrowProperty.reset();
    this.visibleLineOfSightProperty.reset();
    this.visibleTrailsProperty.reset();
    this.visibleGridProperty.reset();
    this.keyboardHelpVisibleProperty.reset();

    // Reset components
    this.waveManager.clearWaveNodes();
    this.graphDisplayNode.reset();
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
      this.graphDisplayNode.updateWaveforms(
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

    // Update velocity vectors
    this.vectorManager.updateVectors(
      this.sourceVelocityVectorNode,
      this.observerVelocityVectorNode,
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
    // No need to call updateValues as the properties are now linked in StatusTextNode
    // Any change to the source properties will automatically update the text
  }

  /**
   * Update the selection highlight position and size
   */
  private updateSelectionHighlight(): void {
    if (this.selectedObjectProperty.value === "source") {
      this.selectionHighlightCircle.radius = this.UI.SOURCE_RADIUS + 5;
      this.selectionHighlightCircle.center =
        this.modelViewTransform.modelToViewPosition(
          this.model.sourcePositionProperty.value,
        );
    } else {
      this.selectionHighlightCircle.radius = this.UI.OBSERVER_RADIUS + 5;
      this.selectionHighlightCircle.center =
        this.modelViewTransform.modelToViewPosition(
          this.model.observerPositionProperty.value,
        );
    }
  }

  /**
   * Create scenario items for the combo box
   * @param textColorProperty - The color property for the scenario text
   * @returns Array of scenario items for the combo box
   */
  private createScenarioItems(
    textColorProperty: ProfileColorProperty,
  ): { value: Scenario; createNode: () => Text }[] {
    const scenarioStrings = this.stringManager.getScenarioStrings();

    return [
      {
        value: Scenario.FREE_PLAY,
        createNode: () =>
          new Text(scenarioStrings.freePlayStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.SOURCE_APPROACHING,
        createNode: () =>
          new Text(scenarioStrings.sourceApproachingStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.SOURCE_RECEDING,
        createNode: () =>
          new Text(scenarioStrings.sourceRecedingStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.OBSERVER_APPROACHING,
        createNode: () =>
          new Text(scenarioStrings.observerApproachingStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.OBSERVER_RECEDING,
        createNode: () =>
          new Text(scenarioStrings.observerRecedingStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.SAME_DIRECTION,
        createNode: () =>
          new Text(scenarioStrings.sameDirectionStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
      {
        value: Scenario.PERPENDICULAR,
        createNode: () =>
          new Text(scenarioStrings.perpendicularStringProperty, {
            font: new PhetFont(14),
            fill: textColorProperty,
          }),
      },
    ];
  }
}
