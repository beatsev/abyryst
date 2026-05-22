import GameState from '../src/systems/GameState.js';
import fs from 'node:fs';

const gameState = new GameState();
const puzzlesData = JSON.parse(fs.readFileSync(new URL('../src/data/puzzles.json', import.meta.url), 'utf8'));
const puzzle = puzzlesData.riddles.find(riddle => riddle.id === 'riddle_1');

gameState.hintsRemaining = 1;

const finalAvailableHint = gameState.hintsRemaining > 0 ? puzzle?.hints?.[0] : null;
if (!finalAvailableHint) {
  console.error('Expected final available hint to be returned before decrementing hint count.');
  process.exit(1);
}

if (!gameState.useHint()) {
  console.error('Expected final available hint to be consumed successfully.');
  process.exit(1);
}

if (gameState.hintsRemaining !== 0) {
  console.error(`Expected hintsRemaining to be 0, got ${gameState.hintsRemaining}.`);
  process.exit(1);
}

if (gameState.levelStats.hintsUsed !== 1) {
  console.error(`Expected levelStats.hintsUsed to be 1, got ${gameState.levelStats.hintsUsed}.`);
  process.exit(1);
}

const unavailableHint = gameState.hintsRemaining > 0 ? puzzle?.hints?.[1] : null;
if (unavailableHint !== null) {
  console.error('Expected no further hint to be returned after all hints are consumed.');
  process.exit(1);
}

console.log('Hint validation passed.');
