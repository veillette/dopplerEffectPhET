/**
 * Sound.ts
 *
 * Simple Sound wrapper class for playing audio in the Doppler Effect simulation.
 * Supports both preloaded audio files and programmatically generated sounds.
 */

// Constants for sound generation and playback
const SOUND = {
  // Playback settings
  DEFAULT_VOLUME: 0.5,

  // Click sound generation parameters
  CLICK_FREQUENCY: 500, // Hz
  ATTACK_TIME: 0.001, // seconds
  DECAY_TIME: 0.01, // seconds
  PEAK_GAIN: 0.3,
  INITIAL_GAIN: 0,
  FINAL_GAIN: 0,
};

/**
 * Simple Sound wrapper class for playing audio
 */
export class Sound {
  private audio: HTMLAudioElement | null = null;
  private isLoaded: boolean = false;
  private isMuted: boolean = false;
  private audioContext: AudioContext | null = null;
  private useGeneratedSound: boolean;

  constructor(src: string, useGeneratedSound: boolean = false) {
    this.useGeneratedSound = useGeneratedSound;

    if (!useGeneratedSound) {
      this.audio = new Audio();

      // Add error handling for loading sound
      this.audio.addEventListener("canplaythrough", () => {
        this.isLoaded = true;
      });

      this.audio.addEventListener("error", (e) => {
        console.warn("Error loading sound:", e);
        this.isLoaded = false;
      });

      // Set source after adding listeners
      this.audio.src = src;

      // Try to load the audio
      this.audio.load();
    } else {
      // For generated sounds, we don't need to load anything
      this.isLoaded = true;
    }
  }

  play() {
    if (this.isMuted) return;

    if (this.useGeneratedSound) {
      this.playGeneratedClick();
    } else if (this.isLoaded && this.audio) {
      // Create a new audio element for each play to allow overlapping sounds
      const sound = new Audio(this.audio.src);
      sound.volume = SOUND.DEFAULT_VOLUME; // Lower volume to prevent being too loud

      // Play and handle errors
      sound.play().catch((e) => {
        console.warn("Error playing sound:", e);
      });
    }
  }

  /**
   * Play a programmatically generated click sound that's very short
   * (less than 0.1 seconds)
   */
  private playGeneratedClick() {
    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        // Type assertion for cross-browser compatibility
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }

      // Create an oscillator for the click
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set up the click parameters
      oscillator.type = "sine";
      oscillator.frequency.value = SOUND.CLICK_FREQUENCY; // High frequency for a click

      // Start with zero gain
      gainNode.gain.value = SOUND.INITIAL_GAIN;

      // Schedule the envelope - very short attack and decay
      const now = this.audioContext.currentTime;
      // Attack - quick fade in
      gainNode.gain.linearRampToValueAtTime(
        SOUND.PEAK_GAIN,
        now + SOUND.ATTACK_TIME,
      );
      // Decay - quick fade out
      gainNode.gain.linearRampToValueAtTime(
        SOUND.FINAL_GAIN,
        now + SOUND.DECAY_TIME,
      );

      // Start and stop the oscillator
      oscillator.start(now);
      oscillator.stop(now + SOUND.DECAY_TIME); // Stop after decay time
    } catch (e) {
      console.warn("Error generating click sound:", e);
    }
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }
}
