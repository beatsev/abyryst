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
    this.soundManager = data.soundManager;

    // NEW: Support intersection choices
    this.choiceData = data.choiceData || null;
    this.isChoiceMode = this.choiceData !== null;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Play story sound
    if (this.soundManager) {
      this.soundManager.playStory();
    }

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

    // Render buttons based on mode
    if (!this.isChoiceMode) {
      // Normal mode: Single continue button
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
    } else {
      // Choice mode: Two cryptic choice buttons
      const choice1 = this.choiceData.choices[0];
      const choice2 = this.choiceData.choices[1];

      // Choice 1 button (top, green theme)
      const choice1Btn = this.add.text(cardX, cardY + 50, choice1.cryptic, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#4ecca3',
        padding: { x: 20, y: 15 },
        align: 'center',
        wordWrap: { width: cardWidth - 100 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      // Choice 2 button (bottom, pink theme)
      const choice2Btn = this.add.text(cardX, cardY + 120, choice2.cryptic, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#ff6b9d',
        padding: { x: 20, y: 15 },
        align: 'center',
        wordWrap: { width: cardWidth - 100 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      // Button hover effects for choice 1
      choice1Btn.on('pointerover', () => {
        choice1Btn.setStyle({ backgroundColor: '#6effe3', color: '#000000' });
      });

      choice1Btn.on('pointerout', () => {
        choice1Btn.setStyle({ backgroundColor: '#4ecca3', color: '#ffffff' });
      });

      // Button hover effects for choice 2
      choice2Btn.on('pointerover', () => {
        choice2Btn.setStyle({ backgroundColor: '#ff9dbf', color: '#000000' });
      });

      choice2Btn.on('pointerout', () => {
        choice2Btn.setStyle({ backgroundColor: '#ff6b9d', color: '#ffffff' });
      });

      // Button click handlers
      choice1Btn.on('pointerdown', () => {
        this.handleChoice(choice1);
      });

      choice2Btn.on('pointerdown', () => {
        this.handleChoice(choice2);
      });
    }
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

  /**
   * Handle intersection choice selection
   * @param {Object} choice - The chosen option
   */
  handleChoice(choice) {
    this.scene.stop();
    this.scene.resume('GameScene');

    // Pass choice back to GameScene for effect processing
    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.applyIntersectionChoice) {
      gameScene.applyIntersectionChoice(this.choiceData.intersectionId, choice);
    }
  }
}
