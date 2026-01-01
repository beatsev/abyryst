# Sound Assets

This directory contains audio files for the game. The SoundManager (`src/systems/SoundManager.js`) is configured to use these sounds.

## Required Sound Files

Add the following audio files to this directory (`.mp3` or `.ogg` format recommended for browser compatibility):

### 1. `move.mp3` / `move.ogg`
- **Description**: Short subtle sound when player moves to a new tile
- **Duration**: ~0.1-0.2 seconds
- **Type**: Soft click, footstep, or tile slide sound
- **Volume**: Low (0.3)

### 2. `solve.mp3` / `solve.ogg`
- **Description**: Positive feedback when puzzle is solved correctly
- **Duration**: ~0.5-1 second
- **Type**: Success chime, bell, or positive tone
- **Volume**: Medium (0.5)

### 3. `error.mp3` / `error.ogg`
- **Description**: Gentle negative feedback for incorrect puzzle answer
- **Duration**: ~0.3-0.5 seconds
- **Type**: Soft buzz, descending tone, or gentle "incorrect" sound
- **Volume**: Medium-low (0.4)

### 4. `hint.mp3` / `hint.ogg`
- **Description**: Light notification when hint is revealed
- **Duration**: ~0.2-0.4 seconds
- **Type**: Light bulb "ding", soft chime, or notification sound
- **Volume**: Low (0.3)

### 5. `story.mp3` / `story.ogg`
- **Description**: Atmospheric sound when story card appears
- **Duration**: ~0.5-0.8 seconds
- **Type**: Page turn, gentle whoosh, or mystical chime
- **Volume**: Medium-low (0.4)

### 6. `win.mp3` / `win.ogg`
- **Description**: Celebratory sound when player reaches the end
- **Duration**: ~1-2 seconds
- **Type**: Victory fanfare, ascending chime, or celebration sound
- **Volume**: Medium-high (0.6)

## Free Sound Resources

You can find free game audio at:
- [Freesound.org](https://freesound.org/)
- [OpenGameArt.org](https://opengameart.org/)
- [Zapsplat.com](https://www.zapsplat.com/)
- [Mixkit.co](https://mixkit.co/free-sound-effects/)

## Implementation Notes

- The SoundManager gracefully handles missing files (no errors thrown)
- Sounds can be toggled on/off by the user
- Volume levels are pre-configured but can be adjusted in `SoundManager.js`
- Browser autoplay policies may require user interaction before sounds play

## Adding Sounds to the Game

1. Add sound files to this directory
2. Update `src/main.js` to preload the sounds:
   ```javascript
   function preload() {
     this.load.audio('move', 'src/assets/sounds/move.mp3');
     this.load.audio('solve', 'src/assets/sounds/solve.mp3');
     // ... etc
   }
   ```
3. The SoundManager will automatically detect and use loaded sounds

## Current Status

🔇 **No audio files added yet** - System is ready but sounds are disabled until files are added.
