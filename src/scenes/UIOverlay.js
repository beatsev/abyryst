import Phaser from 'phaser';

import { wireButton } from '../systems/ButtonUtils.js';

/**
 * UI Overlay Scene
 * Displays campaign status and top-level controls as persistent HUD.
 */
export default class UIOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'UIOverlay', active: false });
  }

  /**
   * Initialize with game state and sound manager references.
   * @param {Object} data - Init data containing gameState and soundManager
   */
  init(data) {
    this.gameState = data.gameState;
    this.soundManager = data.soundManager;
  }

  create() {
    const { width } = this.cameras.main;
    const compact = width < 460;
    const barHeight = compact ? 82 : 72;

    this.add.rectangle(0, 0, width, barHeight, 0x070a12, 0.86)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScrollFactor(0);
    this.add.rectangle(0, barHeight - 1, width, 1, 0x62e5bf, 0.28)
      .setOrigin(0, 0)
      .setDepth(1001)
      .setScrollFactor(0);

    this.menuButton = this.createPill(14, 14, 'MENU', '#e9fff8', '#17233a');
    wireButton(this, this.menuButton, () => this.returnToMenu());

    this.add.text(width / 2, 14, 'ABYRYST', {
      fontSize: compact ? '18px' : '22px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#62e5bf',
      strokeThickness: 1
    }).setOrigin(0.5, 0).setDepth(1001).setScrollFactor(0);

    this.timerText = this.add.text(width / 2, compact ? 42 : 44, '00:00', {
      fontSize: compact ? '16px' : '17px',
      color: '#62e5bf',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5, 0).setDepth(1001).setScrollFactor(0);

    this.soundButton = this.add.text(width - 16, 14, 'SOUND', {
      fontSize: compact ? '12px' : '13px',
      color: '#f5fffb',
      fontFamily: 'Arial Black',
      backgroundColor: '#17233a',
      padding: { x: 14, y: 11 }
    }).setOrigin(1, 0).setDepth(1001).setScrollFactor(0);

    wireButton(this, this.soundButton, () => {
      if (this.soundManager) {
        this.soundManager.toggle();
        this.updateSoundButton();
      }
    });

    const statY = compact ? 58 : 46;
    this.levelText = this.add.text(14, statY, 'L 1/10', this.statStyle('#ffcf5a'))
      .setDepth(1001).setScrollFactor(0);
    this.scoreText = this.add.text(width * 0.26, statY, '0', this.statStyle('#ffffff'))
      .setDepth(1001).setScrollFactor(0);
    this.hintsText = this.add.text(width * 0.74, statY, 'H 3', this.statStyle('#ffcf5a'))
      .setOrigin(1, 0).setDepth(1001).setScrollFactor(0);
    this.livesText = this.add.text(width - 14, statY, 'HP 3', this.statStyle('#ff7588'))
      .setOrigin(1, 0).setDepth(1001).setScrollFactor(0);

    this.time.addEvent({
      delay: 1000,
      callback: this.updateUI,
      callbackScope: this,
      loop: true
    });

    this.updateUI();
    this.updateSoundButton();
  }

  createPill(x, y, text, color, backgroundColor) {
    return this.add.text(x, y, text, {
      fontSize: '13px',
      color,
      fontFamily: 'Arial Black',
      backgroundColor,
      padding: { x: 16, y: 11 }
    }).setDepth(1001).setScrollFactor(0);
  }

  statStyle(color) {
    return {
      fontSize: '13px',
      color,
      fontFamily: 'Arial Black'
    };
  }

  updateUI() {
    if (!this.gameState) return;

    this.scoreText.setText(`S ${this.gameState.score}`);
    this.timerText.setText(this.gameState.formatLevelTime());
    this.hintsText.setText(`H ${this.gameState.hintsRemaining}`);

    if (this.gameState.isCampaignMode) {
      this.levelText.setText(`L ${this.gameState.currentLevel}/10`);
      this.livesText.setText(`HP ${this.gameState.livesRemaining}`);
    }
  }

  updateSoundButton() {
    if (!this.soundManager || !this.soundButton) return;

    const isEnabled = this.soundManager.isEnabled();
    this.soundButton.setText(isEnabled ? 'SOUND' : 'MUTED');
    this.soundButton.setStyle({ backgroundColor: isEnabled ? '#17233a' : '#3a1724' });
  }

  returnToMenu() {
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}
