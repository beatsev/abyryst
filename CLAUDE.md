# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Abyryst is a procedurally generated labyrinth mystery PWA game built with Phaser 3 and Vite. The game features mobile-first touch controls, offline-first PWA architecture, and will include puzzle-solving mechanics with dual branching storylines.

## Development Commands

```bash
# Development server (local only)
npm run dev

# Development server with network access (for mobile testing via SSH)
npm run dev -- --host

# Production build
npm run build

# Preview production build
npm run preview
```

Network URLs when running with `--host` will be displayed in terminal output.

## Architecture

### Phaser Scene System
The game uses Phaser's Scene system for state management:
- **MenuScene** (`src/scenes/MenuScene.js`): Title screen and game entry
- **GameScene** (`src/scenes/GameScene.js`): Main gameplay loop, labyrinth rendering, player movement
- Future: **PuzzleScene** for individual puzzle interactions

Scenes are registered in `src/main.js` in the Phaser config's `scene` array. The first scene in the array auto-starts.

### Game Systems
- **LabyrinthGenerator** (`src/systems/Generator.js`): Procedural maze generation using recursive backtracking algorithm
  - Generates grid with bidirectional tile connections (N/S/E/W)
  - Returns data structure: `{ width, height, grid, start, end, seed }`
  - Ensures solvable path from start (0,0) to end (width-1, height-1)

### Input System
Mobile-first approach with fallback keyboard support:
- **Touch controls**: D-pad buttons (▲▼◄►) positioned at bottom-center
- **Swipe gestures**: Minimum 50px swipe distance for directional movement
- **Keyboard**: Arrow keys (desktop fallback)
- Movement uses cooldown system (200ms) to prevent rapid-fire inputs

### Tile Connection System
Tiles use directional connections for movement validation:
```javascript
connections: { N: boolean, S: boolean, E: boolean, W: boolean }
```
Movement is only valid if current tile has connection in move direction AND target tile exists and isn't empty.

### PWA Configuration
- `vite.config.js` uses `vite-plugin-pwa` with Workbox
- Offline-first caching strategy
- Configured for portrait orientation, standalone display mode
- Service worker auto-updates on new deployment

## Development Workflow

### Task Management
- **Always check `docs/TODO.md`** for current sprint tasks and priorities
- **Always commit and push when completing a TODO item** from `docs/TODO.md`
- **Always update `docs/PROGRESS.md`** when git is pushed
- Use checkboxes in TODO.md to track completion status

### Git Workflow
When making commits:
```bash
git commit -m "$(cat <<'EOF'
<commit message>

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>
EOF
)"
```

### Documentation Structure
- `docs/PRD.md`: Product requirements, features roadmap, technical specs
- `docs/TODO.md`: Sprint-based task list with status tracking
- `docs/PROGRESS.md`: Development log with metrics, decisions, and changelog

## Planned Features (Not Yet Implemented)

### Puzzle System
5 puzzle types planned (see PRD.md):
1. Riddle (text-based)
2. Logic Grid (3x3 deduction)
3. Pattern Match (visual)
4. Code Breaker (symbols)
5. Spatial (drag/drop rotation)

Each puzzle type will get its own Phaser Scene.

### Story System
- JSON-based story cards with templating
- Dual lineage system (Lineage A: Hero, Lineage B: Villain)
- Story branching at intersection tiles
- Expected location: `src/assets/stories.json`

### Multiplayer
- Backend: Node.js + Fastify + Socket.io (not yet created)
- Real-time turn-based gameplay
- Planned location: `server.js` (root)

## Mobile Development

The game is mobile-first. When testing:
1. Run `npm run dev -- --host` to expose on network
2. Access via displayed network IP from mobile device
3. Viewport is locked (no zoom), touch-action disabled to prevent scrolling
4. D-pad buttons are sized for thumb interaction (60px base size)

## Current Status

MVP Prototype (3x3 labyrinth with navigation):
- ✅ Procedural labyrinth generation
- ✅ Mobile touch controls + swipe
- ✅ Win condition (reach end tile)
- ✅ PWA configuration
- ❌ No puzzles yet
- ❌ No story system yet
- ❌ No multiplayer yet

Next planned work (see `docs/TODO.md` Sprint 1, Day 2-3):
- Expand to 5x5 grid
- Add tile types (path, puzzle, intersection)
- Implement first puzzle type (Riddle)
- Create story card JSON system
