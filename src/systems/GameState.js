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
}
