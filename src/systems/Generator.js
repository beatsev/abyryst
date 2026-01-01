/**
 * Labyrinth Generator
 * Creates procedurally generated labyrinths using recursive backtracking
 */

export default class LabyrinthGenerator {
  /**
   * Generate a labyrinth
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @returns {Object} Labyrinth data structure
   */
  static generate(width, height) {
    // Initialize empty grid
    const grid = Array(height).fill(null).map(() =>
      Array(width).fill(null).map(() => ({
        type: 'empty',
        connections: { N: false, S: false, E: false, W: false },
        visited: false
      }))
    );

    // Set start (top-left) and end (bottom-right)
    const start = { x: 0, y: 0 };
    const end = { x: width - 1, y: height - 1 };

    // Generate maze using recursive backtracking
    const stack = [start];
    grid[start.y][start.x].type = 'path';
    grid[start.y][start.x].visited = true;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);

      if (neighbors.length > 0) {
        // Choose random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Mark as path
        grid[next.y][next.x].type = 'path';
        grid[next.y][next.x].visited = true;

        // Connect current to next
        this.connect(grid, current, next);

        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Post-process tiles to assign puzzle and intersection types
    this.postProcessTiles(grid, width, height, start, end);

    return {
      width,
      height,
      grid,
      start,
      end,
      seed: Date.now()
    };
  }

  /**
   * Post-process tiles to assign puzzle and intersection types
   * @param {Array} grid - The generated grid
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {Object} start - Start position
   * @param {Object} end - End position
   */
  static postProcessTiles(grid, width, height, start, end) {
    // Collect all path tiles (excluding start and end)
    const pathTiles = [];

    grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === 'path' &&
            !(x === start.x && y === start.y) &&
            !(x === end.x && y === end.y)) {
          pathTiles.push({ x, y, tile });
        }
      });
    });

    // Shuffle path tiles for random assignment
    const shuffled = this.shuffleArray(pathTiles);

    // Assign 6 puzzle tiles (or fewer if not enough path tiles)
    const puzzleCount = Math.min(6, Math.floor(shuffled.length * 0.4));
    for (let i = 0; i < puzzleCount; i++) {
      const pos = shuffled[i];
      grid[pos.y][pos.x].type = 'puzzle';
      grid[pos.y][pos.x].puzzleId = this.randomPuzzleId();
    }

    // Assign 2 intersection tiles from remaining tiles
    const remaining = shuffled.slice(puzzleCount);
    const intersectionCount = Math.min(2, remaining.length);
    for (let i = 0; i < intersectionCount; i++) {
      const pos = remaining[i];
      grid[pos.y][pos.x].type = 'intersection';
      grid[pos.y][pos.x].storyBranch = Math.random() > 0.5 ? 'A' : 'B';
    }
  }

  /**
   * Generate a random puzzle ID
   * @returns {string} Random puzzle ID
   */
  static randomPuzzleId() {
    const riddles = ['riddle_1', 'riddle_2', 'riddle_3', 'riddle_4', 'riddle_5', 'riddle_6'];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled copy of array
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get unvisited neighbors of a cell
   */
  static getUnvisitedNeighbors(pos, grid, width, height) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // N
      { x: 0, y: 1 },  // S
      { x: 1, y: 0 },  // E
      { x: -1, y: 0 }  // W
    ];

    directions.forEach(dir => {
      const newX = pos.x + dir.x;
      const newY = pos.y + dir.y;

      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        if (!grid[newY][newX].visited) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    });

    return neighbors;
  }

  /**
   * Connect two adjacent cells
   */
  static connect(grid, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dx === 1) {
      grid[from.y][from.x].connections.E = true;
      grid[to.y][to.x].connections.W = true;
    } else if (dx === -1) {
      grid[from.y][from.x].connections.W = true;
      grid[to.y][to.x].connections.E = true;
    } else if (dy === 1) {
      grid[from.y][from.x].connections.S = true;
      grid[to.y][to.x].connections.N = true;
    } else if (dy === -1) {
      grid[from.y][from.x].connections.N = true;
      grid[to.y][to.x].connections.S = true;
    }
  }
}
