/**
 * Level Summary Scene
 * Displays level completion stats, grade, and Continue/Quit options
 */

export default class LevelSummaryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSummaryScene' });
  }

  init(data) {
    this.gameState = data.gameState;
    this.soundManager = data.soundManager;
    this.campaignManager = data.campaignManager;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dark overlay background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // Title
    this.add.text(width / 2, 80,
      `Level ${this.gameState.currentLevel} Complete!`, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Grade display
    const grade = this.gameState.calculateGrade();
    const gradeColor = this.getGradeColor(grade);

    this.add.text(width / 2, 150, grade, {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: gradeColor,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Level stats
    const stats = this.gameState.levelStats;
    const yStart = 240;
    const lineHeight = 30;

    this.add.text(width / 2, yStart, '--- Level Stats ---', {
      fontSize: '20px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight,
      `Time: ${this.gameState.formatLevelTime()}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 2,
      `Puzzles Solved: ${stats.puzzlesSolved}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 3,
      `Puzzles Failed: ${stats.puzzlesFailed}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 4,
      `Hints Used: ${stats.hintsUsed}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 5,
      `Level Score: ${stats.levelScore}`, {
      fontSize: '16px',
      color: '#4ecca3'
    }).setOrigin(0.5);

    // Campaign stats
    const cYStart = yStart + lineHeight * 6 + 20;

    this.add.text(width / 2, cYStart, '--- Campaign Stats ---', {
      fontSize: '20px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    this.add.text(width / 2, cYStart + lineHeight,
      `Total Score: ${this.gameState.campaignStats.totalScore}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, cYStart + lineHeight * 2,
      `Lives Remaining: ${this.gameState.livesRemaining}/3`, {
      fontSize: '16px',
      color: '#ff6b6b'
    }).setOrigin(0.5);

    // Buttons
    const btnY = height - 100;

    // Continue button
    const continueBtn = this.add.text(width / 2 - 80, btnY, 'Continue', {
      fontSize: '24px',
      backgroundColor: '#4ecca3',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => this.onContinue());
    continueBtn.on('pointerover', () => continueBtn.setScale(1.1));
    continueBtn.on('pointerout', () => continueBtn.setScale(1.0));

    // Quit button
    const quitBtn = this.add.text(width / 2 + 80, btnY, 'Quit', {
      fontSize: '24px',
      backgroundColor: '#e94560',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerdown', () => this.onQuit());
    quitBtn.on('pointerover', () => quitBtn.setScale(1.1));
    quitBtn.on('pointerout', () => quitBtn.setScale(1.0));
  }

  /**
   * Get color for grade letter
   * @param {string} grade - Grade letter (S/A/B/C/D)
   * @returns {string} Hex color
   */
  getGradeColor(grade) {
    const colors = {
      'S': '#FFD700', // Gold
      'A': '#4ecca3', // Green
      'B': '#66ccff', // Blue
      'C': '#ffaa00', // Orange
      'D': '#ff6b6b'  // Red
    };
    return colors[grade] || '#ffffff';
  }

  /**
   * Continue to next level
   */
  onContinue() {
    // Save progress
    this.saveProgress();

    // Advance to next level
    this.gameState.advanceLevel();

    // Get next level config
    const nextLevelConfig = this.campaignManager.getLevelConfig(this.gameState.currentLevel);

    if (!nextLevelConfig) {
      console.error('Invalid level number:', this.gameState.currentLevel);
      return;
    }

    // Stop current GameScene and start fresh with new level
    this.scene.stop('GameScene');
    this.scene.start('GameScene', {
      levelConfig: nextLevelConfig,
      gameState: this.gameState,
      campaignManager: this.campaignManager
    });
    this.scene.stop();
  }

  /**
   * Quit to menu
   */
  onQuit() {
    // Save progress
    this.saveProgress();

    // Return to menu
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }

  /**
   * Save campaign progress to localStorage
   */
  saveProgress() {
    const saveData = {
      currentLevel: this.gameState.currentLevel,
      livesRemaining: this.gameState.livesRemaining,
      campaignStats: this.gameState.campaignStats,
      timestamp: Date.now()
    };

    localStorage.setItem('abyryst_campaign_save', JSON.stringify(saveData));
  }
}
