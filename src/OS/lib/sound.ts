/**
 * Sound System
 * System sounds (beep, trash, etc.)
 */

export type SystemSound =
  | 'beep'
  | 'trash'
  | 'startup'
  | 'shutdown'
  | 'error'
  | 'notification'
  | 'click'
  | 'open'
  | 'close'
  | 'minimize'
  | 'zoom';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

class SoundManager {
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.5,
  };

  private audioContext: AudioContext | null = null;
  private loadedSounds: Map<SystemSound, AudioBuffer> = new Map();

  /**
   * Initialize audio context
   */
  private initAudioContext(): void {
    if (typeof window === 'undefined') return;
    
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a system sound
   */
  async playSound(sound: SystemSound, volume?: number): Promise<void> {
    if (!this.settings.enabled) return;

    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      // Check if sound is loaded
      let buffer = this.loadedSounds.get(sound);

      if (!buffer) {
        // Try to load sound
        const loadedBuffer = await this.loadSound(sound);
        if (!loadedBuffer) {
          // Fallback to beep
          this.playBeep();
          return;
        }
        this.loadedSounds.set(sound, loadedBuffer);
        buffer = loadedBuffer;
      }

      // Play sound
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume ?? this.settings.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn(`Failed to play sound: ${sound}`, error);
      // Fallback to beep
      this.playBeep();
    }
  }

  /**
   * Load a sound file
   */
  private async loadSound(sound: SystemSound): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      // Try to fetch sound file
      const response = await fetch(`/sounds/${sound}.mp3`);
      if (!response.ok) {
        console.warn(`Sound file not found: ${sound}.mp3`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound: ${sound}`, error);
      return null;
    }
  }

  /**
   * Play a simple beep (synthesized)
   */
  private playBeep(): void {
    if (!this.settings.enabled) return;

    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play beep', error);
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  /**
   * Get enabled state
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get volume
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Preload sounds
   */
  async preloadSounds(sounds: SystemSound[]): Promise<void> {
    this.initAudioContext();
    
    const promises = sounds.map(async (sound) => {
      const buffer = await this.loadSound(sound);
      if (buffer) {
        this.loadedSounds.set(sound, buffer);
      }
    });

    await Promise.all(promises);
  }
}

// Singleton instance
export const soundManager = new SoundManager();

/**
 * Play a system sound (convenience function)
 */
export function playSound(sound: SystemSound, volume?: number): void {
  soundManager.playSound(sound, volume);
}

/**
 * React hook for sound settings
 */
export function useSoundSettings() {
  const enabled = soundManager.isEnabled();
  const volume = soundManager.getVolume();

  return {
    enabled,
    volume,
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    playSound: (sound: SystemSound, volume?: number) =>
      soundManager.playSound(sound, volume),
  };
}

