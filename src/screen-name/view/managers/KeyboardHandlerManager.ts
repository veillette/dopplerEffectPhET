/**
 * KeyboardHandlerManager.ts
 *
 * Manages keyboard input handlers for the Doppler Effect simulation.
 */

import { Vector2, Property, SceneryEvent } from "scenerystack";
import { Node } from "scenerystack";
import { Scenario } from "../../model/SimModel";

/**
 * Callback type for keyboard handling events
 */
type KeyboardCallbacks = {
  onSourceSelected: () => void;
  onObserverSelected: () => void;
  onToggleTrails: () => void;
  onToggleHelp: () => void;
  onReset: () => void;
};

/**
 * Manager for handling keyboard input
 */
export class KeyboardHandlerManager {
  /**
   * Constructor for the KeyboardHandlerManager
   */
  constructor() {}

  /**
   * Attach keyboard event handlers
   *
   * @param targetNode - Node to attach keyboard listeners to
   * @param callbacks - Callback functions for various keyboard actions
   * @param playProperty - Property for simulation play state
   * @param setupScenario - Function to set up a scenario
   * @param sourceVelocityProperty - Model property for source velocity
   * @param observerVelocityProperty - Model property for observer velocity
   * @param sourceMovingProperty - Model property for source moving state
   * @param observerMovingProperty - Model property for observer moving state
   * @param emittedFrequencyProperty - Model property for emitted frequency
   * @param soundSpeedProperty - Model property for sound speed
   * @param microphoneEnabledProperty - Model property for microphone state
   * @param selectedObjectProperty - Property indicating currently selected object
   */
  public attachKeyboardHandlers(
    targetNode: Node,
    callbacks: KeyboardCallbacks,
    playProperty: Property<boolean>,
    setupScenario: (scenario: Scenario) => void,
    sourceVelocityProperty: Property<Vector2>,
    observerVelocityProperty: Property<Vector2>,
    sourceMovingProperty: Property<boolean>,
    observerMovingProperty: Property<boolean>,
    emittedFrequencyProperty: Property<number>,
    soundSpeedProperty: Property<number>,
    microphoneEnabledProperty: Property<boolean>,
    selectedObjectProperty: Property<"source" | "observer">,
  ): void {
    // Create a shared handler function for keydown events
    const handleKeydown = (key: string) => {
      // Handle object selection
      if (key === "s") {
        selectedObjectProperty.value = "source";
        callbacks.onSourceSelected();
      } else if (key === "o") {
        selectedObjectProperty.value = "observer";
        callbacks.onObserverSelected();
      }

      // Handle arrow key movement
      if (playProperty.value) {
        let targetVel: Property<Vector2>;
        let isMoving: Property<boolean>;

        // Determine which object to control
        if (selectedObjectProperty.value === "source") {
          targetVel = sourceVelocityProperty;
          isMoving = sourceMovingProperty;
        } else {
          targetVel = observerVelocityProperty;
          isMoving = observerMovingProperty;
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
        callbacks.onToggleTrails();
      }

      // Handle pause toggle
      if (key === " ") {
        playProperty.value = !playProperty.value;
      }

      // Handle reset
      if (key === "r") {
        callbacks.onReset();
      }

      // Handle help toggle
      if (key === "h") {
        callbacks.onToggleHelp();
      }

      // Preset scenarios
      if (key === "1") {
        setupScenario(Scenario.SCENARIO_1);
      } else if (key === "2") {
        setupScenario(Scenario.SCENARIO_2);
      } else if (key === "3") {
        setupScenario(Scenario.SCENARIO_3);
      } else if (key === "4") {
        setupScenario(Scenario.SCENARIO_4);
      }

      // Adjust emitted frequency
      if (key === "+" || key === "=") {
        emittedFrequencyProperty.value += 0.01;
      } else if (key === "-" || key === "_") {
        emittedFrequencyProperty.value = Math.max(
          0.1,
          emittedFrequencyProperty.value - 0.01,
        );
      }

      // Adjust sound speed
      if (key === "." || key === ">") {
        soundSpeedProperty.value += 1.0;
      } else if (key === "," || key === "<") {
        soundSpeedProperty.value = Math.max(
          1.0,
          soundSpeedProperty.value - 1.0,
        );
      }

      // Handle microphone toggle with 'm' key
      if (key === "m") {
        microphoneEnabledProperty.value = !microphoneEnabledProperty.value;
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
    targetNode.addInputListener(keydownListener);

    // Also add a global keyboard listener to ensure we catch all keyboard events
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      handleKeydown(key);
    });
  }
}
