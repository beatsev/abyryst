import Phaser from 'phaser';

/**
 * UI Overlay Scene
 * Displays score, timer, and hints as persistent HUD
 */
export default class UIOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'UIOverlay', active: false });
  }

  /**
   * Initialize with game state reference
   * @param {Object} data - Init data containing gameState
   */
  init(data) {
    this.gameState = data.gameState;
  }

  create() {
    const { width } = this.cameras.main;

    // Top bar background
    this.add.rectangle(0, 0, width, 50, 0x16213e)
      .setOrigin(0, 0)
      .setAlpha(0.9)
      .setDepth(1000)
      .setScrollFactor(0);

    // Score text (left side)
    this.scoreText = this.add.text(10, 15, 'Score: 0', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setDepth(1001).setScrollFactor(0);

    // Timer text (center)
    this.timerText = this.add.text(width / 2, 15, '00:00', {
      fontSize: '16px',
      color: '#4ecca3',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(1001).setScrollFactor(0);

    // Hints indicator (right side)
    this.hintsText = this.add.text(width - 10, 15, '💡×3', {
      fontSize: '16px',
      color: '#ffcc00'
    }).setOrigin(1, 0).setDepth(1001).setScrollFactor(0);

    // Update UI every second
    this.time.addEvent({
      delay: 1000,
      callback: this.updateUI,
      callbackScope: this,
      loop: true
    });

    // Initial update
    this.updateUI();
  }

  /**
   * Update UI text with current game state
   */
  updateUI() {
    if (!this.gameState) return;

    this.scoreText.setText(`Score: ${this.gameState.score}`);
    this.timerText.setText(this.gameState.formatTime());
    this.hintsText.setText(`💡×${this.gameState.hintsRemaining}`);
  }
}
