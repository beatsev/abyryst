/**
 * Campaign Manager
 * Manages campaign level configurations and progression
 */

import campaignData from '../data/campaignLevels.json';

export default class CampaignManager {
  constructor() {
    this.levels = campaignData.levels;
  }

  /**
   * Get configuration for a specific level
   * @param {number} levelNumber - Level number (1-10)
   * @returns {Object|null} Level config or null if invalid
   */
  getLevelConfig(levelNumber) {
    return this.levels.find(l => l.level === levelNumber) || null;
  }

  /**
   * Get total number of levels in campaign
   * @returns {number} Total levels
   */
  getTotalLevels() {
    return this.levels.length;
  }

  /**
   * Check if level number is valid
   * @param {number} levelNumber - Level to check
   * @returns {boolean} True if valid level
   */
  isValidLevel(levelNumber) {
    return levelNumber >= 1 && levelNumber <= this.getTotalLevels();
  }
}
