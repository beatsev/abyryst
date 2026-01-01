import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, height / 3, 'ABYRYST', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 40, 'Labyrinth Mystery', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 40, 'Start Game', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#16213e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#0f3460' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#16213e' });
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Instructions
    this.add.text(width / 2, height - 100, 'Navigate the labyrinth and solve puzzles\nto uncover the mystery', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // Version
    this.add.text(10, height - 20, 'v1.0.0 - MVP Prototype', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0, 1);
  }
}
