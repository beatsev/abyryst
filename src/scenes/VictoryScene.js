/**
 * Victory Scene
 * Displays final campaign stats after beating all 10 levels
 */

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.gameState = data.gameState;
    this.soundManager = data.soundManager;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dark overlay background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.9).setOrigin(0);

    // Victory title
    this.add.text(width / 2, 60, 'CAMPAIGN COMPLETE!', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Congratulations message
    this.add.text(width / 2, 120, 'You have conquered the Labyrinth!', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Final stats
    const stats = this.gameState.campaignStats;
    const yStart = 180;
    const lineHeight = 35;

    this.add.text(width / 2, yStart, '--- Final Stats ---', {
      fontSize: '24px',
      color: '#ffcc00',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);

    // Total Score (large, prominent)
    this.add.text(width / 2, yStart + lineHeight, 'FINAL SCORE', {
      fontSize: '18px',
      color: '#999999'
    }).setOrigin(0.5);

    this.add.text(width / 2, yStart + lineHeight * 2, `${stats.totalScore}`, {
      fontSize: '56px',
      fontFamily: 'Arial Black',
      color: '#4ecca3',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Check for high score
    const highScore = parseInt(localStorage.getItem('abyryst_high_score') || '0');
    const isNewHighScore = stats.totalScore > highScore;

    if (isNewHighScore) {
      this.add.text(width / 2, yStart + lineHeight * 3, '🏆 NEW HIGH SCORE! 🏆', {
        fontSize: '20px',
        color: '#FFD700',
        fontFamily: 'Arial Black'
      }).setOrigin(0.5);
    } else if (highScore > 0) {
      this.add.text(width / 2, yStart + lineHeight * 3, `High Score: ${highScore}`, {
        fontSize: '16px',
        color: '#999999'
      }).setOrigin(0.5);
    }

    // Additional stats
    const detailsY = yStart + lineHeight * 4 + 20;

    this.add.text(width / 2, detailsY, `Levels Completed: ${stats.levelsCompleted}/10`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, detailsY + 25, `Total Puzzles Solved: ${stats.totalPuzzlesSolved}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, detailsY + 50, `Total Puzzles Failed: ${stats.totalPuzzlesFailed}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Format total time
    const totalMinutes = Math.floor(stats.totalTime / 60);
    const totalSeconds = stats.totalTime % 60;
    const timeString = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

    this.add.text(width / 2, detailsY + 75, `Total Time: ${timeString}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Return to Menu button
    const menuBtn = this.add.text(width / 2, height - 80, 'Return to Menu', {
      fontSize: '28px',
      backgroundColor: '#16213e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => this.returnToMenu());
    menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
    menuBtn.on('pointerout', () => menuBtn.setScale(1.0));

    // Clear campaign save (campaign is complete)
    localStorage.removeItem('abyryst_campaign_save');
  }

  /**
   * Return to main menu
   */
  returnToMenu() {
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}
