/**
 * WaveManager.ts
 *
 * Manages the visualization of propagating waves in the Doppler Effect simulation.
 */

import {
  Node,
  Circle,
  Color,
  ModelViewTransform2,
  ProfileColorProperty,
} from "scenerystack";
import { Wave } from "../../model/SimModel";
import { WAVE } from "../../model/SimConstants";
import DopplerEffectColors from "../../../DopplerEffectColors";

/**
 * Manages the visualization of sound waves
 *
 * Creates and updates the circles representing propagating sound waves
 */
export class WaveManager {
  // Map to track wave nodes
  private readonly waveNodesMap: Map<Wave, Circle> = new Map();
  private readonly waveColorValue: Color;

  /**
   * Constructor for the WaveManager
   *
   * @param waveLayer - Node that will contain the wave visualizations
   * @param modelViewTransform - Transform to convert model coordinates to view coordinates
   * @param waveColorProperty - Color property for the wave circles
   */
  constructor(
    private readonly waveLayer: Node,
    private readonly modelViewTransform: ModelViewTransform2,
    waveColorProperty: ProfileColorProperty = DopplerEffectColors.waveColorProperty,
  ) {
    // Store initial color value and listen for changes
    this.waveColorValue = waveColorProperty.value;
    waveColorProperty.link((newColor) => {
      // Update all wave nodes with the new color
      this.waveNodesMap.forEach((waveNode) => {
        waveNode.stroke = newColor;
      });
    });
  }

  /**
   * Add a wave node for a new wave in the model
   *
   * @param wave - The wave model object
   */
  public addWaveNode(wave: Wave): void {
    const waveNode = new Circle(0, {
      stroke: this.waveColorValue,
      fill: null,
      lineWidth: 2,
      opacity: 0.7,
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

  /**
   * Synchronize wave nodes with the current set of waves
   * This is used when restoring from history during time reversal
   *
   * @param waves - Collection of wave objects
   */
  public synchronizeWaveNodes(waves: {
    forEach: (callback: (wave: Wave) => void) => void;
  }): void {
    // Create a set of waves to track which ones we've processed
    const processedWaves = new Set<Wave>();

    // Update existing nodes and track which waves we've processed
    waves.forEach((wave) => {
      if (this.waveNodesMap.has(wave)) {
        // Wave already has a node, just update it
        this.updateWaveNode(wave, wave.birthTime + wave.radius / WAVE.MAX_AGE);
        processedWaves.add(wave);
      } else {
        // New wave, create a node for it
        this.addWaveNode(wave);
        processedWaves.add(wave);
      }
    });

    // Remove nodes for waves that no longer exist
    for (const [wave, node] of this.waveNodesMap.entries()) {
      if (!processedWaves.has(wave)) {
        this.waveLayer.removeChild(node);
        this.waveNodesMap.delete(wave);
      }
    }
  }
}
