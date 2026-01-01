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
}
