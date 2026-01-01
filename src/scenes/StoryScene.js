import Phaser from 'phaser';

/**
 * Story Scene
 * Displays story cards as modal overlays
 */
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  /**
   * Initialize with story card and navigation data
   * @param {Object} data - Init data
   */
  init(data) {
    this.storyCard = data.storyCard;
    this.nextScene = data.nextScene || 'GameScene';
    this.nextSceneData = data.nextSceneData || {};
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background overlay
    this.add.rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setInteractive(); // Block input to scenes below

    // Story card panel
    const cardWidth = Math.min(600, width - 40);
    const cardHeight = 300;
    const cardX = width / 2;
    const cardY = height / 2;

    // Card background with border
    this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x16213e)
      .setStrokeStyle(3, 0x4ecca3);

    // Decorative top bar
    this.add.rectangle(cardX, cardY - cardHeight / 2 + 15, cardWidth, 30, 0x0f3460);

    // Story text
    this.add.text(cardX, cardY - 30, this.storyCard.text, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: cardWidth - 60 }
    }).setOrigin(0.5);

    // Continue button
    const continueBtn = this.add.text(cardX, cardY + 90, 'Continue', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#4ecca3',
      padding: { x: 30, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Button hover effects
    continueBtn.on('pointerover', () => {
      continueBtn.setStyle({ backgroundColor: '#6effe3', color: '#000000' });
    });

    continueBtn.on('pointerout', () => {
      continueBtn.setStyle({ backgroundColor: '#4ecca3', color: '#ffffff' });
    });

    // Button click handler
    continueBtn.on('pointerdown', () => {
      this.handleContinue();
    });

    // Also allow Enter/Space key to continue
    this.input.keyboard.once('keydown-ENTER', () => this.handleContinue());
    this.input.keyboard.once('keydown-SPACE', () => this.handleContinue());
  }

  /**
   * Handle continue button click
   */
  handleContinue() {
    this.scene.stop();
    this.scene.resume(this.nextScene);

    // If there's data to pass back (like launching a puzzle)
    if (this.nextSceneData.launchPuzzle) {
      // GameScene will handle launching the puzzle
      const gameScene = this.scene.get('GameScene');
      if (gameScene && gameScene.launchPuzzle) {
        gameScene.launchPuzzle(
          this.nextSceneData.puzzleId,
          this.nextSceneData.playerPos
        );
      }
    }
  }
}
