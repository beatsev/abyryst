import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title with 3D flickering torch shadow effect
    const titleX = width / 2;
    const titleY = height / 3;

    // Create shadow layers for 3D depth
    this.titleShadow1 = this.add.text(titleX + 4, titleY + 4, 'ABYRYST', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#000000',
      alpha: 0.4
    }).setOrigin(0.5);

    this.titleShadow2 = this.add.text(titleX + 3, titleY + 3, 'ABYRYST', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#1a1a1a',
      alpha: 0.5
    }).setOrigin(0.5);

    this.titleShadow3 = this.add.text(titleX + 2, titleY + 2, 'ABYRYST', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#2a2a2a',
      alpha: 0.6
    }).setOrigin(0.5);

    // Main title
    this.add.text(titleX, titleY, 'ABYRYST', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#4ecca3',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Create flickering torch shadow animation
    this.createTorchFlickerEffect();

    // Subtitle
    this.add.text(width / 2, height / 2 - 80, 'Labyrinth Mystery', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Check for saved campaign
    const saveData = this.loadSaveData();

    if (saveData) {
      // Continue Campaign button
      const continueBtn = this.add.text(width / 2, height / 2 + 20, 'Continue Campaign', {
        fontSize: '28px',
        backgroundColor: '#4ecca3',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      continueBtn.on('pointerover', () => continueBtn.setScale(1.05));
      continueBtn.on('pointerout', () => continueBtn.setScale(1.0));
      continueBtn.on('pointerdown', () => this.continueCampaign(saveData));

      // Show save info
      this.add.text(width / 2, height / 2 + 60,
        `Level ${saveData.currentLevel} | Lives: ${saveData.livesRemaining}`, {
        fontSize: '14px',
        color: '#999999'
      }).setOrigin(0.5);

      // New Campaign button
      const newBtn = this.add.text(width / 2, height / 2 + 100, 'New Campaign', {
        fontSize: '20px',
        backgroundColor: '#16213e',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      newBtn.on('pointerover', () => newBtn.setScale(1.05));
      newBtn.on('pointerout', () => newBtn.setScale(1.0));
      newBtn.on('pointerdown', () => this.startNewCampaign());
    } else {
      // Start Campaign button
      const startBtn = this.add.text(width / 2, height / 2 + 40, 'Start Campaign', {
        fontSize: '32px',
        backgroundColor: '#16213e',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      startBtn.on('pointerover', () => startBtn.setScale(1.05));
      startBtn.on('pointerout', () => startBtn.setScale(1.0));
      startBtn.on('pointerdown', () => this.startNewCampaign());
    }

    // High Score display
    const highScore = parseInt(localStorage.getItem('abyryst_high_score') || '0');
    if (highScore > 0) {
      this.add.text(width / 2, height - 120, `High Score: ${highScore}`, {
        fontSize: '18px',
        color: '#FFD700'
      }).setOrigin(0.5);
    }

    // Instructions
    this.add.text(width / 2, height - 80, 'Navigate the labyrinth and solve puzzles\nto uncover the mystery', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // Version
    this.add.text(10, height - 20, 'v2.0.0 - Campaign Mode', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0, 1);
  }

  /**
   * Load saved campaign data from localStorage
   * @returns {Object|null} Save data or null if invalid/missing
   */
  loadSaveData() {
    try {
      const saveJson = localStorage.getItem('abyryst_campaign_save');
      if (!saveJson) return null;

      const data = JSON.parse(saveJson);

      // Validate save isn't too old (30 days)
      const ageMs = Date.now() - data.timestamp;
      if (ageMs > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('abyryst_campaign_save');
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }

  /**
   * Continue saved campaign
   * @param {Object} saveData - Saved campaign data
   */
  continueCampaign(saveData) {
    this.scene.start('GameScene', {
      resumeCampaign: true,
      saveData: saveData
    });
  }

  /**
   * Start new campaign (with confirmation if save exists)
   */
  startNewCampaign() {
    if (this.loadSaveData()) {
      const confirmed = confirm('This will delete your saved progress. Continue?');
      if (!confirmed) return;
      localStorage.removeItem('abyryst_campaign_save');
    }

    this.scene.start('GameScene', {
      resumeCampaign: false
    });
  }

  /**
   * Create flickering torch shadow effect
   * Simulates a torch casting moving shadows on the title
   */
  createTorchFlickerEffect() {
    // Random flicker pattern for torch
    const flicker = () => {
      // Random offset for torch position
      const offsetX = Phaser.Math.Between(-2, 3);
      const offsetY = Phaser.Math.Between(-1, 2);
      const duration = Phaser.Math.Between(80, 200);

      // Move shadows to simulate torch movement
      this.tweens.add({
        targets: this.titleShadow1,
        x: this.titleShadow1.x + offsetX * 1.5,
        y: this.titleShadow1.y + offsetY * 1.5,
        alpha: Phaser.Math.FloatBetween(0.3, 0.5),
        duration: duration,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: this.titleShadow2,
        x: this.titleShadow2.x + offsetX,
        y: this.titleShadow2.y + offsetY,
        alpha: Phaser.Math.FloatBetween(0.4, 0.6),
        duration: duration,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: this.titleShadow3,
        x: this.titleShadow3.x + offsetX * 0.5,
        y: this.titleShadow3.y + offsetY * 0.5,
        alpha: Phaser.Math.FloatBetween(0.5, 0.7),
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Continue flickering
          if (this.scene.isActive()) {
            flicker();
          }
        }
      });
    };

    // Start the flicker effect
    flicker();
  }
}
