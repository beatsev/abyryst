import puzzlesData from '../data/puzzles.json';

/**
 * PuzzleManager
 * Manages puzzle data, validation, and hint system
 */
export default class PuzzleManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.puzzles = {};

    // Index puzzles by ID for quick lookup
    puzzlesData.riddles.forEach(riddle => {
      this.puzzles[riddle.id] = riddle;
    });
  }

  /**
   * Get puzzle data by ID
   * @param {string} puzzleId - The puzzle ID (e.g., 'riddle_1')
   * @returns {Object|null} Puzzle object or null if not found
   */
  getPuzzle(puzzleId) {
    return this.puzzles[puzzleId] || null;
  }

  /**
   * Validate user's answer against the correct answer
   * @param {string} puzzleId - The puzzle ID
   * @param {string} userAnswer - The user's submitted answer
   * @returns {boolean} True if answer is correct
   */
  validateAnswer(puzzleId, userAnswer) {
    const puzzle = this.getPuzzle(puzzleId);
    if (!puzzle) return false;

    // Normalize both answers: trim whitespace, convert to lowercase
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = puzzle.answer.trim().toLowerCase();

    return normalizedUser === normalizedCorrect;
  }

  /**
   * Get next hint for a puzzle
   * Uses gameState.hintsRemaining to track hint usage
   * @param {string} puzzleId - The puzzle ID
   * @param {number} hintIndex - Which hint to retrieve (0-2)
   * @returns {string|null} Hint text or null if unavailable
   */
  getHint(puzzleId, hintIndex) {
    if (this.gameState.hintsRemaining <= 0) {
      return null; // No hints remaining
    }

    const puzzle = this.getPuzzle(puzzleId);
    if (!puzzle || !puzzle.hints || hintIndex >= puzzle.hints.length) {
      return null;
    }

    return puzzle.hints[hintIndex];
  }

  /**
   * Use a hint (decrements global hint counter)
   * @returns {boolean} True if hint was used successfully
   */
  useHint() {
    return this.gameState.useHint();
  }

  /**
   * Get total number of puzzles
   * @returns {number} Total puzzle count
   */
  getTotalPuzzles() {
    return Object.keys(this.puzzles).length;
  }

  /**
   * Check if puzzle has been solved
   * @param {string} puzzleId - The puzzle ID
   * @returns {boolean} True if already solved
   */
  isSolved(puzzleId) {
    return this.gameState.solvedPuzzles.includes(puzzleId);
  }
}
