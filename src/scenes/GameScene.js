import Phaser from 'phaser';
import LabyrinthGenerator from '../systems/Generator.js';
import GameState from '../systems/GameState.js';
import StoryManager from '../systems/StoryManager.js';
import PuzzleManager from '../systems/PuzzleManager.js';
import SoundManager from '../systems/SoundManager.js';
import IntersectionManager from '../systems/IntersectionManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.labyrinth = null;
    this.playerPos = { x: 0, y: 0 };
    this.tileSize = 100;
    this.gameState = new GameState();
    this.storyManager = null;
    this.puzzleManager = null;
    this.soundManager = null;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Reset game state
    this.gameState.reset();

    // Initialize managers
    this.storyManager = new StoryManager(this.gameState);
    this.puzzleManager = new PuzzleManager(this.gameState);
    this.soundManager = new SoundManager(this);
    this.intersectionManager = new IntersectionManager(this.gameState);

    // Launch UI overlay
    this.scene.launch('UIOverlay', {
      gameState: this.gameState,
      soundManager: this.soundManager
    });

    // Generate 5x5 labyrinth
    this.labyrinth = LabyrinthGenerator.generate(5, 5);

    // Find start position
    this.playerPos = { ...this.labyrinth.start };

    // Mark start tile as visited
    this.gameState.markTileVisited(this.playerPos.x, this.playerPos.y);

    // Render labyrinth
    this.renderLabyrinth();

    // Render player
    this.player = this.add.circle(0, 0, 20, 0xff6b6b);
    this.updatePlayerPosition();

    // UI - Menu button (top-left)
    const menuButton = this.add.text(10, 10, '☰ Menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#16213e',
      padding: { x: 10, y: 5 }
    }).setInteractive({ useHandCursor: true });

    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Title (top-right)
    this.add.text(width - 10, 10, 'ABYRYST', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(1, 0);

    // Setup touch controls
    this.setupTouchControls();

    // Optional: Keep keyboard support for desktop
    this.cursors = this.input.keyboard.createCursorKeys();

    // Movement cooldown
    this.canMove = true;

    // Swipe detection
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.swipeMinDistance = 50;

    // Show intro story
    const introStory = this.storyManager.getNextStory('start');
    if (introStory) {
      this.scene.pause();
      this.scene.launch('StoryScene', {
        storyCard: introStory,
        nextScene: 'GameScene',
        soundManager: this.soundManager
      });
    }
  }

  setupTouchControls() {
    const { width, height } = this.cameras.main;
    const buttonSize = 60;
    const buttonMargin = 20;
    const bottomY = height - buttonSize - buttonMargin;

    // D-pad style buttons (bottom center)
    const centerX = width / 2;
    const buttonStyle = {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 5 }
    };

    // Up button
    const upBtn = this.add.text(centerX, bottomY - buttonSize - 10, '▲', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Down button
    const downBtn = this.add.text(centerX, bottomY + buttonSize + 10, '▼', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Left button
    const leftBtn = this.add.text(centerX - buttonSize - 10, bottomY, '◄', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Right button
    const rightBtn = this.add.text(centerX + buttonSize + 10, bottomY, '►', buttonStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Button events
    upBtn.on('pointerdown', () => this.tryMove(0, -1));
    downBtn.on('pointerdown', () => this.tryMove(0, 1));
    leftBtn.on('pointerdown', () => this.tryMove(-1, 0));
    rightBtn.on('pointerdown', () => this.tryMove(1, 0));

    // Swipe detection
    this.input.on('pointerdown', (pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer) => {
      const deltaX = pointer.x - this.swipeStartX;
      const deltaY = pointer.y - this.swipeStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance >= this.swipeMinDistance) {
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          this.tryMove(deltaX > 0 ? 1 : -1, 0);
        } else {
          // Vertical swipe
          this.tryMove(0, deltaY > 0 ? 1 : -1);
        }
      }
    });
  }

  tryMove(dx, dy) {
    if (!this.canMove) return;

    const newPos = {
      x: this.playerPos.x + dx,
      y: this.playerPos.y + dy
    };

    if (this.isValidMove(newPos)) {
      this.playerPos = newPos;
      this.updatePlayerPosition();

      // Play movement sound
      this.soundManager.playMove();

      // Track visited tile
      this.gameState.markTileVisited(newPos.x, newPos.y);

      // Handle special tile events (puzzles, intersections)
      this.handleTileEntry(newPos);

      this.checkWinCondition();

      // Movement cooldown
      this.canMove = false;
      this.time.delayedCall(200, () => { this.canMove = true; });
    }
  }

  update() {
    if (!this.canMove) return;

    // Optional: Keep keyboard support for desktop
    if (this.cursors.up.isDown) {
      this.tryMove(0, -1);
    } else if (this.cursors.down.isDown) {
      this.tryMove(0, 1);
    } else if (this.cursors.left.isDown) {
      this.tryMove(-1, 0);
    } else if (this.cursors.right.isDown) {
      this.tryMove(1, 0);
    }
  }

  renderLabyrinth() {
    // Clear existing graphics if any
    if (this.labyrinthContainer) {
      this.labyrinthContainer.destroy();
    }

    this.labyrinthContainer = this.add.container(0, 0);

    const { width, height } = this.cameras.main;
    const gridWidth = this.labyrinth.width * this.tileSize;
    const gridHeight = this.labyrinth.height * this.tileSize;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = (height - gridHeight) / 2;

    this.labyrinth.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const posX = offsetX + x * this.tileSize;
        const posY = offsetY + y * this.tileSize;

        // Draw tile
        const rect = this.add.rectangle(
          posX + this.tileSize / 2,
          posY + this.tileSize / 2,
          this.tileSize - 4,
          this.tileSize - 4,
          tile.type === 'empty' ? 0x2a2a2a : 0x16213e
        );
        rect.setStrokeStyle(2, 0x0f3460);
        this.labyrinthContainer.add(rect);

        if (tile.type !== 'empty') {
          // Draw connections
          if (tile.connections.N) this.drawConnection(posX, posY, 'N');
          if (tile.connections.S) this.drawConnection(posX, posY, 'S');
          if (tile.connections.E) this.drawConnection(posX, posY, 'E');
          if (tile.connections.W) this.drawConnection(posX, posY, 'W');

          // Mark start/end
          if (x === this.labyrinth.start.x && y === this.labyrinth.start.y) {
            const startText = this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, 'START', {
              fontSize: '12px',
              color: '#4ecca3'
            }).setOrigin(0.5);
            this.labyrinthContainer.add(startText);
          }
          if (x === this.labyrinth.end.x && y === this.labyrinth.end.y) {
            const endText = this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, 'END', {
              fontSize: '12px',
              color: '#ff6b6b'
            }).setOrigin(0.5);
            this.labyrinthContainer.add(endText);
          }

          // Mark puzzle tiles
          if (tile.type === 'puzzle') {
            const puzzleCircle = this.add.circle(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              15,
              0xffcc00
            ).setAlpha(0.7);
            this.labyrinthContainer.add(puzzleCircle);

            const puzzleText = this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, '?', {
              fontSize: '20px',
              color: '#ffffff',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            this.labyrinthContainer.add(puzzleText);
          }

          // Mark intersection tiles
          if (tile.type === 'intersection') {
            const intersectionStar = this.add.star(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              4, 10, 20,
              0xff6b9d
            );
            this.labyrinthContainer.add(intersectionStar);
          }
        }
      });
    });
  }

  drawConnection(x, y, direction) {
    const centerX = x + this.tileSize / 2;
    const centerY = y + this.tileSize / 2;
    const lineWidth = 3;
    const lineColor = 0x4ecca3;

    let line;
    switch (direction) {
      case 'N':
        line = this.add.line(0, 0, centerX, centerY, centerX, y, lineColor);
        break;
      case 'S':
        line = this.add.line(0, 0, centerX, centerY, centerX, y + this.tileSize, lineColor);
        break;
      case 'E':
        line = this.add.line(0, 0, centerX, centerY, x + this.tileSize, centerY, lineColor);
        break;
      case 'W':
        line = this.add.line(0, 0, centerX, centerY, x, centerY, lineColor);
        break;
    }
    line.setLineWidth(lineWidth);
    this.labyrinthContainer.add(line);
  }

  updatePlayerPosition() {
    const { width, height } = this.cameras.main;
    const gridWidth = this.labyrinth.width * this.tileSize;
    const gridHeight = this.labyrinth.height * this.tileSize;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = (height - gridHeight) / 2;

    this.player.setPosition(
      offsetX + this.playerPos.x * this.tileSize + this.tileSize / 2,
      offsetY + this.playerPos.y * this.tileSize + this.tileSize / 2
    );
  }

  isValidMove(pos) {
    if (pos.x < 0 || pos.x >= this.labyrinth.width || pos.y < 0 || pos.y >= this.labyrinth.height) {
      return false;
    }

    const currentTile = this.labyrinth.grid[this.playerPos.y][this.playerPos.x];
    const targetTile = this.labyrinth.grid[pos.y][pos.x];

    if (targetTile.type === 'empty') return false;

    // Check if there's a connection
    const dx = pos.x - this.playerPos.x;
    const dy = pos.y - this.playerPos.y;

    if (dx === 1 && currentTile.connections.E) return true;
    if (dx === -1 && currentTile.connections.W) return true;
    if (dy === 1 && currentTile.connections.S) return true;
    if (dy === -1 && currentTile.connections.N) return true;

    return false;
  }

  checkWinCondition() {
    if (this.playerPos.x === this.labyrinth.end.x && this.playerPos.y === this.labyrinth.end.y) {
      // Play win sound
      this.soundManager.playWin();

      // Show end story with final score
      const endStory = this.storyManager.getNextStory('end');
      if (endStory) {
        this.scene.pause();
        this.scene.launch('StoryScene', {
          storyCard: {
            ...endStory,
            text: endStory.text + `\n\nFinal Score: ${this.gameState.score}\nTime: ${this.gameState.formatTime()}`
          },
          nextScene: 'MenuScene',
          soundManager: this.soundManager
        });

        this.time.delayedCall(3000, () => {
          this.scene.stop('StoryScene');
          this.scene.stop('UIOverlay');
          this.scene.start('MenuScene');
        });
      } else {
        // Fallback if no end story
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'YOU WIN!', {
          fontSize: '48px',
          fontFamily: 'Arial Black',
          color: '#4ecca3',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(1000);

        this.time.delayedCall(2000, () => {
          this.scene.stop('UIOverlay');
          this.scene.start('MenuScene');
        });
      }
    }
  }

  /**
   * Handle tile entry - check for puzzles, intersections, etc.
   * @param {Object} pos - Tile position {x, y}
   */
  handleTileEntry(pos) {
    const tile = this.labyrinth.grid[pos.y][pos.x];

    if (tile.type === 'puzzle' && !this.gameState.solvedPuzzles.includes(tile.puzzleId)) {
      // Show story before puzzle
      const story = this.storyManager.getNextStory('puzzle');
      if (story) {
        this.scene.pause();
        this.scene.launch('StoryScene', {
          storyCard: story,
          nextScene: 'GameScene',
          soundManager: this.soundManager,
          nextSceneData: {
            launchPuzzle: true,
            puzzleId: tile.puzzleId,
            playerPos: pos
          }
        });
      } else {
        // No story, launch puzzle directly
        this.launchPuzzle(tile.puzzleId, pos);
      }
    } else if (tile.type === 'intersection') {
      this.handleIntersection(pos);
    }
  }

  /**
   * Launch a puzzle scene
   * @param {string} puzzleId - Puzzle identifier
   * @param {Object} pos - Player position
   */
  launchPuzzle(puzzleId, pos) {
    // Launch RiddlePuzzleScene with puzzle data
    this.scene.pause();
    this.scene.launch('RiddlePuzzleScene', {
      puzzleId: puzzleId,
      playerPos: pos,
      puzzleManager: this.puzzleManager,
      gameState: this.gameState,
      soundManager: this.soundManager
    });
  }

  /**
   * Handle intersection tile - present mystery choices
   * @param {Object} pos - Tile position
   */
  handleIntersection(pos) {
    // Generate random mystery choices
    const choiceData = this.intersectionManager.generateIntersectionChoices();

    // Get intersection story
    const story = this.storyManager.getNextStory('intersection');

    if (story) {
      this.scene.pause();
      this.scene.launch('StoryScene', {
        storyCard: story,
        nextScene: 'GameScene',
        soundManager: this.soundManager,
        choiceData: choiceData // Pass choices to StoryScene
      });
    }
  }

  /**
   * Apply intersection choice effect
   * @param {string} intersectionId - Unique intersection ID
   * @param {Object} choice - The chosen option
   */
  applyIntersectionChoice(intersectionId, choice) {
    // Apply effect and get feedback
    const feedback = this.intersectionManager.applyChoiceEffect(choice, this);

    // Record choice
    this.gameState.recordIntersectionChoice(intersectionId, choice);

    // Toggle lineage (keep existing behavior)
    const newLineage = this.gameState.currentLineage === 'A' ? 'B' : 'A';
    this.storyManager.switchLineage(newLineage);

    // Show feedback overlay
    if (feedback) {
      this.showFeedbackMessage(feedback);
    }
  }

  /**
   * Show feedback message overlay
   * @param {string} message - Feedback text to display
   */
  showFeedbackMessage(message) {
    const { width, height } = this.cameras.main;

    const feedbackBg = this.add.rectangle(width / 2, height / 2, 400, 100, 0x000000)
      .setAlpha(0.9).setDepth(1000);

    const feedbackText = this.add.text(width / 2, height / 2, message, {
      fontSize: '18px',
      color: '#4ecca3',
      align: 'center',
      wordWrap: { width: 360 }
    }).setOrigin(0.5).setDepth(1001);

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [feedbackBg, feedbackText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          feedbackBg.destroy();
          feedbackText.destroy();
        }
      });
    });
  }

  /**
   * Regenerate labyrinth while preserving player progress
   */
  regenerateLabyrinth() {
    // Store current state to preserve
    const preservedState = {
      score: this.gameState.score,
      startTime: this.gameState.startTime,
      hintsRemaining: this.gameState.hintsRemaining,
      currentLineage: this.gameState.currentLineage,
      solvedPuzzles: [...this.gameState.solvedPuzzles],
      difficultyMultiplier: this.gameState.difficultyMultiplier,
      storyTone: this.gameState.storyTone,
      intersectionChoices: [...this.gameState.intersectionChoices]
    };

    // Clear existing labyrinth graphics
    if (this.labyrinthContainer) {
      this.labyrinthContainer.destroy();
    }

    // Destroy and recreate player sprite
    if (this.player) {
      this.player.destroy();
    }

    // Generate new labyrinth (includes guaranteePuzzleOnPath)
    this.labyrinth = LabyrinthGenerator.generate(5, 5);

    // Reset player to start
    this.playerPos = { ...this.labyrinth.start };

    // Restore preserved state
    Object.assign(this.gameState, preservedState);
    this.gameState.visitedTiles = [];
    this.gameState.markTileVisited(this.playerPos.x, this.playerPos.y);

    // Re-render labyrinth
    this.renderLabyrinth();

    // Re-render player
    this.player = this.add.circle(0, 0, 20, 0xff6b6b);
    this.updatePlayerPosition();
  }
}
