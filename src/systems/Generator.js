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

    // Guarantee at least one puzzle on critical path
    this.guaranteePuzzleOnPath(grid, width, height, start, end);

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
   * Find shortest path from start to end using BFS
   * @param {Array} grid - The maze grid
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @returns {Array} Array of {x, y} positions representing shortest path
   */
  static findShortestPath(grid, start, end) {
    const queue = [{ pos: start, path: [start] }];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const { pos, path } = queue.shift();

      // Check if we reached the end
      if (pos.x === end.x && pos.y === end.y) {
        return path;
      }

      // Explore neighbors based on connections
      const tile = grid[pos.y][pos.x];
      const neighbors = [];

      if (tile.connections.N && pos.y > 0) {
        neighbors.push({ x: pos.x, y: pos.y - 1 });
      }
      if (tile.connections.S && pos.y < grid.length - 1) {
        neighbors.push({ x: pos.x, y: pos.y + 1 });
      }
      if (tile.connections.E && pos.x < grid[0].length - 1) {
        neighbors.push({ x: pos.x + 1, y: pos.y });
      }
      if (tile.connections.W && pos.x > 0) {
        neighbors.push({ x: pos.x - 1, y: pos.y });
      }

      for (const next of neighbors) {
        const key = `${next.x},${next.y}`;
        if (!visited.has(key) && grid[next.y][next.x].type !== 'empty') {
          visited.add(key);
          queue.push({
            pos: next,
            path: [...path, next]
          });
        }
      }
    }

    // Should never happen with valid maze, but return empty array as fallback
    console.warn('No path found from start to end - maze generation error');
    return [];
  }

  /**
   * Ensure at least one puzzle exists on the critical path
   * @param {Array} grid - The maze grid
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {Object} start - Start position
   * @param {Object} end - End position
   */
  static guaranteePuzzleOnPath(grid, width, height, start, end) {
    // Find critical path using BFS
    const criticalPath = this.findShortestPath(grid, start, end);

    if (criticalPath.length === 0) {
      console.warn('No path found from start to end - cannot guarantee puzzle');
      return;
    }

    // Check if any tile on critical path is already a puzzle
    const hasPuzzleOnPath = criticalPath.some(pos =>
      grid[pos.y][pos.x].type === 'puzzle'
    );

    if (hasPuzzleOnPath) {
      // Already have at least one puzzle on critical path
      return;
    }

    // No puzzle on path - convert one random path tile on critical path to puzzle
    // Exclude start and end tiles
    const eligibleTiles = criticalPath.filter(pos =>
      !(pos.x === start.x && pos.y === start.y) &&
      !(pos.x === end.x && pos.y === end.y) &&
      grid[pos.y][pos.x].type === 'path'
    );

    if (eligibleTiles.length === 0) {
      console.warn('No eligible tiles on critical path to convert to puzzle');
      return;
    }

    // Choose random tile from eligible tiles
    const randomIndex = Math.floor(Math.random() * eligibleTiles.length);
    const chosenTile = eligibleTiles[randomIndex];

    // Convert to puzzle
    grid[chosenTile.y][chosenTile.x].type = 'puzzle';
    grid[chosenTile.y][chosenTile.x].puzzleId = this.randomPuzzleId();
  }

  /**
   * Generate a random puzzle ID from pool of 20 riddles
   * @param {number} difficultyMult - Difficulty multiplier (default 1.0)
   * @returns {string} Random puzzle ID
   */
  static randomPuzzleId(difficultyMult = 1.0) {
    let pool = [];

    if (difficultyMult < 0.8) {
      // Easier: favor easy puzzles
      pool = [
        'riddle_1', 'riddle_2', 'riddle_7', 'riddle_8', 'riddle_9',
        'riddle_10', 'riddle_11', 'riddle_3', 'riddle_4'
      ];
    } else if (difficultyMult > 1.2) {
      // Harder: favor hard puzzles
      pool = [
        'riddle_5', 'riddle_6', 'riddle_16', 'riddle_18', 'riddle_19',
        'riddle_20', 'riddle_12', 'riddle_13', 'riddle_14', 'riddle_15'
      ];
    } else {
      // Normal: all puzzles
      pool = [
        'riddle_1', 'riddle_2', 'riddle_3', 'riddle_4', 'riddle_5',
        'riddle_6', 'riddle_7', 'riddle_8', 'riddle_9', 'riddle_10',
        'riddle_11', 'riddle_12', 'riddle_13', 'riddle_14', 'riddle_15',
        'riddle_16', 'riddle_17', 'riddle_18', 'riddle_19', 'riddle_20'
      ];
    }

    return pool[Math.floor(Math.random() * pool.length)];
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
