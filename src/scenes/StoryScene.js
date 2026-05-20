import Phaser from 'phaser';

/**
 * Story Scene
 * Displays story cards as modal overlays.
 */
export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  /**
   * Initialize with story card and navigation data.
   * @param {Object} data - Init data
   */
  init(data) {
    this.storyCard = data.storyCard;
    this.nextScene = data.nextScene || 'GameScene';
    this.nextSceneData = data.nextSceneData || {};
    this.soundManager = data.soundManager;
    this.choiceData = data.choiceData || null;
    this.isChoiceMode = this.choiceData !== null;
  }

  create() {
    const { width, height } = this.cameras.main;
    const compact = width < 500;

    if (this.soundManager) {
      this.soundManager.playStory();
    }

    this.add.rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0, 0)
      .setAlpha(0.78)
      .setInteractive();

    const cardWidth = Math.min(width - 28, 620);
    const cardHeight = Math.min(height - 64, this.isChoiceMode ? 420 : 340);
    const cardX = width / 2;
    const cardY = height / 2;
    const top = cardY - cardHeight / 2;

    this.add.rectangle(cardX + 4, cardY + 8, cardWidth, cardHeight, 0x000000, 0.38);
    this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x0b1020, 0.96)
      .setStrokeStyle(2, 0x62e5bf, 0.32);
    this.add.rectangle(cardX, top + 28, cardWidth, 56, 0x17233a, 0.82);

    this.add.text(cardX, top + 18, this.isChoiceMode ? 'THE CROSSING' : 'THE LABYRINTH SPEAKS', {
      fontSize: compact ? '15px' : '17px',
      fontFamily: 'Arial Black',
      color: '#62e5bf'
    }).setOrigin(0.5, 0);

    this.add.text(cardX, top + (this.isChoiceMode ? 104 : 122), this.storyCard.text, {
      fontSize: compact ? '17px' : '18px',
      color: '#eef6ff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 7,
      wordWrap: { width: cardWidth - 48 }
    }).setOrigin(0.5);

    if (!this.isChoiceMode) {
      this.createButton(cardX, top + cardHeight - 66, cardWidth - 56, 54, 'CONTINUE', 0x62e5bf, 0x07110e, () => this.handleContinue());
      this.input.keyboard.once('keydown-ENTER', () => this.handleContinue());
      this.input.keyboard.once('keydown-SPACE', () => this.handleContinue());
      return;
    }

    const [choice1, choice2] = this.choiceData.choices;
    const buttonWidth = cardWidth - 48;
    this.createButton(cardX, top + cardHeight - 142, buttonWidth, 58, choice1.cryptic, 0x1f8f7d, 0xffffff, () => this.handleChoice(choice1), compact);
    this.createButton(cardX, top + cardHeight - 72, buttonWidth, 58, choice2.cryptic, 0x7c4fb0, 0xffffff, () => this.handleChoice(choice2), compact);
  }

  createButton(x, y, width, height, label, fill, color, onClick, compact = false) {
    const button = this.add.container(x, y).setSize(width, height);
    const bg = this.add.rectangle(0, 0, width, height, fill, 1)
      .setStrokeStyle(2, 0xffffff, 0.18);
    const text = this.add.text(0, 0, label, {
      fontSize: compact ? '14px' : '16px',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontFamily: 'Arial Black',
      align: 'center',
      wordWrap: { width: width - 30 }
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    button.on('pointerover', () => bg.setAlpha(0.86));
    button.on('pointerout', () => bg.setAlpha(1));
    button.on('pointerdown', onClick);
    return button;
  }

  handleContinue() {
    this.scene.stop();
    this.scene.resume(this.nextScene);

    if (this.nextSceneData.launchPuzzle) {
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
   * Handle intersection choice selection.
   * @param {Object} choice - The chosen option
   */
  handleChoice(choice) {
    this.scene.stop();
    this.scene.resume('GameScene');

    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.applyIntersectionChoice) {
      gameScene.applyIntersectionChoice(this.choiceData.intersectionId, choice);
    }
  }
}
