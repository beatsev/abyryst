/**
 * Story Manager
 * Manages story progression and lineage selection
 */

import storiesData from '../data/stories.json';

export default class StoryManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.stories = storiesData.lineages;
    this.currentCardIndex = { A: 0, B: 0 };
  }

  /**
   * Get the next story card for a given trigger type
   * @param {string} triggerType - Type of trigger (start, puzzle, intersection, end)
   * @returns {Object|null} Story card or null if none available
   */
  getNextStory(triggerType) {
    const lineage = this.gameState.currentLineage;
    const cards = this.stories[lineage].cards.filter(c => c.triggerType === triggerType);

    if (cards.length === 0) return null;

    // Cycle through available cards of this type
    const index = this.currentCardIndex[lineage] % cards.length;
    this.currentCardIndex[lineage]++;

    return cards[index];
  }

  /**
   * Switch to a different narrative lineage
   * @param {string} newLineage - New lineage ('A' or 'B')
   */
  switchLineage(newLineage) {
    this.gameState.switchLineage(newLineage);
  }

  /**
   * Get the name of the current lineage
   * @returns {string} Lineage name
   */
  getCurrentLineageName() {
    return this.stories[this.gameState.currentLineage].name;
  }
}
