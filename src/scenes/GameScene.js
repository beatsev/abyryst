import Phaser from 'phaser';
import LabyrinthGenerator from '../systems/Generator.js';
import GameState from '../systems/GameState.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.labyrinth = null;
    this.playerPos = { x: 0, y: 0 };
    this.tileSize = 100;
    this.gameState = new GameState();
  }

  create() {
    const { width, height } = this.cameras.main;

    // Reset game state
    this.gameState.reset();

    // Launch UI overlay
    this.scene.launch('UIOverlay', { gameState: this.gameState });

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

      // Track visited tile
      this.gameState.markTileVisited(newPos.x, newPos.y);

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

        if (tile.type !== 'empty') {
          // Draw connections
          if (tile.connections.N) this.drawConnection(posX, posY, 'N');
          if (tile.connections.S) this.drawConnection(posX, posY, 'S');
          if (tile.connections.E) this.drawConnection(posX, posY, 'E');
          if (tile.connections.W) this.drawConnection(posX, posY, 'W');

          // Mark start/end
          if (x === this.labyrinth.start.x && y === this.labyrinth.start.y) {
            this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, 'START', {
              fontSize: '12px',
              color: '#4ecca3'
            }).setOrigin(0.5);
          }
          if (x === this.labyrinth.end.x && y === this.labyrinth.end.y) {
            this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, 'END', {
              fontSize: '12px',
              color: '#ff6b6b'
            }).setOrigin(0.5);
          }

          // Mark puzzle tiles
          if (tile.type === 'puzzle') {
            this.add.circle(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              15,
              0xffcc00
            ).setAlpha(0.7);
            this.add.text(posX + this.tileSize / 2, posY + this.tileSize / 2, '?', {
              fontSize: '20px',
              color: '#ffffff',
              fontStyle: 'bold'
            }).setOrigin(0.5);
          }

          // Mark intersection tiles
          if (tile.type === 'intersection') {
            this.add.star(
              posX + this.tileSize / 2,
              posY + this.tileSize / 2,
              4, 10, 20,
              0xff6b9d
            );
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
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'YOU WIN!', {
        fontSize: '48px',
        fontFamily: 'Arial Black',
        color: '#4ecca3',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(1000);

      this.time.delayedCall(2000, () => {
        this.scene.start('MenuScene');
      });
    }
  }
}
