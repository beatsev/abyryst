/**
 * Game State Management
 * Centralized state for score, timer, hints, and puzzle tracking
 */

export default class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Reset game state to initial values
   */
  reset() {
    this.score = 0;
    this.startTime = Date.now();
    this.hintsRemaining = 3;
    this.currentLineage = 'A'; // Hero's Quest by default
    this.visitedTiles = [];
    this.solvedPuzzles = [];

    // NEW: Intersection effect tracking
    this.difficultyMultiplier = 1.0; // 1.0 = normal, <1.0 = easier, >1.0 = harder
    this.storyTone = 'neutral'; // 'neutral', 'dark', or 'bright'
    this.intersectionChoices = []; // Track choices: [{intersectionId, choiceId, effect}]

    // Campaign mode tracking
    this.currentLevel = 1;
    this.livesRemaining = 3;
    this.levelStartTime = Date.now();
    this.levelStats = {
      puzzlesSolved: 0,
      puzzlesFailed: 0,
      timeElapsed: 0,
      hintsUsed: 0,
      levelScore: 0
    };
    this.campaignStats = {
      totalScore: 0,
      levelsCompleted: 0,
      totalPuzzlesSolved: 0,
      totalPuzzlesFailed: 0,
      totalTime: 0
    };
    this.isCampaignMode = true;
  }

  /**
   * Get elapsed time in seconds
   * @returns {number} Elapsed seconds
   */
  getElapsedTime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Format elapsed time as MM:SS
   * @returns {string} Formatted time string
   */
  formatTime() {
    const seconds = this.getElapsedTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Add points to score
   * @param {number} points - Points to add
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Use a hint (decrements hint count)
   * @returns {boolean} True if hint was available
   */
  useHint() {
    if (this.hintsRemaining > 0) {
      this.hintsRemaining--;
      return true;
    }
    return false;
  }

  /**
   * Mark a tile as visited
   * @param {number} x - Tile x coordinate
   * @param {number} y - Tile y coordinate
   */
  markTileVisited(x, y) {
    const key = `${x},${y}`;
    if (!this.visitedTiles.includes(key)) {
      this.visitedTiles.push(key);
    }
  }

  /**
   * Mark a puzzle as solved and add score
   * @param {string} puzzleId - Puzzle identifier
   */
  markPuzzleSolved(puzzleId) {
    if (!this.solvedPuzzles.includes(puzzleId)) {
      this.solvedPuzzles.push(puzzleId);
      this.addScore(100); // Base score per puzzle
    }
  }

  /**
   * Switch narrative lineage
   * @param {string} lineage - New lineage ('A' or 'B')
   */
  switchLineage(lineage) {
    this.currentLineage = lineage;
  }

  /**
   * Adjust difficulty multiplier (for intersection effects)
   * @param {number} delta - Change in difficulty (-0.3 to +0.4)
   */
  adjustDifficulty(delta) {
    this.difficultyMultiplier = Math.max(0.5, Math.min(2.0, this.difficultyMultiplier + delta));
  }

  /**
   * Set story tone (for intersection effects)
   * @param {string} tone - 'dark', 'bright', or 'neutral'
   */
  setStoryTone(tone) {
    this.storyTone = tone;
  }

  /**
   * Add hint (can exceed initial limit via intersection choices)
   */
  addHint() {
    this.hintsRemaining++;
  }

  /**
   * Remove hint (can go to zero)
   */
  removeHint() {
    this.hintsRemaining = Math.max(0, this.hintsRemaining - 1);
  }

  /**
   * Record intersection choice
   * @param {string} intersectionId - Unique ID for this intersection
   * @param {Object} choice - Choice object with id and effect
   */
  recordIntersectionChoice(intersectionId, choice) {
    this.intersectionChoices.push({
      intersectionId,
      choiceId: choice.id,
      effect: choice.effect,
      timestamp: Date.now()
    });
  }

  /**
   * Decrement life on puzzle failure
   * @returns {boolean} True if game over (lives = 0)
   */
  loseLife() {
    this.livesRemaining = Math.max(0, this.livesRemaining - 1);
    this.levelStats.puzzlesFailed++;
    return this.livesRemaining === 0;
  }

  /**
   * Record successful puzzle solve for level stats
   */
  recordPuzzleSuccess() {
    this.levelStats.puzzlesSolved++;
  }

  /**
   * Advance to next level
   */
  advanceLevel() {
    this.currentLevel++;
    this.levelStartTime = Date.now();
    this.levelStats = {
      puzzlesSolved: 0,
      puzzlesFailed: 0,
      timeElapsed: 0,
      hintsUsed: 0,
      levelScore: 0
    };
  }

  /**
   * Calculate level completion grade (S/A/B/C/D)
   * @returns {string} Grade letter
   */
  calculateGrade() {
    const { puzzlesFailed, hintsUsed, timeElapsed } = this.levelStats;

    // Perfect: All puzzles, no fails, no hints, fast time
    if (puzzlesFailed === 0 && hintsUsed === 0 && timeElapsed < 600) return 'S';

    // Great: Few fails, minimal hints
    if (puzzlesFailed <= 1 && hintsUsed <= 2) return 'A';

    // Good: Some mistakes
    if (puzzlesFailed <= 3 && hintsUsed <= 5) return 'B';

    // Okay: Many mistakes
    if (puzzlesFailed <= 5) return 'C';

    // Poor: Struggling
    return 'D';
  }

  /**
   * Get elapsed time for current level only
   * @returns {number} Elapsed seconds
   */
  getLevelElapsedTime() {
    return Math.floor((Date.now() - this.levelStartTime) / 1000);
  }

  /**
   * Format level time as MM:SS
   * @returns {string} Formatted time string
   */
  formatLevelTime() {
    const seconds = this.getLevelElapsedTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
