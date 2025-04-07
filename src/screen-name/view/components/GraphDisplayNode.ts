/**
 * GraphDisplayNode.ts
 *
 * Contains the graph display functionality for the Doppler Effect simulation,
 * including emitted and observed waveforms.
 * 
 * Features:
 * - Right-aligned waveforms that ensure current time is at the right edge
 * - Y-axis scaling for better waveform visualization
 * - Encapsulated graph element creation for emitted and observed sound
 */

import {
  Node,
  Rectangle,
  Line,
  Path,
  Shape,
  Vector2,
  Color,
  Text,
} from "scenerystack";
import { PhetFont } from "scenerystack/scenery-phet";
import { ReadOnlyProperty } from "scenerystack/axon";
import { StringManager } from "../../../i18n/StringManager";

// Constants for layout positioning and styling
const GRAPH_TITLE_OFFSET_X = 5;
const GRAPH_TITLE_OFFSET_Y = 15;
const GRAPH_INITIAL_Y = 30;
const WAVEFORM_LINE_WIDTH = 2;
const TITLE_FONT_SIZE = 12;
const WAVEFORM_Y_SCALING = 20; // Scaling factor for Y-axis amplitude

// Waveform data from the model
export type WaveformPoint = {
  t: number; // Time in seconds (s)
  y: number; // Amplitude (dimensionless)
};

// Configuration options for the graph display
type GraphDisplayOptions = {
  layoutBounds: {
    maxX: number;
  };
  textColor: Color;
  graphBackground: Color;
  graphGridColor: Color;
  sourceColor: Color;
  observerColor: Color;
  graphHeight: number;
  graphWidth: number;
  graphMargin: number;
  graphSpacing: number;
};

// Type for defining a graph's positioning and properties
interface GraphConfig {
  rect: Rectangle;
  centerLine: Line;
  waveform: Path;
  title: Text;
}

/**
 * Component that renders the waveform graphs for the simulation
 * Displays both emitted and observed sound waveforms with right-alignment
 * and amplitude scaling.
 */
export class GraphDisplayNode extends Node {
  // Graph components
  private readonly emittedGraph: Rectangle;
  private readonly observedGraph: Rectangle;
  private readonly emittedWaveform: Path;
  private readonly observedWaveform: Path;
  
  // String manager instance
  private readonly stringManager: StringManager = StringManager.getInstance();

  /**
   * Constructor for the GraphDisplayNode
   *
   * @param options - Configuration options
   */
  constructor(options: GraphDisplayOptions) {
    super();
    
    // Get strings from string manager
    const strings = this.stringManager.getGraphDisplayStrings();

    const graphY1 = GRAPH_INITIAL_Y;
    const graphY2 = graphY1 + options.graphHeight + options.graphSpacing;
    const graphX =
      options.layoutBounds.maxX - options.graphWidth - options.graphMargin;

    // Create emitted sound graph elements
    const emittedGraphConfig = this.createGraphElements(
      graphX,
      graphY1,
      options.graphWidth,
      options.graphHeight,
      options.graphBackground,
      options.graphGridColor,
      options.sourceColor,
      strings.emittedSoundStringProperty,
      options.textColor
    );

    // Create observed sound graph elements
    const observedGraphConfig = this.createGraphElements(
      graphX,
      graphY2,
      options.graphWidth,
      options.graphHeight,
      options.graphBackground,
      options.graphGridColor,
      options.observerColor,
      strings.observedSoundStringProperty,
      options.textColor
    );

    // Store references to main components
    this.emittedGraph = emittedGraphConfig.rect;
    this.observedGraph = observedGraphConfig.rect;
    this.emittedWaveform = emittedGraphConfig.waveform;
    this.observedWaveform = observedGraphConfig.waveform;

    // Add all components to this node
    this.addGraphElements(emittedGraphConfig);
    this.addGraphElements(observedGraphConfig);
  }

  /**
   * Create all elements for a graph
   * Encapsulates the creation of a complete graph with container, center line,
   * waveform, and title.
   * 
   * @param graphX - X position of the graph
   * @param graphY - Y position of the graph
   * @param width - Width of the graph
   * @param height - Height of the graph
   * @param backgroundColor - Background color of the graph
   * @param gridColor - Color of grid lines
   * @param waveformColor - Color of the waveform
   * @param titleProperty - Title text property
   * @param textColor - Color of the title text
   * @returns Graph configuration object
   */
  private createGraphElements(
    graphX: number,
    graphY: number,
    width: number,
    height: number,
    backgroundColor: Color,
    gridColor: Color,
    waveformColor: Color,
    titleProperty: ReadOnlyProperty<string>,
    textColor: Color
  ): GraphConfig {
    // Create graph container
    const rect = new Rectangle(
      graphX,
      graphY,
      width,
      height,
      {
        fill: backgroundColor,
        stroke: gridColor,
      }
    );

    // Create center line
    const centerLine = new Line(
      graphX,
      graphY + height / 2,
      graphX + width,
      graphY + height / 2,
      {
        stroke: gridColor,
      }
    );

    // Create waveform path
    const waveform = new Path(new Shape(), {
      stroke: waveformColor,
      lineWidth: WAVEFORM_LINE_WIDTH,
    });

    // Create title
    const title = new Text(titleProperty, {
      font: new PhetFont(TITLE_FONT_SIZE),
      fill: textColor,
      left: graphX + GRAPH_TITLE_OFFSET_X,
      top: graphY + GRAPH_TITLE_OFFSET_Y,
    });

    return { rect, centerLine, waveform, title };
  }

  /**
   * Add graph elements to this node
   * 
   * @param config - Graph configuration
   */
  private addGraphElements(config: GraphConfig): void {
    this.addChild(config.rect);
    this.addChild(config.centerLine);
    this.addChild(config.waveform);
    this.addChild(config.title);
  }

  /**
   * Get the right edge position of the graph
   */
  public get right(): number {
    return this.emittedGraph.right;
  }

  /**
   * Get the bottom edge position of the observed graph
   */
  public get observedGraphBottom(): number {
    return this.observedGraph.bottom;
  }

  /**
   * Update the waveforms based on model data
   *
   * @param emittedWaveformData - Data for the emitted waveform
   * @param observedWaveformData - Data for the observed waveform
   */
  public updateWaveforms(
    emittedWaveformData: WaveformPoint[],
    observedWaveformData: WaveformPoint[],
  ): void {
    // Update emitted sound waveform
    this.emittedWaveform.shape = this.createWaveformShape(
      this.emittedGraph.left,
      this.emittedGraph.centerY,
      this.emittedGraph.width,
      emittedWaveformData,
    );

    // Update observed sound waveform
    this.observedWaveform.shape = this.createWaveformShape(
      this.observedGraph.left,
      this.observedGraph.centerY,
      this.observedGraph.width,
      observedWaveformData,
    );
  }

  /**
   * Find the maximum t value in waveform data
   * Used to ensure right-alignment of waveforms
   * 
   * @param waveformData - Array of waveform data points
   * @returns Maximum t value
   */
  private findMaxT(waveformData: WaveformPoint[]): number {
    let maxT = 0;
    for (let i = 0; i < waveformData.length; i++) {
      maxT = Math.max(maxT, waveformData[i].t);
    }
    return maxT;
  }

  /**
   * Create a waveform shape from waveform data
   * Applies right-alignment so current time is at the right edge of the graph.
   * Also applies Y-scaling factor to amplify the waveform for better visualization.
   *
   * @param graphX - The x-coordinate of the left edge of the graph
   * @param graphY - The y-coordinate of the center of the graph
   * @param graphWidth - The width of the graph
   * @param waveformData - The waveform data to render
   * @returns A Shape object representing the waveform
   */
  private createWaveformShape(
    graphX: number,
    graphY: number,
    graphWidth: number,
    waveformData: WaveformPoint[],
  ): Shape {
    const shape = new Shape();
    
    // Find the maximum t value to ensure right alignment
    const maxT = this.findMaxT(waveformData);

    // Start at left edge
    shape.moveToPoint(new Vector2(graphX, graphY));

    let firstValidPointFound = false;

    for (let i = 0; i < waveformData.length; i++) {
      // Right-align the waveform by scaling the t values relative to maxT
      // This ensures the current time (latest point) is always at the right edge
      const normalizedT = maxT > 0 ? waveformData[i].t / maxT : 0;
      const tRatio = Math.max(0, Math.min(1, normalizedT));
      const x = graphX + tRatio * graphWidth;
      
      // Apply Y-scaling factor to amplify the waveform amplitude
      const y = graphY - (waveformData[i].y * WAVEFORM_Y_SCALING);

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
   * Reset the waveforms
   */
  public reset(): void {
    this.emittedWaveform.shape = new Shape();
    this.observedWaveform.shape = new Shape();
  }
}
