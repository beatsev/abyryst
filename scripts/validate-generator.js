import LabyrinthGenerator from '../src/systems/Generator.js';
import fs from 'node:fs';

const campaignData = JSON.parse(fs.readFileSync(new URL('../src/data/campaignLevels.json', import.meta.url), 'utf8'));

const ITERATIONS_PER_SIZE = 200;
const failures = [];

function key(pos) {
  return `${pos.x},${pos.y}`;
}

function isEndpoint(pos, labyrinth) {
  return key(pos) === key(labyrinth.start) || key(pos) === key(labyrinth.end);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function validateLabyrinth(labyrinth, label) {
  const { grid, start, end } = labyrinth;
  const startTile = grid[start.y][start.x];
  const endTile = grid[end.y][end.x];

  assert(startTile.type !== 'puzzle', `${label}: start tile is a puzzle`);
  assert(endTile.type !== 'puzzle', `${label}: end tile is a puzzle`);

  const criticalPath = LabyrinthGenerator.findShortestPath(grid, start, end);
  assert(criticalPath.length > 0, `${label}: no critical path found`);

  const hasPuzzleOnCriticalPath = criticalPath.some(pos => {
    return !isEndpoint(pos, labyrinth) && grid[pos.y][pos.x].type === 'puzzle';
  });
  assert(hasPuzzleOnCriticalPath, `${label}: critical path has no non-endpoint puzzle`);

  grid.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile.type !== 'intersection') return;

      assert(
        !isEndpoint({ x, y }, labyrinth),
        `${label}: endpoint marked as intersection at ${x},${y}`
      );
      assert(
        LabyrinthGenerator.isChoiceTile(tile),
        `${label}: non-choice tile marked as intersection at ${x},${y} with ${LabyrinthGenerator.getConnectionCount(tile)} connections`
      );
    });
  });
}

const uniqueSizes = new Map();
for (const level of campaignData.levels) {
  const { width, height } = level.gridSize;
  uniqueSizes.set(`${width}x${height}`, { width, height });
}

for (const [sizeLabel, size] of uniqueSizes) {
  for (let i = 0; i < ITERATIONS_PER_SIZE; i++) {
    const labyrinth = LabyrinthGenerator.generate(size.width, size.height);
    validateLabyrinth(labyrinth, `${sizeLabel} #${i + 1}`);
  }
}

if (failures.length > 0) {
  console.error(`Generator validation failed with ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 25)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 25) {
    console.error(`...and ${failures.length - 25} more`);
  }
  process.exit(1);
}

console.log(`Generator validation passed for ${uniqueSizes.size * ITERATIONS_PER_SIZE} generated labyrinths.`);
