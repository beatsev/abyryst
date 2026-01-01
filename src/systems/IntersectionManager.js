/**
 * IntersectionManager
 * Manages intersection effects, choices, and cryptic descriptions
 */

export default class IntersectionManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.intersectionCounter = 0;

    // Define all effect types with cryptic choices
    this.effectTypes = [
      {
        type: 'hint_management',
        choices: [
          {
            id: 'gain_hint',
            cryptic: 'Touch the glowing rune that whispers of ancient wisdom',
            effect: { type: 'hints', value: +1 },
            feedbackPositive: 'A warm light fills your mind. You feel more insightful.',
            feedbackNegative: null
          },
          {
            id: 'lose_hint',
            cryptic: 'Embrace the shadow that promises hidden shortcuts',
            effect: { type: 'hints', value: -1 },
            feedbackPositive: null,
            feedbackNegative: 'The shadow consumes a fragment of your knowledge.'
          }
        ]
      },
      {
        type: 'difficulty_adjustment',
        choices: [
          {
            id: 'easier',
            cryptic: 'Follow the path lined with soft, luminous moss',
            effect: { type: 'difficulty', value: -0.3 },
            feedbackPositive: 'The air feels lighter. Challenges ahead seem less daunting.',
            feedbackNegative: null
          },
          {
            id: 'harder',
            cryptic: 'Ascend the stairs carved from obsidian stone',
            effect: { type: 'difficulty', value: +0.4 },
            feedbackPositive: null,
            feedbackNegative: 'The atmosphere grows heavy. Greater trials await.'
          }
        ]
      },
      {
        type: 'map_generation',
        choices: [
          {
            id: 'new_labyrinth',
            cryptic: 'Step through the shimmering portal to unknown halls',
            effect: { type: 'regenerate_map', value: true },
            feedbackPositive: 'Reality shifts. The labyrinth reshapes itself around you.',
            feedbackNegative: null
          },
          {
            id: 'continue_current',
            cryptic: 'Trust the familiar corridors you have already walked',
            effect: { type: 'regenerate_map', value: false },
            feedbackPositive: 'The path ahead remains steady and known.',
            feedbackNegative: null
          }
        ]
      },
      {
        type: 'story_tone',
        choices: [
          {
            id: 'dark_tone',
            cryptic: 'Drink from the chalice filled with midnight ink',
            effect: { type: 'story_tone', value: 'dark' },
            feedbackPositive: null,
            feedbackNegative: 'Darkness seeps into the edges of your vision. Hope feels distant.'
          },
          {
            id: 'bright_tone',
            cryptic: 'Kindle the torch that burns with silver flame',
            effect: { type: 'story_tone', value: 'bright' },
            feedbackPositive: 'Light blooms in your heart. The future feels promising.',
            feedbackNegative: null
          }
        ]
      }
    ];
  }

  /**
   * Generate random intersection choices
   * @returns {Object} Choice data for intersection
   */
  generateIntersectionChoices() {
    this.intersectionCounter++;

    // Pick random effect type
    const effectType = this.effectTypes[Math.floor(Math.random() * this.effectTypes.length)];

    return {
      intersectionId: `intersection_${this.intersectionCounter}`,
      effectType: effectType.type,
      choices: effectType.choices
    };
  }

  /**
   * Apply choice effect to game state
   * @param {Object} choice - The chosen option
   * @param {Object} gameScene - Reference to GameScene for map regeneration
   * @returns {string} Feedback message to show player
   */
  applyChoiceEffect(choice, gameScene) {
    const effect = choice.effect;
    let feedback = '';

    switch (effect.type) {
      case 'hints':
        if (effect.value > 0) {
          this.gameState.addHint();
          feedback = choice.feedbackPositive;
        } else {
          this.gameState.removeHint();
          feedback = choice.feedbackNegative;
        }
        break;

      case 'difficulty':
        this.gameState.adjustDifficulty(effect.value);
        feedback = effect.value < 0 ? choice.feedbackPositive : choice.feedbackNegative;
        break;

      case 'regenerate_map':
        if (effect.value === true) {
          // Trigger map regeneration
          gameScene.regenerateLabyrinth();
          feedback = choice.feedbackPositive;
        } else {
          feedback = choice.feedbackPositive;
        }
        break;

      case 'story_tone':
        this.gameState.setStoryTone(effect.value);
        feedback = effect.value === 'bright' ? choice.feedbackPositive : choice.feedbackNegative;
        break;
    }

    return feedback;
  }
}
