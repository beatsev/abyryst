import Phaser from 'phaser';
import LabyrinthGenerator from '../systems/Generator.js';
import GameState from '../systems/GameState.js';
import TileGraphics from '../systems/TileGraphics.js';
import StoryManager from '../systems/StoryManager.js';
import PuzzleManager from '../systems/PuzzleManager.js';
import SoundManager from '../systems/SoundManager.js';
import IntersectionManager from '../systems/IntersectionManager.js';
import CampaignManager from '../systems/CampaignManager.js';
import { circleHitArea, wireButton } from '../systems/ButtonUtils.js';

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

  preload() {
    // Generate procedural tile textures before the scene starts
    TileGraphics.generate(this);
  }

  create(data) {
    const { width, height } = this.cameras.main;

    // Generate procedural tile textures (ensure textures are available)
    // (Removed duplicate generation; now handled in preload)

    // Initialize campaign manager
    this.campaignManager = new CampaignManager();

    // Check if resuming or starting new
    if (data && data.resumeCampaign && data.saveData) {
      this.resumeFromSave(data.saveData);
    } else if (data && data.levelConfig) {
      // Continuing from level summary
      this.currentLevelConfig = data.levelConfig;
      this.gameState = data.gameState;
      this.campaignManager = data.campaignManager;
    } else {
      // Starting fresh campaign
      this.gameState = new GameState();
      this.gameState.reset();
      this.gameState.currentLevel = 1;
      this.gameState.livesRemaining = 3;
      this.gameState.isCampaignMode = true;
      this.currentLevelConfig = this.campaignManager.getLevelConfig(1);
    }

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

    this.createSceneBackdrop();

    // Generate labyrinth with level-specific grid size
    const { width: gridW, height: gridH } = this.currentLevelConfig.gridSize;
    this.labyrinth = LabyrinthGenerator.generate(gridW, gridH);

    // Reset hints to level config
    this.gameState.hintsRemaining = this.currentLevelConfig.hintsAllowed;

    // Calculate tile size for responsive grid
    this.calculateTileSize();

    // Find start position
    this.playerPos = { ...this.labyrinth.start };

    // Mark start tile as visited
    this.gameState.markTileVisited(this.playerPos.x, this.playerPos.y);

    // Render labyrinth
    this.renderLabyrinth();

    // Render player
    this.playerGlow = this.add.circle(0, 0, Math.max(14, this.tileSize * 0.28), 0xff647a, 0.22).setDepth(20);
    this.player = this.add.image(0, 0, 'player-sprite').setDepth(21);
    this.updatePlayerPosition();

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
    this.swipeActive = false;

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


  createSceneBackdrop() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x070a12).setOrigin(0);

    const glow = this.add.graphics();
    glow.fillGradientStyle(0x16304a, 0x16304a, 0x070a12, 0x070a12, 0.75);
    glow.fillRect(0, 0, width, Math.max(180, height * 0.34));
    glow.fillStyle(0x62e5bf, 0.055);
    glow.fillCircle(width * 0.18, height * 0.18, Math.max(90, width * 0.24));
    glow.fillStyle(0xffc857, 0.04);
    glow.fillCircle(width * 0.86, height * 0.12, Math.max(80, width * 0.2));
  }

  createMoveButton(x, y, size, label, onClick) {
    const button = this.add.container(x, y).setSize(size, size).setDepth(41);
    const bg = this.add.circle(0, 0, size / 2, 0x17233a, 0.9)
      .setStrokeStyle(2, 0x62e5bf, 0.55);
    const text = this.add.text(0, 0, label, {
      fontSize: `${Math.floor(size * 0.44)}px`,
      fontFamily: 'Arial Black',
      color: '#f5fffb'
    }).setOrigin(0.5);

    button.add([bg, text]);

    const hitArea = circleHitArea(size / 2, Math.max(8, size * 0.12));
    wireButton(this, button, onClick, {
      bg,
      hitArea: hitArea.area,
      hitAreaCallback: hitArea.callback,
      hoverAlpha: 1,
      activateOn: 'down'
    });

    button.on('pointerover', () => bg.setFillStyle(0x254467, 0.96));
    button.on('pointerout', () => bg.setFillStyle(0x17233a, 0.9));
    button.on('pointerdown', () => {
      bg.setFillStyle(0x62e5bf, 0.75);
      this.time.delayedCall(90, () => bg.setFillStyle(0x17233a, 0.9));
    });

    return button;
  }

  setupTouchControls() {
    const { width, height } = this.cameras.main;
    const buttonSize = Math.max(58, Math.min(76, width * 0.16));
    const gap = Math.max(10, Math.min(16, width * 0.025));
    const bottomY = height - buttonSize - Math.max(18, height * 0.025);
    const centerX = width / 2;

    this.add.rectangle(centerX, bottomY, buttonSize * 3 + gap * 2 + 28, buttonSize * 2 + gap + 24, 0x070a12, 0.58)
      .setStrokeStyle(1, 0x62e5bf, 0.22)
      .setDepth(40);

    this.createMoveButton(centerX, bottomY - buttonSize / 2 - gap / 2, buttonSize, '▲', () => this.tryMove(0, -1));
    this.createMoveButton(centerX, bottomY + buttonSize / 2 + gap / 2, buttonSize, '▼', () => this.tryMove(0, 1));
    this.createMoveButton(centerX - buttonSize - gap, bottomY + buttonSize / 2 + gap / 2, buttonSize, '◄', () => this.tryMove(-1, 0));
    this.createMoveButton(centerX + buttonSize + gap, bottomY + buttonSize / 2 + gap / 2, buttonSize, '►', () => this.tryMove(1, 0));

    // Swipe detection
    this.input.on('pointerdown', (pointer, currentlyOver = []) => {
      if (currentlyOver.some(target => target.isUiButton)) {
        this.swipeActive = false;
        return;
      }

      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeActive = true;
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.swipeActive) return;
      this.swipeActive = false;

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
      this.renderLabyrinth();
      this.updatePlayerPosition();

      // Handle special tile events (puzzles, intersections)
      this.handleTileEntry(newPos);

      this.checkWinCondition();

      // Movement cooldown
      this.canMove = false;
      this.time.delayedCall(130, () => { this.canMove = true; });
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
    const offsetY = Math.max(86, (height - gridHeight) / 2 - 18);

    const boardPad = Math.max(8, this.tileSize * 0.12);
    const boardShadow = this.add.rectangle(width / 2 + 4, offsetY + gridHeight / 2 + 6, gridWidth + boardPad * 2, gridHeight + boardPad * 2, 0x000000, 0.32);
    const boardBg = this.add.rectangle(width / 2, offsetY + gridHeight / 2, gridWidth + boardPad * 2, gridHeight + boardPad * 2, 0x0b1020, 0.92)
      .setStrokeStyle(2, 0x62e5bf, 0.22);
    this.labyrinthContainer.add([boardShadow, boardBg]);

    this.labyrinth.grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const posX = offsetX + x * this.tileSize;
        const posY = offsetY + y * this.tileSize;

        let textureKey = 'tile-empty';
        if (tile.type !== 'empty') {
          // Calculate bitmask for connections
          let mask = 0;
          if (tile.connections.N) mask += 1;
          if (tile.connections.E) mask += 2;
          if (tile.connections.S) mask += 4;
          if (tile.connections.W) mask += 8;
          textureKey = `tile-${mask}`;
        }

        // Create tile sprite
        const sprite = this.add.image(
          posX + this.tileSize / 2,
          posY + this.tileSize / 2,
          textureKey
        );
        sprite.setDisplaySize(this.tileSize, this.tileSize);
        this.labyrinthContainer.add(sprite);

        if (tile.type !== 'empty' && !this.gameState.visitedTiles.includes(`${x},${y}`)) {
          const veil = this.add.rectangle(
            posX + this.tileSize / 2,
            posY + this.tileSize / 2,
            this.tileSize * 0.96,
            this.tileSize * 0.96,
            0x05070d,
            0.22
          );
          this.labyrinthContainer.add(veil);
        }

        if (tile.type !== 'empty') {
          // Mark start/end
          if (x === this.labyrinth.start.x && y === this.labyrinth.start.y) {
            const startMarker = this.add.image(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              'marker-start'
            ).setDisplaySize(this.tileSize, this.tileSize);
            this.labyrinthContainer.add(startMarker);
          }
          
          if (x === this.labyrinth.end.x && y === this.labyrinth.end.y) {
            const endMarker = this.add.image(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              'marker-end'
            ).setDisplaySize(this.tileSize, this.tileSize);
            this.labyrinthContainer.add(endMarker);
          }

          // Mark puzzle tiles
          if (tile.type === 'puzzle') {
            const puzzleMarker = this.add.image(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              'marker-puzzle'
            ).setDisplaySize(this.tileSize * 0.6, this.tileSize * 0.6);
            this.labyrinthContainer.add(puzzleMarker);
          }

          // Mark intersection tiles
          if (tile.type === 'intersection') {
            const intersectionMarker = this.add.image(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              'marker-intersection'
            ).setDisplaySize(this.tileSize * 0.6, this.tileSize * 0.6);
            this.labyrinthContainer.add(intersectionMarker);
          }
        }
      });
    });
  }

  updatePlayerPosition() {
    const { width, height } = this.cameras.main;
    const gridWidth = this.labyrinth.width * this.tileSize;
    const gridHeight = this.labyrinth.height * this.tileSize;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = Math.max(86, (height - gridHeight) / 2 - 18);
    const x = offsetX + this.playerPos.x * this.tileSize + this.tileSize / 2;
    const y = offsetY + this.playerPos.y * this.tileSize + this.tileSize / 2;

    if (this.playerGlow) {
      this.playerGlow.setPosition(x, y).setRadius(Math.max(14, this.tileSize * 0.31));
    }
    this.player.setPosition(x, y);
    this.player.setDisplaySize(this.tileSize * 0.68, this.tileSize * 0.68);
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
      this.soundManager.playWin();

      // Calculate level stats
      const levelTime = this.gameState.getLevelElapsedTime();
      this.gameState.levelStats.timeElapsed = levelTime;
      this.gameState.levelStats.levelScore = this.gameState.score - this.gameState.campaignStats.totalScore;

      // Update campaign stats
      this.gameState.campaignStats.levelsCompleted++;
      this.gameState.campaignStats.totalScore = this.gameState.score;
      this.gameState.campaignStats.totalPuzzlesSolved += this.gameState.levelStats.puzzlesSolved;
      this.gameState.campaignStats.totalPuzzlesFailed += this.gameState.levelStats.puzzlesFailed;
      this.gameState.campaignStats.totalTime += levelTime;

      if (this.gameState.currentLevel === 10) {
        this.handleCampaignComplete();
      } else {
        this.handleLevelComplete();
      }
    }
  }

  /**
   * Handle level completion (levels 1-9)
   */
  handleLevelComplete() {
    this.scene.pause();
    this.scene.launch('LevelSummaryScene', {
      gameState: this.gameState,
      soundManager: this.soundManager,
      campaignManager: this.campaignManager
    });
  }

  /**
   * Handle campaign completion (level 10)
   */
  handleCampaignComplete() {
    this.scene.pause();

    // Save high score
    const currentScore = this.gameState.score;
    const highScore = parseInt(localStorage.getItem('abyryst_high_score') || '0');
    if (currentScore > highScore) {
      localStorage.setItem('abyryst_high_score', currentScore.toString());
    }

    this.scene.launch('VictoryScene', {
      gameState: this.gameState,
      soundManager: this.soundManager
    });
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
    if (this.playerGlow) {
      this.playerGlow.destroy();
    }

    // Generate new labyrinth with current level's grid size
    const { width: gridW, height: gridH } = this.currentLevelConfig.gridSize;
    this.labyrinth = LabyrinthGenerator.generate(gridW, gridH);

    // Reset player to start
    this.playerPos = { ...this.labyrinth.start };

    // Restore preserved state
    Object.assign(this.gameState, preservedState);
    this.gameState.visitedTiles = [];
    this.gameState.markTileVisited(this.playerPos.x, this.playerPos.y);

    // Re-render labyrinth
    this.renderLabyrinth();

    // Re-render player
    this.playerGlow = this.add.circle(0, 0, Math.max(14, this.tileSize * 0.28), 0xff647a, 0.22).setDepth(20);
    this.player = this.add.image(0, 0, 'player-sprite').setDepth(21);
    this.updatePlayerPosition();
  }

  /**
   * Resume campaign from saved data
   * @param {Object} saveData - Saved campaign data
   */
  resumeFromSave(saveData) {
    this.gameState = new GameState();
    this.gameState.currentLevel = saveData.currentLevel;
    this.gameState.livesRemaining = saveData.livesRemaining;
    this.gameState.campaignStats = saveData.campaignStats;
    this.gameState.score = saveData.campaignStats.totalScore;
    this.gameState.isCampaignMode = true;

    this.currentLevelConfig = this.campaignManager.getLevelConfig(saveData.currentLevel);
  }

  /**
   * Calculate tile size for responsive grid
   */
  calculateTileSize() {
    const { width, height } = this.cameras.main;
    const { width: gridW, height: gridH } = this.currentLevelConfig.gridSize;

    const sidePadding = Math.max(24, Math.min(72, width * 0.08));
    const topReserve = 92;
    const bottomReserve = Math.max(176, Math.min(230, height * 0.28));
    const maxTileSizeX = (width - sidePadding * 2) / gridW;
    const maxTileSizeY = (height - topReserve - bottomReserve) / gridH;

    this.tileSize = Math.floor(Math.max(34, Math.min(96, maxTileSizeX, maxTileSizeY)));
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
