import Phaser from 'phaser';

/**
 * RiddlePuzzleScene
 * Displays riddle puzzles with HTML input field for mobile-friendly text entry
 */
export default class RiddlePuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RiddlePuzzleScene' });
  }

  init(data) {
    this.puzzleId = data.puzzleId;
    this.playerPos = data.playerPos;
    this.puzzleManager = data.puzzleManager;
    this.gameState = data.gameState;
    this.soundManager = data.soundManager;

    this.currentHintIndex = 0;
    this.hintsShown = [];
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dim background overlay
    this.add.rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0, 0)
      .setAlpha(0.9)
      .setInteractive();

    // Get puzzle data
    const puzzle = this.puzzleManager.getPuzzle(this.puzzleId);
    if (!puzzle) {
      console.error(`Puzzle not found: ${this.puzzleId}`);
      this.returnToGame();
      return;
    }

    // Puzzle card background (increased height for mobile, reduced margins)
    const cardWidth = Math.min(700, width - 40);
    const cardHeight = Math.min(600, height - 60); // Increased from 500 to 600, reduced margin
    this.add.rectangle(width / 2, height / 2, cardWidth, cardHeight, 0x16213e)
      .setStrokeStyle(3, 0x4ecca3);

    // Calculate card boundaries for relative layout
    const cardTop = height / 2 - cardHeight / 2;
    const cardBottom = height / 2 + cardHeight / 2;

    // Layout spacing constants (optimized for mobile readability)
    const spacing = {
      small: 12,   // Between title and badge
      medium: 30,  // Between input, hints, feedback
      large: 45    // Between major sections (question and input)
    };

    // Position elements with relative layout from top to bottom
    let currentY = cardTop + 20; // Reduced top padding from 30 to 20

    // Title
    this.add.text(width / 2, currentY, 'Riddle Puzzle', {
      fontSize: '24px',
      color: '#4ecca3',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    currentY += 30 + spacing.small;

    // Difficulty badge
    const difficultyColor = puzzle.difficulty === 'easy' ? '#4ecca3' :
                           puzzle.difficulty === 'medium' ? '#ffcc00' : '#ff6b6b';
    this.add.text(width / 2, currentY, puzzle.difficulty.toUpperCase(), {
      fontSize: '14px',
      color: difficultyColor,
      backgroundColor: '#0e1628',
      padding: { x: 10, y: 4 }
    }).setOrigin(0.5);
    currentY += 20 + spacing.large;

    // Question text (position relative to difficulty badge)
    const questionText = this.add.text(width / 2, currentY, puzzle.question, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: cardWidth - 60 }
    }).setOrigin(0.5);
    // Use actual text bounds to calculate next position
    currentY += Math.max(questionText.height, 40) + spacing.large;

    // Create HTML input field (positioned relative to question)
    const inputHeight = 40;
    this.createInputField(width / 2, currentY + inputHeight / 2, cardWidth - 100);
    currentY += inputHeight + spacing.medium;

    // Hint section (positioned relative to input, will expand when hints shown)
    this.hintText = this.add.text(width / 2, currentY, '', {
      fontSize: '14px',
      color: '#ffcc00',
      align: 'center',
      wordWrap: { width: cardWidth - 80 },
      fontStyle: 'italic'
    }).setOrigin(0.5, 0); // Origin at top to expand downward
    currentY += spacing.medium;

    // Feedback text (positioned relative to hints)
    this.feedbackText = this.add.text(width / 2, currentY, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Buttons positioned from bottom up (relative to card bottom)
    const actionButtonY = cardBottom - 100;
    const closeButtonY = cardBottom - 40;

    // Hint button
    this.hintButton = this.add.text(width / 2 - 120, actionButtonY, `💡 Hint (${this.gameState.hintsRemaining})`, {
      fontSize: '18px',
      backgroundColor: '#ffcc00',
      color: '#000000',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.hintButton.on('pointerover', () => {
      this.hintButton.setBackgroundColor('#ffdd44');
    });
    this.hintButton.on('pointerout', () => {
      this.hintButton.setBackgroundColor('#ffcc00');
    });
    this.hintButton.on('pointerdown', () => this.showHint());

    // Submit button
    this.submitButton = this.add.text(width / 2 + 120, actionButtonY, 'Submit', {
      fontSize: '18px',
      backgroundColor: '#4ecca3',
      color: '#000000',
      padding: { x: 30, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.submitButton.on('pointerover', () => {
      this.submitButton.setBackgroundColor('#5eddbb');
    });
    this.submitButton.on('pointerout', () => {
      this.submitButton.setBackgroundColor('#4ecca3');
    });
    this.submitButton.on('pointerdown', () => this.checkAnswer());

    // Close button (in case user wants to skip)
    this.closeButton = this.add.text(width / 2, closeButtonY, 'Close (Skip)', {
      fontSize: '14px',
      color: '#999999',
      padding: { x: 15, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.closeButton.on('pointerover', () => {
      this.closeButton.setColor('#ffffff');
    });
    this.closeButton.on('pointerout', () => {
      this.closeButton.setColor('#999999');
    });
    this.closeButton.on('pointerdown', () => this.returnToGame());

    // Keyboard support: Enter to submit
    this.input.keyboard.on('keydown-ENTER', () => this.checkAnswer());
  }

  /**
   * Create HTML input field for mobile-friendly text entry
   */
  createInputField(x, y, width) {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Type your answer...';
    inputElement.style.position = 'absolute';

    // Get canvas position and scale to properly position input
    const canvas = this.game.canvas;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / canvas.width;
    const scaleY = canvasRect.height / canvas.height;

    // Calculate scaled position relative to viewport
    const scaledX = canvasRect.left + (x * scaleX);
    const scaledY = canvasRect.top + (y * scaleY);
    const scaledWidth = width * scaleX;

    inputElement.style.left = `${scaledX - (scaledWidth / 2)}px`;
    inputElement.style.top = `${scaledY - 20}px`;
    inputElement.style.width = `${scaledWidth}px`;
    inputElement.style.height = '40px';
    inputElement.style.fontSize = '18px';
    inputElement.style.padding = '8px';
    inputElement.style.border = '2px solid #4ecca3';
    inputElement.style.borderRadius = '4px';
    inputElement.style.backgroundColor = '#0e1628';
    inputElement.style.color = '#ffffff';
    inputElement.style.textAlign = 'center';
    inputElement.style.outline = 'none';
    inputElement.style.zIndex = '1000';

    // Add to body instead of canvas parent for better positioning
    document.body.appendChild(inputElement);
    this.inputElement = inputElement;

    // Focus on input
    setTimeout(() => inputElement.focus(), 100);
  }

  /**
   * Show next hint
   */
  showHint() {
    if (this.currentHintIndex >= 3) {
      this.hintText.setText('No more hints available!');
      return;
    }

    if (this.gameState.hintsRemaining <= 0) {
      this.hintText.setText('No hints remaining! (Used all 3)');
      return;
    }

    const hint = this.puzzleManager.getHint(this.puzzleId, this.currentHintIndex);
    if (hint) {
      // Play hint sound
      this.soundManager.playHint();

      this.gameState.useHint();
      this.hintsShown.push(hint);
      this.currentHintIndex++;

      // Display all hints shown so far
      const hintDisplay = this.hintsShown.map((h, i) => `💡 Hint ${i + 1}: ${h}`).join('\n');
      this.hintText.setText(hintDisplay);

      // Update hint button counter
      this.hintButton.setText(`💡 Hint (${this.gameState.hintsRemaining})`);
    }
  }

  /**
   * Check user's answer
   */
  checkAnswer() {
    if (!this.inputElement) return;

    const userAnswer = this.inputElement.value;
    if (!userAnswer || userAnswer.trim() === '') {
      this.feedbackText.setText('Please enter an answer!').setColor('#ff6b6b');
      return;
    }

    const isCorrect = this.puzzleManager.validateAnswer(this.puzzleId, userAnswer);

    if (isCorrect) {
      // Play solve sound
      this.soundManager.playSolve();

      // Correct answer!
      this.feedbackText.setText('✓ Correct!').setColor('#4ecca3');

      // Award points
      this.gameState.markPuzzleSolved(this.puzzleId);

      // Add bonus points for unused hints on this puzzle
      const hintsUsedOnThisPuzzle = this.currentHintIndex;
      const hintBonus = (3 - hintsUsedOnThisPuzzle) * 20;
      if (hintBonus > 0) {
        this.gameState.addScore(hintBonus);
        this.feedbackText.setText(`✓ Correct! +${hintBonus} hint bonus!`);
      }

      // Disable input and buttons
      this.inputElement.disabled = true;
      this.submitButton.setAlpha(0.5).disableInteractive();
      this.hintButton.setAlpha(0.5).disableInteractive();

      // Return to game after short delay
      this.time.delayedCall(1500, () => this.returnToGame());
    } else {
      // Play error sound
      this.soundManager.playError();

      // Incorrect answer
      this.feedbackText.setText('✗ Incorrect. Try again!').setColor('#ff6b6b');
      this.inputElement.value = '';
      this.inputElement.focus();
    }
  }

  /**
   * Return to GameScene
   */
  returnToGame() {
    // Remove HTML input from DOM
    if (this.inputElement && this.inputElement.parentElement) {
      this.inputElement.parentElement.removeChild(this.inputElement);
      this.inputElement = null;
    }

    // Remove keyboard listener
    this.input.keyboard.off('keydown-ENTER');

    // Stop this scene and resume GameScene
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  shutdown() {
    // Cleanup when scene is shut down
    if (this.inputElement && this.inputElement.parentElement) {
      this.inputElement.parentElement.removeChild(this.inputElement);
      this.inputElement = null;
    }
  }
}
