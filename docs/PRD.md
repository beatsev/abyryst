# Labyrinth Mystery: Product Requirements Document

**Version:** 1.0
**Last Updated:** 2026-01-01
**Status:** Active Development

## 1. Problem Framing

### User Pain Points
- Physical board games lack infinite replayability and portability
- Mystery/puzzle games suffer from one-time use (e.g., Exit series)
- Players want social, narrative-driven experiences without setup hassles
- Casual gamers need scalable difficulty; hardcore seek depth

### Jobs-to-be-Done
- **Solo**: Quick 15-30min puzzle escapes during commute
- **Social**: 2-4 players competing/cooperating remotely
- **Replay**: Procedurally varied labyrinths with branching stories
- **Collect**: Unlock themes, achievements, custom puzzles

### Market Validation
Digital board games (e.g., Ticket to Ride, Wingspan Digital) achieve 5M+ downloads; mystery apps like "The Room" series exceed 100M downloads.

## 2. Solution Concept

### Core Product
Procedurally generated labyrinth game where players navigate tile-based mazes, solving chained puzzles that advance dual intersecting storylines. Modular tiles rearrange per session for 1000+ layouts.

### Key Differentiators
- **Infinite Replay**: AI-generated labyrinths from 25 tile templates
- **Dual Storylines**: Switch paths at intersections for branching narratives
- **Social Play**: Real-time multiplayer with voice/text chat
- **Scalable Puzzles**: 5 difficulty tiers, adaptive hints

### Platforms
PWA (iOS/Android/Web/Desktop) with home-screen install, offline-first.

## 3. User Personas & Flows

### Primary Personas
- **Casual Clara** (25-34F): 15min sessions, social with friends
- **Puzzle Paul** (35-44M): Solo expert mode, achievements
- **Family Fiona** (Parent 30-45): Kid-friendly modes, co-op

### Core User Flow
1. Launch PWA → Theme Select (Fantasy/Ancient/Noir)
2. Player Count (1-4) → Difficulty → Generate Labyrinth
3. Start Tile → Read Story Card → Solve Puzzle → Reveal Path
4. Navigate → Intersection Choice → Repeat → Final Puzzle Win

## 4. Game Mechanics & Features

### 4.1 Board & Navigation

#### Components
- **25 Modular Tiles** (5x5 grid max)
  - 15 Path Tiles (straight/turn/corner)
  - 8 Puzzle Tiles (riddle/logic/pattern)
  - 2 Intersection Tiles (storyline switch)
- Start/End Tiles fixed opposite corners
- Player Tokens (4 colors, animated movement)

#### Mechanics
- Tiles auto-arrange via algorithm ensuring solvable paths
- Puzzle solution reveals arrow/icon directing next tile
- Intersections: Choose Line A/B (affects story branch)

### 4.2 Puzzle System

#### 5 Puzzle Types (Phaser sprites/interactables)
1. **Riddle** (text): Story-based wordplay, 3 clues
2. **Logic Grid** (3x3): Deduction (drag/match)
3. **Pattern Match** (visual): Spot differences/sequences
4. **Code Breaker** (symbols): Cipher solving
5. **Spatial** (drag/drop): Tile rotation to align paths

#### Adaptive Difficulty

| Tier   | Time Limit | Hints | Puzzle Complexity |
|--------|------------|-------|-------------------|
| Easy   | 5min       | 3     | Basic patterns    |
| Normal | 3min       | 2     | Standard logic    |
| Hard   | 2min       | 1     | Multi-step        |
| Expert | Unlimited  | 0     | Custom user       |

### 4.3 Storytelling Engine

#### Dual Intersecting Narratives (per theme)
- **Lineage A**: Hero's Quest (artifact hunt)
- **Lineage B**: Villain's Plot (betrayal arc)
- **Intersections**: 3 per game - Merge/split choices
- **50 Story Cards** per Lineage (procedurally chained)

#### Dynamic Generation
JSON story templates + variables (player names, choices).

### 4.4 Multiplayer & Social
- **Real-time**: Turn-based with Socket.io rooms
- **Async**: Pass-and-play or challenge friends
- **Voice Chat**: WebRTC integration
- **Leaderboards**: Firebase/Fastify backend

### 4.5 Progression & Monetization
- **Free Tier**: 1 theme, single-player only
- **Premium ($4.99)**: All themes, multiplayer, custom labyrinths
- **DLC Packs**: New themes ($1.99 each)
- **Achievements**: 50+ (e.g., "Perfect Run", "Story Weaver")

## 5. Technical Architecture

### Tech Stack
```
Frontend: Phaser 3 + Vite + Vanilla JS → PWA builds
Rendering: PixiJS (built-in) → 2D sprites, tilemaps, 60FPS
Backend: Node.js + Fastify + Socket.io → Multiplayer sync
PWA: Workbox/Vite PWA Plugin → Offline caching, install prompts
State: Zustand + IndexedDB → Local saves, procedural seeds
Deploy: Vercel/Netlify → Global CDN, auto-scaling
Assets: 2D sprites (SVG/PNG, 50MB compressed)
Bundle: <100KB core + 50MB assets → Progressive loading
```

### Data Models
```json
{
  "Tile": {
    "id": "string",
    "type": "path|puzzle|intersection|start|end",
    "puzzle_id": "string|null",
    "story_id": "string|null",
    "connections": {
      "N": "boolean",
      "S": "boolean",
      "E": "boolean",
      "W": "boolean"
    }
  },
  "Puzzle": {
    "type": "riddle|logic|pattern|code|spatial",
    "solution": "string",
    "clues": ["string"],
    "difficulty": "1-5"
  },
  "StoryCard": {
    "lineage": "A|B",
    "text_template": "string",
    "variables": {},
    "next_ids": ["string"]
  },
  "Labyrinth": {
    "tiles": "5x5 grid",
    "start_pos": {"x": 0, "y": 0},
    "end_pos": {"x": 4, "y": 4},
    "intersections": [],
    "seed": "number"
  }
}
```

### Key Algorithms
1. **Labyrinth Generator**: Phaser tilemap + A* pathfinding
2. **Puzzle Chaining**: Scene transitions with solution validation
3. **Balance Checker**: Seed-based testing (95% solvability)

### Project Structure
```
abyryst/
├── src/
│   ├── scenes/          # GameScene, PuzzleScene, MenuScene
│   ├── systems/         # Generator.js, PuzzleValidator.js
│   ├── assets/          # tiles/, stories.json
│   └── main.js          # Phaser config
├── docs/                # Documentation
├── vite.config.js       # PWA config
├── server.js            # Fastify + Socket.io
└── package.json
```

## 6. Competitive Mapping

| Game                      | Procedural | Multiplayer | Dual Story | Puzzle Variety | Price      |
|---------------------------|------------|-------------|------------|----------------|------------|
| **Abyryst**               | ✅ Infinite | ✅ Real-time | ✅ Dual     | 5 Types        | $4.99      |
| The Room Series           | ❌ Fixed    | ❌ Solo      | ❌ Linear   | Visual Only    | $1-5       |
| Monument Valley           | ❌ Fixed    | ❌ Solo      | ❌ Minimal  | Spatial        | $3.99      |
| Detective: City of Angels | ❌ Fixed    | ✅ Async     | ❌ Linear   | Logic          | $50 Phys   |
| Chronicles of Crime       | ❌ App-aided| ✅ Local     | ❌ Linear   | Mixed          | $40 Phys   |

**Gap Filled**: Procedural + social mystery PWA with infinite replay.

## 7. Risks & Mitigations

| Risk                  | Likelihood | Impact | Mitigation                               |
|-----------------------|------------|--------|------------------------------------------|
| Mobile Performance    | Medium     | High   | Phaser Canvas fallback; 60FPS testing    |
| Socket.io Sync        | Medium     | High   | Optimistic UI + reconciliation           |
| PWA Offline Limits    | Low        | Med    | Workbox caching; sync on reconnect       |
| Procedural Bugs       | Medium     | Med    | Seed validation + 1000 test runs         |

**Assumptions**: Phaser 3.80+ stable; Vercel free tier supports 10k MAU.

## 8. KPIs & Success Metrics

- **Acquisition**: 50k installs Y1, 20% conversion to premium
- **Engagement**: 25min avg session, 4.5+ retention D7
- **Monetization**: $2.50 LTV, 15% DLC uptake
- **Quality**: 4.5+ store ratings, <5% crash rate

## 9. Milestones & Execution Plan

### Sprint Timeline (4-6 Weeks)
```
Sprint 1 (Week 1): Vite + Phaser setup, 3x3 labyrinth prototype
Sprint 2 (Week 2): 3 puzzle types + story chaining
Sprint 3 (Week 3): Socket.io multiplayer + PWA manifest
Sprint 4 (Week 4): Beta testing + Vercel deploy
Week 5-6: Soft launch + marketing
```

### Team Needs
1 Full-stack JS Dev (Phaser experience preferred)

### Budget Estimate
$8k (dev 70%, art 20%, deploy 10%)

## 10. Proof of Concept Plan

### Immediate PoC (3 Days)
- [x] `npx create-vite` + Phaser → 3x3 grid demo
- [x] Tile generator + procedural maze
- [ ] 2 puzzle types implemented
- [ ] PWA installable → Share Vercel link

### Prototype Checklist
- [x] 5x5 labyrinth generation
- [ ] 80% completion rate
- [ ] All puzzles <3min avg solve
- [ ] Offline play (cached assets)
- [ ] GitHub repo deployed to Vercel

## Next Steps

1. ✅ **Day 1**: Create Vite + Phaser project structure
2. ✅ **Day 1**: Basic 3x3 labyrinth with navigation
3. **Day 2**: Add first puzzle type (Riddle)
4. **Day 3**: Story card system + integration
5. **Day 4**: PWA testing + Vercel deployment
6. **Week 2**: Multiplayer Socket.io integration
7. **Week 3**: Beta testing with 5+ users

## References

- Phaser 3 Documentation: https://photonstorm.github.io/phaser3-docs/
- Vite PWA Guide: https://vite-pwa-org.netlify.app/
- Socket.io Gaming Examples: https://socket.io/get-started/
