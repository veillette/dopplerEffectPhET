/**
 * Sound.ts
 * 
 * Simple Sound wrapper class for playing audio in the Doppler Effect simulation.
 * Supports both preloaded audio files and programmatically generated sounds.
 */

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
      this.audio.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
      });
      
      this.audio.addEventListener('error', (e) => {
        console.warn('Error loading sound:', e);
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
      sound.volume = 0.5; // Lower volume to prevent being too loud
      
      // Play and handle errors
      sound.play().catch(e => {
        console.warn('Error playing sound:', e);
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
        const AudioContextClass = window.AudioContext || 
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }
      
      // Create an oscillator for the click
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Connect the nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set up the click parameters
      oscillator.type = 'sine';
      oscillator.frequency.value = 1500; // High frequency for a click
      
      // Start with zero gain
      gainNode.gain.value = 0;
      
      // Schedule the envelope - very short attack and decay
      const now = this.audioContext.currentTime;
      // Attack - quick fade in
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.001); 
      // Decay - quick fade out
      gainNode.gain.linearRampToValueAtTime(0, now + 0.03);
      
      // Start and stop the oscillator
      oscillator.start(now);
      oscillator.stop(now + 0.03); // Stop after 30ms - well under 0.1 seconds
    } catch (e) {
      console.warn('Error generating click sound:', e);
    }
  }
  
  mute() {
    this.isMuted = true;
  }
  
  unmute() {
    this.isMuted = false;
  }
} 