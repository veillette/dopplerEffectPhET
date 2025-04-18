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
   * @param sourceVelocityProperty - Model property for source velocity
   * @param observerVelocityProperty - Model property for observer velocity
   * @param sourceMovingProperty - Model property for source moving state
   * @param observerMovingProperty - Model property for observer moving state
   * @param emittedFrequencyProperty - Model property for emitted frequency
   * @param soundSpeedProperty - Model property for sound speed
   * @param microphoneEnabledProperty - Model property for microphone state
   * @param selectedObjectProperty - Property indicating currently selected object
   * @param scenarioProperty - Property for the current scenario
   */
  public attachKeyboardHandlers(
    targetNode: Node,
    callbacks: KeyboardCallbacks,
    playProperty: Property<boolean>,
    sourceVelocityProperty: Property<Vector2>,
    observerVelocityProperty: Property<Vector2>,
    sourceMovingProperty: Property<boolean>,
    observerMovingProperty: Property<boolean>,
    emittedFrequencyProperty: Property<number>,
    soundSpeedProperty: Property<number>,
    microphoneEnabledProperty: Property<boolean>,
    selectedObjectProperty: Property<"source" | "observer">,
    scenarioProperty: Property<Scenario>,
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
        let targetVelocity: Property<Vector2>;
        let isMoving: Property<boolean>;

        // Determine which object to control
        if (selectedObjectProperty.value === "source") {
          targetVelocity = sourceVelocityProperty;
          isMoving = sourceMovingProperty;
        } else {
          targetVelocity = observerVelocityProperty;
          isMoving = observerMovingProperty;
        }

        // Set velocity based on key
        const velocity = new Vector2(0, 0);

        if (key === "arrowleft" || key === "a") {
          velocity.x = -100.0;
        } else if (key === "arrowright" || key === "d") {
          velocity.x = 100.0;
        }

        if (key === "arrowup" || key === "w") {
          velocity.y = 100.0;
        } else if (key === "arrowdown" || key === "s") {
          velocity.y = -100.0;
        }

        // Apply velocity if any keys were pressed
        if (velocity.magnitude > 0) {
          targetVelocity.value = velocity;
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
        scenarioProperty.value = Scenario.SOURCE_APPROACHING;
      } else if (key === "2") {
        scenarioProperty.value = Scenario.SOURCE_RECEDING;
      } else if (key === "3") {
        scenarioProperty.value = Scenario.OBSERVER_APPROACHING;
      } else if (key === "4") {
        scenarioProperty.value = Scenario.OBSERVER_RECEDING;
      } else if (key === "5") {
        scenarioProperty.value = Scenario.SAME_DIRECTION;
      } else if (key === "6") {
        scenarioProperty.value = Scenario.PERPENDICULAR;
      } else if (key === "0") {
        scenarioProperty.value = Scenario.FREE_PLAY;
      }

      // Adjust emitted frequency
      if (key === "+" || key === "=") {
        emittedFrequencyProperty.value += 0.1;
      } else if (key === "-" || key === "_") {
        emittedFrequencyProperty.value = Math.max(
          0.1,
          emittedFrequencyProperty.value - 0.1,
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
