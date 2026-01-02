/**
 * Game Over Scene
 * Displays when player runs out of lives (0 lives remaining)
 */

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.gameState = data.gameState;
    this.soundManager = data.soundManager;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dark overlay background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    // Game Over title
    this.add.text(width / 2, 80, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#e94560',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 140, 'No lives remaining', {
      fontSize: '18px',
      color: '#ff6b6b',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Stats
    const stats = this.gameState.campaignStats;
    const yStart = 200;
    const lineHeight = 30;

    this.add.text(width / 2, yStart, '--- Final Stats ---', {
      fontSize: '22px',
      color: '#ffcc00',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight, `Level Reached: ${this.gameState.currentLevel}/10`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 2, `Final Score: ${stats.totalScore}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 3, `Levels Completed: ${stats.levelsCompleted}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 4, `Puzzles Solved: ${stats.totalPuzzlesSolved}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 5, `Puzzles Failed: ${stats.totalPuzzlesFailed}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Format total time
    const totalMinutes = Math.floor(stats.totalTime / 60);
    const totalSeconds = stats.totalTime % 60;
    const timeString = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

    this.add.text(width / 2, yStart + lineHeight * 6, `Total Time: ${timeString}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Buttons
    const btnY = height - 120;

    // Try Again button
    const tryAgainBtn = this.add.text(width / 2, btnY, 'Try Again', {
      fontSize: '26px',
      backgroundColor: '#4ecca3',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    tryAgainBtn.on('pointerdown', () => this.tryAgain());
    tryAgainBtn.on('pointerover', () => tryAgainBtn.setScale(1.1));
    tryAgainBtn.on('pointerout', () => tryAgainBtn.setScale(1.0));

    // Menu button
    const menuBtn = this.add.text(width / 2, btnY + 50, 'Return to Menu', {
      fontSize: '20px',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => this.returnToMenu());
    menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
    menuBtn.on('pointerout', () => menuBtn.setScale(1.0));

    // Clear campaign save (campaign failed)
    localStorage.removeItem('abyryst_campaign_save');
  }

  /**
   * Start a new campaign
   */
  tryAgain() {
    this.scene.stop();
    this.scene.start('GameScene', {
      resumeCampaign: false
    });
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}
