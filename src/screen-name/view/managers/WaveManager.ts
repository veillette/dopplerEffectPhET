/**
 * WaveManager.ts
 *
 * Manages the visualization of propagating waves in the Doppler Effect simulation.
 */

import { Node, Circle, Color, ModelViewTransform2 } from "scenerystack";
import { Wave } from "../../model/SimModel";
import { WAVE } from "../../model/SimConstants";

/**
 * Manager for handling wave visualization
 */
export class WaveManager {
  // Map to track wave nodes
  private readonly waveNodesMap: Map<Wave, Circle> = new Map();

  /**
   * Constructor for the WaveManager
   *
   * @param waveLayer - Node that will contain the wave visualizations
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   * @param waveColor - Color for the wave circles
   */
  constructor(
    private readonly waveLayer: Node,
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly waveColor: Color,
  ) {}

  /**
   * Add a wave node for a new wave in the model
   *
   * @param wave - The wave model object
   */
  public addWaveNode(wave: Wave): void {
    const waveNode = new Circle(0, {
      stroke: this.waveColor,
      fill: null,
      lineWidth: 2,
      opacity: 0.7,
      pickable: false,
    });

    this.waveLayer.addChild(waveNode);
    this.waveNodesMap.set(wave, waveNode);

    // Initial update
    this.updateWaveNode(wave, 0);
  }

  /**
   * Remove a wave node when removed from the model
   *
   * @param wave - The wave model object to remove
   */
  public removeWaveNode(wave: Wave): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      this.waveLayer.removeChild(waveNode);
      this.waveNodesMap.delete(wave);
    }
  }

  /**
   * Clear all wave nodes
   */
  public clearWaveNodes(): void {
    this.waveNodesMap.forEach((waveNode) => {
      this.waveLayer.removeChild(waveNode);
    });
    this.waveNodesMap.clear();
  }

  /**
   * Update visualization for a specific wave
   *
   * @param wave - The wave model object to update
   * @param simulationTime - Current simulation time
   */
  public updateWaveNode(wave: Wave, simulationTime: number): void {
    const waveNode = this.waveNodesMap.get(wave);
    if (waveNode) {
      // Update position to match wave's origin (convert to view coordinates)
      waveNode.center = this.modelViewTransform.modelToViewPosition(
        wave.position,
      );

      // Update radius to match wave's propagation (convert to view coordinates)
      waveNode.radius = this.modelViewTransform.modelToViewDeltaX(wave.radius);

      // Update opacity based on age
      const age = Math.max(0, simulationTime - wave.birthTime); // Ensure age is non-negative
      const opacity = 0.7 * (1 - age / WAVE.MAX_AGE);

      // Clamp opacity between 0 and 1
      waveNode.opacity = Math.min(1, Math.max(0, opacity));
    }
  }

  /**
   * Update all wave nodes
   *
   * @param waves - Collection of wave objects
   * @param simulationTime - Current simulation time
   * @param maxAge - Maximum age for waves
   */
  public updateWaves(
    waves: { forEach: (callback: (wave: Wave) => void) => void },
    simulationTime: number,
  ): void {
    waves.forEach((wave) => {
      this.updateWaveNode(wave, simulationTime);
    });
  }
}
