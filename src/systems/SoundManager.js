/**
 * SoundManager
 * Manages game audio and sound effects
 *
 * Note: This system is ready for audio files to be added to src/assets/sounds/
 * For now, it gracefully handles missing files and can be extended easily.
 */
export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.sounds = {};

    // Sound configuration
    this.soundConfig = {
      move: { file: 'move', volume: 0.3 },
      solve: { file: 'solve', volume: 0.5 },
      error: { file: 'error', volume: 0.4 },
      hint: { file: 'hint', volume: 0.3 },
      story: { file: 'story', volume: 0.4 },
      win: { file: 'win', volume: 0.6 }
    };

    // Check if sounds are available in cache
    this.loadedSounds = new Set();
    this.checkAvailableSounds();
  }

  /**
   * Check which sounds are available in the Phaser cache
   */
  checkAvailableSounds() {
    Object.keys(this.soundConfig).forEach(key => {
      const config = this.soundConfig[key];
      if (this.scene.cache.audio.exists(config.file)) {
        this.loadedSounds.add(key);
      }
    });
  }

  /**
   * Play movement sound (player moves to new tile)
   */
  playMove() {
    this.play('move');
  }

  /**
   * Play puzzle solve sound (correct answer)
   */
  playSolve() {
    this.play('solve');
  }

  /**
   * Play error sound (incorrect answer)
   */
  playError() {
    this.play('error');
  }

  /**
   * Play hint sound (hint revealed)
   */
  playHint() {
    this.play('hint');
  }

  /**
   * Play story sound (story card appears)
   */
  playStory() {
    this.play('story');
  }

  /**
   * Play win sound (reached end tile)
   */
  playWin() {
    this.play('win');
  }

  /**
   * Generic play method
   * @param {string} soundKey - Sound key to play
   */
  play(soundKey) {
    if (!this.enabled) return;

    const config = this.soundConfig[soundKey];
    if (!config) {
      console.warn(`Sound key not found: ${soundKey}`);
      return;
    }

    // Only play if sound is loaded
    if (this.loadedSounds.has(soundKey)) {
      try {
        this.scene.sound.play(config.file, { volume: config.volume });
      } catch (error) {
        console.warn(`Failed to play sound: ${soundKey}`, error);
      }
    } else {
      // Optionally use Web Audio API to generate simple beep as placeholder
      // For now, just log (can be removed in production)
      // console.log(`[Sound placeholder] ${soundKey}`);
    }
  }

  /**
   * Toggle sound on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Enable sounds
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable sounds
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if sounds are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set volume for a specific sound
   * @param {string} soundKey - Sound key
   * @param {number} volume - Volume (0-1)
   */
  setVolume(soundKey, volume) {
    if (this.soundConfig[soundKey]) {
      this.soundConfig[soundKey].volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get list of loaded sounds
   * @returns {Array<string>}
   */
  getLoadedSounds() {
    return Array.from(this.loadedSounds);
  }

  /**
   * Get list of missing sounds (for debugging)
   * @returns {Array<string>}
   */
  getMissingSounds() {
    return Object.keys(this.soundConfig).filter(key => !this.loadedSounds.has(key));
  }
}
