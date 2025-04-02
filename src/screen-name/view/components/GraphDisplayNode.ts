/**
 * GraphDisplayNode.ts
 *
 * Contains the graph display functionality for the Doppler Effect simulation,
 * including emitted and observed waveforms.
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

// Waveform data from the model
export interface WaveformPoint {
  t: number;
  y: number;
}

// Interface for graph-related strings
interface GraphStrings {
  EMITTED_SOUND: string;
  OBSERVED_SOUND: string;
}

// Configuration options for the graph display
interface GraphDisplayOptions {
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
}

/**
 * Component that renders the waveform graphs for the simulation
 */
export class GraphDisplayNode extends Node {
  // Graph components
  private readonly emittedGraph: Rectangle;
  private readonly observedGraph: Rectangle;
  private readonly emittedWaveform: Path;
  private readonly observedWaveform: Path;

  /**
   * Constructor for the GraphDisplayNode
   *
   * @param strings - Text strings for the graphs
   * @param options - Configuration options
   */
  constructor(strings: GraphStrings, options: GraphDisplayOptions) {
    super();

    const graphY1 = 30;
    const graphY2 = graphY1 + options.graphHeight + options.graphSpacing;
    const graphX =
      options.layoutBounds.maxX - options.graphWidth - options.graphMargin;

    // Create graph containers
    this.emittedGraph = new Rectangle(
      graphX,
      graphY1,
      options.graphWidth,
      options.graphHeight,
      {
        fill: options.graphBackground,
        stroke: options.graphGridColor,
        lineWidth: 1,
      },
    );

    this.observedGraph = new Rectangle(
      graphX,
      graphY2,
      options.graphWidth,
      options.graphHeight,
      {
        fill: options.graphBackground,
        stroke: options.graphGridColor,
        lineWidth: 1,
      },
    );

    // Create center lines for graphs
    const emittedCenterLine = new Line(
      graphX,
      graphY1 + options.graphHeight / 2,
      graphX + options.graphWidth,
      graphY1 + options.graphHeight / 2,
      {
        stroke: options.graphGridColor,
      },
    );

    const observedCenterLine = new Line(
      graphX,
      graphY2 + options.graphHeight / 2,
      graphX + options.graphWidth,
      graphY2 + options.graphHeight / 2,
      {
        stroke: options.graphGridColor,
      },
    );

    // Create waveform paths
    this.emittedWaveform = new Path(new Shape(), {
      stroke: options.sourceColor,
      lineWidth: 2,
    });

    this.observedWaveform = new Path(new Shape(), {
      stroke: options.observerColor,
      lineWidth: 2,
    });

    // Add graph titles
    const emittedTitle = new Text(strings.EMITTED_SOUND, {
      font: new PhetFont(12),
      fill: options.textColor,
      left: graphX + 5,
      top: graphY1 + 15,
    });

    const observedTitle = new Text(strings.OBSERVED_SOUND, {
      font: new PhetFont(12),
      fill: options.textColor,
      left: graphX + 5,
      top: graphY2 + 15,
    });

    // Add all components to this node
    this.addChild(this.emittedGraph);
    this.addChild(this.observedGraph);
    this.addChild(emittedCenterLine);
    this.addChild(observedCenterLine);
    this.addChild(this.emittedWaveform);
    this.addChild(this.observedWaveform);
    this.addChild(emittedTitle);
    this.addChild(observedTitle);
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
   * Create a waveform shape from waveform data
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
   * Reset the graph display
   * Clears waveform shapes
   */
  public reset(): void {
    // Clear waveform displays
    this.emittedWaveform.shape = new Shape();
    this.observedWaveform.shape = new Shape();
  }
}
