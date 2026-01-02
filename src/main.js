import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIOverlay from './scenes/UIOverlay.js';
import StoryScene from './scenes/StoryScene.js';
import RiddlePuzzleScene from './scenes/RiddlePuzzleScene.js';
import LevelSummaryScene from './scenes/LevelSummaryScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    MenuScene,
    GameScene,
    UIOverlay,
    StoryScene,
    RiddlePuzzleScene,
    LevelSummaryScene,
    VictoryScene,
    GameOverScene
  ]
};

const game = new Phaser.Game(config);

export default game;
