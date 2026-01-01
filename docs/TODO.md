# Abyryst - Task List

**Last Updated:** 2026-01-01 (Day 2-3 Plan Created)

## Legend
- ✅ Completed
- 🚧 In Progress
- 📋 Planned
- ❌ Blocked

---

## Sprint 1: Foundation (Week 1) - ✅ COMPLETED

### Day 1 - Project Setup ✅
- [x] Initialize git repository
- [x] Create private GitHub repo
- [x] Set up Vite + Phaser 3 project
- [x] Install dependencies (Phaser, PWA plugin)
- [x] Create project structure (scenes/, systems/, assets/)
- [x] Set up basic Phaser config
- [x] Create MenuScene with UI
- [x] Create GameScene with 3x3 labyrinth
- [x] Implement LabyrinthGenerator (recursive backtracking)
- [x] Add player movement (arrow keys)
- [x] Add win condition detection
- [x] Configure PWA manifest
- [x] Write README.md
- [x] Write .gitignore
- [x] Create docs folder structure
- [x] Write PRD.md
- [x] Write TODO.md
- [x] Write PROGRESS.md

### Day 2-3 - Core Game Loop ✅ COMPLETED

#### Phase 1: Grid Expansion (2-3h) ✅
- [x] Update Generator.js with postProcessTiles() method
- [x] Add randomPuzzleId() and shuffleArray() helpers
- [x] Change GameScene to 5x5 grid
- [x] Reduce tileSize to 100px
- [x] Add visual indicators for puzzle tiles (yellow circle + "?")
- [x] Add visual indicators for intersection tiles (pink star)

#### Phase 2: Game State Management (1-2h) ✅
- [x] Create GameState.js system
- [x] Create UIOverlay.js scene
- [x] Integrate GameState into GameScene
- [x] Launch UIOverlay in parallel with GameScene
- [x] Track visited tiles in tryMove()

#### Phase 3: Story System (2-3h) ✅
- [x] Create stories.json with 2 lineages (5 cards each)
- [x] Create StoryManager.js
- [x] Create StoryScene.js with continue button
- [x] Show intro story on game start
- [x] Add handleTileEntry() method to GameScene
- [x] Add launchPuzzle() and handleIntersection() methods
- [x] Integrate story triggers into movement

#### Phase 4: Puzzle System (3-4h) ✅
- [x] Create puzzles.json with 6 riddles
- [x] Create PuzzleManager.js
- [x] Create base PuzzleScene.js
- [x] Create RiddlePuzzleScene.js
- [x] Add HTML input field for answers
- [x] Implement hint system
- [x] Add answer validation
- [x] Add DOM cleanup on scene stop

#### Phase 5: Sound System (1h) ✅
- [x] Create/find 3 audio files (move, solve, error)
- [x] Add preload() method to GameScene
- [x] Play move sound on movement
- [x] Play solve/error sounds in PuzzleScene

#### Phase 6: Scene Registration (30m) ✅
- [x] Register all scenes in main.js
- [x] Verify scene transitions work correctly
- [x] Test pause/resume functionality

#### Phase 7: Polish & Testing (2-3h) ✅
- [x] Prevent movement during puzzles
- [x] Prevent duplicate puzzle launches
- [x] Add solved indicator animation
- [x] Fix mobile input positioning
- [x] Update win condition with final story
- [x] Test full playthrough
- [x] Test on mobile device
- [x] Fix any bugs found

### Day 4 - Polish & Testing 📋
- [ ] **CRITICAL: Guaranteed Puzzle Path** (Game Balance Fix)
  - [ ] Implement pathfinding algorithm (BFS/DFS) to find critical path from start to end
  - [ ] Validate critical path contains ≥1 puzzle tile after generation
  - [ ] If no puzzle on path, reassign one path tile on critical path to puzzle type
  - [ ] Add unit tests for path validation
  - [ ] Update Generator.js with guaranteePuzzleOnPath() method
- [ ] Add animations (player movement, tile reveals)
- [ ] Improve visual design (colors, fonts)
- [ ] Add difficulty selection
- [ ] Create placeholder icons (192x192, 512x512)
- [ ] Test offline functionality
- [ ] Fix bugs from user testing
- [ ] Optimize bundle size

---

## Sprint 2: Puzzle Systems (Week 2) 📋

### Puzzle Types
- [ ] **Riddle Puzzle** (text-based)
  - [ ] Create RiddlePuzzleScene
  - [ ] Add clue system (3 hints)
  - [ ] Implement text input validation
  - [ ] Add 10 riddles to data file
- [ ] **Logic Grid Puzzle** (3x3 deduction)
  - [ ] Create LogicPuzzleScene
  - [ ] Implement drag/drop mechanics
  - [ ] Add validation logic
  - [ ] Create 5 logic puzzles
- [ ] **Pattern Match Puzzle** (visual)
  - [ ] Create PatternPuzzleScene
  - [ ] Implement sprite comparison
  - [ ] Add 5 pattern puzzles

### Story System
- [ ] Create story data structure (JSON)
- [ ] Write 20 story cards for Lineage A (Hero's Quest)
- [ ] Write 20 story cards for Lineage B (Villain's Plot)
- [ ] Implement story branching at intersections
- [ ] Add story state management
- [ ] Create StoryCardScene for display

---

## Sprint 3: Multiplayer & PWA (Week 3) 📋

### Backend
- [ ] Set up Fastify server
- [ ] Install Socket.io
- [ ] Create room system
- [ ] Implement turn-based logic
- [ ] Add player sync (positions, progress)
- [ ] Handle disconnections gracefully

### Frontend Multiplayer
- [ ] Create LobbyScene
- [ ] Add room creation/joining UI
- [ ] Implement real-time player updates
- [ ] Add chat system (text)
- [ ] Sync puzzle solutions across players
- [ ] Test with 2-4 players

### PWA Enhancement
- [ ] Create app icons (192x192, 512x512)
- [ ] Test install prompt
- [ ] Verify offline caching
- [ ] Add service worker updates
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

---

## Sprint 4: Beta & Deploy (Week 4) 📋

### Testing
- [ ] 10 beta testers recruited
- [ ] Bug tracking spreadsheet
- [ ] Fix critical bugs (crashes, softlocks)
- [ ] Balance puzzle difficulty
- [ ] Collect feedback on story/UX

### Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Deploy backend to Vercel/Railway
- [ ] Deploy frontend to Vercel
- [ ] Set up custom domain (optional)
- [ ] Add analytics (Vercel Analytics)

### Marketing Prep
- [ ] Create itch.io page
- [ ] Write launch post (Reddit r/WebGames)
- [ ] Create Twitter/X account
- [ ] Record gameplay GIF/video
- [ ] Write press kit

---

## Future Enhancements (Post-MVP) 📋

### Themes
- [ ] Fantasy theme (art, story, puzzles)
- [ ] Ancient Egypt theme
- [ ] Noir Detective theme

### Advanced Features
- [ ] Custom labyrinth editor
- [ ] User-generated puzzles
- [ ] Achievement system (50+ achievements)
- [ ] Leaderboards (fastest solve times)
- [ ] Voice chat (WebRTC)
- [ ] Daily challenges
- [ ] Seasonal events

### Monetization
- [ ] Premium tier unlock ($4.99)
- [ ] DLC theme packs ($1.99 each)
- [ ] In-app purchase integration
- [ ] Analytics for conversion tracking

---

## Blockers & Issues ❌

*None currently*

---

## Notes

- Focus on MVP first - avoid scope creep
- Test on mobile early and often
- Keep bundle size under 100KB (core) + 50MB (assets)
- Prioritize 60FPS on mid-range mobile devices
- Gather feedback after each sprint

---

**Next Action:** Expand labyrinth to 5x5 and implement first puzzle type (Riddle)
