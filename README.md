# Abyryst - Labyrinth Mystery

A procedurally generated labyrinth mystery game built as a Progressive Web App (PWA) using Phaser 3 and Vite.

## Overview

Abyryst is an infinite-replay puzzle game where players navigate procedurally generated labyrinths, solving puzzles and uncovering branching storylines. Built with modern web technologies for instant cross-platform deployment.

## Features

- **Procedurally Generated Labyrinths**: Every playthrough is unique
- **PWA Support**: Install on any device, play offline
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Labyrinth Navigation**: Arrow keys to explore the maze
- **Win Condition**: Reach the end tile to complete the labyrinth

## Tech Stack

- **Frontend**: Phaser 3 (game engine) + Vite (build tool)
- **PWA**: vite-plugin-pwa with Workbox
- **Language**: JavaScript ES6+ modules
- **Deployment**: Ready for Vercel/Netlify

## Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
abyryst/
├── src/
│   ├── scenes/          # Phaser scenes (Menu, Game)
│   ├── systems/         # Game systems (Generator)
│   ├── assets/          # Game assets (tiles, sprites)
│   └── main.js          # Phaser config and entry point
├── docs/
│   ├── PRD.md           # Product Requirements Document
│   ├── TODO.md          # Task tracking
│   └── PROGRESS.md      # Development progress log
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite + PWA configuration
└── package.json
```

## Gameplay

1. **Start**: Launch the game from the menu
2. **Navigate**: Use arrow keys to move through the labyrinth
3. **Goal**: Reach the END tile from the START tile
4. **Win**: Complete the maze to return to menu

## Current Status (MVP Prototype)

- ✅ Basic 3x3 labyrinth generation
- ✅ Player movement with arrow keys
- ✅ Win condition detection
- ✅ PWA configuration
- 🚧 Puzzle system (coming soon)
- 🚧 Story cards (coming soon)
- 🚧 Multiplayer (coming soon)

## Documentation

- **[PRD](docs/PRD.md)**: Full Product Requirements Document with roadmap
- **[TODO](docs/TODO.md)**: Detailed task list and sprint planning
- **[PROGRESS](docs/PROGRESS.md)**: Development progress log and metrics

## License

ISC

## Contributing

This is currently a solo project in early development. Contributions welcome once MVP is complete.
