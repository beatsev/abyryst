# Abyryst - Labyrinth Mystery

A procedurally generated labyrinth mystery game built as a Progressive Web App (PWA) using Phaser 3 and Vite.

## Overview

Abyryst is an infinite-replay puzzle adventure where players navigate procedurally generated 5×5 labyrinths, solve riddles, and uncover dual branching storylines. Built with modern web technologies for instant cross-platform deployment.

## Features

### ✅ Core Gameplay
- **Procedurally Generated Labyrinths**: 5×5 mazes with unique layouts every playthrough
- **20 Riddle Puzzles**: Varied difficulty levels (easy/medium/hard) with progressive hints
- **Dual Story System**: Two narrative lineages (Hero's Quest / Villain's Plot)
- **Story Branching**: Switch lineages at intersection tiles for replay value
- **Scoring System**: Points for puzzles + bonus for unused hints
- **Timer & Statistics**: Track completion time and score

### 🎮 Controls
- **Mobile-First**: Touch D-pad buttons (▲▼◄►) at bottom-center
- **Swipe Gestures**: 50px minimum swipe distance for directional movement
- **Keyboard Support**: Arrow keys for desktop users
- **Sound Toggle**: Click 🔊/🔇 button in top-right to control audio

### 🎨 Polish
- **Progressive Web App**: Install on any device, offline-first caching
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Persistent HUD**: Score, timer, and hint counter always visible
- **Sound System**: Audio feedback ready (awaiting sound assets)
- **Scene Management**: Smooth transitions with pause/resume

## Tech Stack

- **Frontend**: Phaser 3.90.0 (game engine) + Vite 7.3.0 (build tool)
- **PWA**: vite-plugin-pwa 1.2.0 with Workbox
- **Language**: JavaScript ES6+ modules (no framework)
- **Architecture**: Scene-based state management, modular systems
- **Deployment**: Ready for Vercel/Netlify/GitHub Pages

## Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server (local only)
npm run dev

# Run development server with network access (for mobile testing)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
abyryst/
├── src/
│   ├── scenes/          # Phaser scenes
│   │   ├── MenuScene.js       # Title screen
│   │   ├── GameScene.js       # Main gameplay
│   │   ├── UIOverlay.js       # Persistent HUD
│   │   ├── StoryScene.js      # Story card modal
│   │   └── RiddlePuzzleScene.js # Puzzle interface
│   ├── systems/         # Game systems
│   │   ├── Generator.js       # Labyrinth generation
│   │   ├── GameState.js       # State management
│   │   ├── StoryManager.js    # Story progression
│   │   ├── PuzzleManager.js   # Puzzle validation
│   │   └── SoundManager.js    # Audio control
│   ├── data/           # Game data
│   │   ├── stories.json      # Story cards
│   │   └── puzzles.json      # Riddle definitions
│   ├── assets/         # Game assets
│   │   └── sounds/           # Audio files (see README inside)
│   └── main.js         # Phaser config and entry point
├── docs/
│   ├── PRD.md          # Product Requirements Document
│   ├── TODO.md         # Task tracking
│   ├── PROGRESS.md     # Development progress log
│   └── CLAUDE.md       # AI assistant guidance
├── public/             # Static assets
├── index.html          # HTML entry point
├── vite.config.js      # Vite + PWA configuration
└── package.json
```

## Gameplay

### Getting Started
1. **Start**: Click "Start Game" from the menu
2. **Navigate**: Use touch D-pad, swipe gestures, or arrow keys
3. **Explore**: Move through the 5×5 labyrinth from START to END

### Game Elements
- **Path Tiles**: Normal tiles you can traverse
- **Puzzle Tiles** (yellow ?, 6 per game): Riddle challenges with hints
- **Intersection Tiles** (pink ★, 2 per game): Story branch points (A ↔ B)
- **START Tile**: Your starting position (0, 0)
- **END Tile**: Win condition (4, 4)

### Puzzle System
- **20 Riddle Pool**: Each game randomly selects 6 riddles
- **Progressive Hints**: 3 hints per riddle (global pool of 3 hints total)
- **Scoring**: 100 base points + 20 per unused hint (max 160 per puzzle)
- **Mobile Input**: HTML text field for native keyboard support

### Story System
- **5 Story Cards per Lineage**: Start, Puzzle×2, Intersection, End
- **Lineage A (Hero's Quest)**: Heroic narrative path
- **Lineage B (Villain's Plot)**: Villainous narrative path
- **Story Flow**: Card appears → Continue → Action (puzzle/intersection/end)

### Scoring
- Each puzzle: 100 points (base)
- Hint bonus: +20 per unused hint on that puzzle
- Example: Solve all 6 puzzles without hints = 960 points

## Current Status

### ✅ Implemented (MVP Complete)
- 5×5 procedural labyrinth generation (recursive backtracking)
- Mobile-first touch controls + swipe gestures
- 20 riddle puzzles with 3 difficulty levels
- Dual narrative lineages with branching
- Centralized game state management
- Persistent HUD (score/timer/hints)
- Sound system architecture (awaiting audio assets)
- Sound toggle UI control
- Win condition with final score/time
- PWA configuration for offline play

### 🚧 Future Enhancements
- **Audio Assets**: Add 6 sound files (move, solve, error, hint, story, win)
- **Additional Puzzle Types**: Logic grid, pattern match, code breaker, spatial
- **More Story Cards**: Expand to 40 cards (20 per lineage)
- **Difficulty Levels**: Easy (3×3), Medium (5×5), Hard (7×7)
- **Multiplayer**: Turn-based co-op via WebSockets
- **Leaderboards**: Score tracking and sharing
- **Visual Polish**: Animations, particle effects, transitions

## Replay Value

- **38,760 riddle combinations** (20 choose 6)
- **2 story lineages** with intersection switching
- **Procedural mazes** with unique layouts
- **Different difficulty distributions** each playthrough
- **Speed-running potential** with timer tracking

## Documentation

- **[PRD](docs/PRD.md)**: Full Product Requirements Document with roadmap
- **[TODO](docs/TODO.md)**: Detailed task list and sprint planning
- **[PROGRESS](docs/PROGRESS.md)**: Development progress log and metrics
- **[CLAUDE.md](CLAUDE.md)**: Guidance for AI assistants working on this codebase

## License

ISC

## Contributing

This is currently a solo project in active development. The core game loop is complete and playable. Contributions welcome for:
- Sound asset creation (see `src/assets/sounds/README.md`)
- Additional riddle puzzles
- Story card writing
- Bug reports and testing

## Development Notes

- **Mobile Testing**: Use `npm run dev -- --host` and access via network IP
- **PWA**: Configured for portrait orientation, standalone display mode
- **Sound System**: Ready for audio files, no errors if missing
- **Scene System**: All scenes use pause/resume for state preservation
- **Generator**: Ensures solvable path from start to end using recursive backtracking

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173 (or network URL for mobile)
```

Navigate the labyrinth, solve riddles, uncover the story!
