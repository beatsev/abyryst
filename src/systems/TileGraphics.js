 /**
  * TileGraphics System
  * Generates procedural retro-style tile textures for the labyrinth
  */

 export default class TileGraphics {
   /**
    * Generate tileset and markers in the texture manager
    * @param {Phaser.Scene} scene - The scene to register textures in
    */
   static generate(scene) {
     const size = 32; // Base size for tile generation (scaled up by Phaser)
     const padding = 2;

     // Create a graphics object to draw our tiles
     const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

     // Palette (Retro 2-bit/8-bit inspired)
     const colors = {
       bg: 0x1a1a2e,      // Deep background
       wall: 0x16213e,    // Wall color
       path: 0x0f3460,    // Path floor
       accent: 0x4ecca3,  // Path highlight / connection
       detail: 0x533483,  // Secondary detail
       start: 0x4ecca3,
       end: 0xff6b6b,
       puzzle: 0xffcc00,
       intersection: 0xff6b9d
     };

     // 1. Generate Labyrinth Tiles (0-15 bitmask)
     for (let mask = 0; mask < 16; mask++) {
       graphics.clear();

       // Draw background (wall/empty space)
       graphics.fillStyle(colors.wall);
       graphics.fillRect(0, 0, size, size);

       // Add Brick texture to walls with subtle variation
       graphics.fillStyle(0x1a1a2e, 0.3);
       for (let i = 0; i < size; i += 8) {
         for (let j = 0; j < size; j += 4) {
           const shift = (j % 8 === 0) ? 0 : 4;
           graphics.fillRect(i + shift, j, 3, 1);
         }
       }

       // Draw Path Floor with brighter core
       graphics.fillStyle(colors.path);
       const margin = 6;
       graphics.fillRect(margin, margin, size - margin * 2, size - margin * 2);

       // Add subtle noise to path surface for 8-bit texture feel
       graphics.fillStyle(0xffffff, 0.07);
       for (let i = margin + 1; i < size - margin; i += 5) {
         for (let j = margin + 1; j < size - margin; j += 5) {
           graphics.fillRect(i, j, 1, 1);
         }
       }

       // Add a thin border to make tile edges clear
       graphics.lineStyle(1, colors.accent, 0.9);
       graphics.strokeRect(margin - 1, margin - 1, size - margin * 2 + 2, size - margin * 2 + 2);

       // Draw Connections (the actual path)
       graphics.fillStyle(colors.accent);
       if (mask & 1) graphics.fillRect(margin, 0, size - margin * 2, margin); // North
       if (mask & 4) graphics.fillRect(margin, size - margin, size - margin * 2, margin); // South
       if (mask & 2) graphics.fillRect(size - margin, margin, margin, size - margin * 2); // East
       if (mask & 8) graphics.fillRect(0, margin, margin, size - margin * 2); // West

       // Add connection highlights to make path pop
       graphics.lineStyle(2, colors.accent, 0.8);
       const inner = margin - 1;
       const outer = size - margin + 1;
       
       // Draw path edges based on connections with rounded corners for retro style
       if (!(mask & 1)) graphics.lineBetween(inner, inner, outer, inner); // N wall
       if (!(mask & 4)) graphics.lineBetween(inner, outer, outer, outer); // S wall
       if (!(mask & 2)) graphics.lineBetween(outer, inner, outer, outer); // E wall
       if (!(mask & 8)) graphics.lineBetween(inner, inner, inner, outer); // W wall

       // Extend lines into corridors with tapered ends
       if (mask & 1) {
         graphics.lineBetween(inner, 0, inner, inner);
         graphics.lineBetween(outer, 0, outer, inner);
       }
       if (mask & 4) {
         graphics.lineBetween(inner, outer, inner, size);
         graphics.lineBetween(outer, outer, outer, size);
       }
       if (mask & 2) {
         graphics.lineBetween(outer, inner, size, inner);
         graphics.lineBetween(outer, outer, size, outer);
       }
       if (mask & 8) {
         graphics.lineBetween(0, inner, inner, inner);
         graphics.lineBetween(0, outer, inner, outer);
       }

       // Add small "pixel" details inside the path to indicate depth
       graphics.fillStyle(0xffffff, 0.15);
       if (mask & 1) {
         graphics.fillRect(margin + 2, 2, size - margin * 2 - 4, 2);
       }
       if (mask & 4) {
         graphics.fillRect(margin + 2, size - 4, size - margin * 2 - 4, 2);
       }
       if (mask & 2) {
         graphics.fillRect(size - 4, margin + 2, 2, size - margin * 2 - 4);
       }
       if (mask & 8) {
         graphics.fillRect(2, margin + 2, 2, size - margin * 2 - 4);
       }

       graphics.generateTexture(`tile-${mask}`, size, size);
     }

     // 2. Generate Empty Tile
     graphics.clear();
     graphics.fillStyle(colors.bg);
     graphics.fillRect(0, 0, size, size);
     // Grid pattern for empty space
     graphics.lineStyle(1, 0x16213e, 0.5);
     graphics.strokeRect(0, 0, size, size);
     graphics.generateTexture('tile-empty', size, size);

     // 3. Generate Markers (Start, End, etc.)
     // Start
     graphics.clear();
     graphics.lineStyle(2, colors.start);
     graphics.strokeCircle(size/2, size/2, size/3);
     graphics.fillStyle(colors.start, 0.5);
     graphics.fillCircle(size/2, size/2, size/5);
     graphics.generateTexture('marker-start', size, size);

     // End
     graphics.clear();
     graphics.lineStyle(2, colors.end);
     graphics.strokeRect(size/4, size/4, size/2, size/2);
     graphics.fillStyle(colors.end, 0.5);
     graphics.fillRect(size/3, size/3, size/3, size/3);
     graphics.generateTexture('marker-end', size, size);

     // Puzzle
     graphics.clear();
     graphics.fillStyle(colors.puzzle);
     // Draw an ancient-looking rune
     graphics.fillRect(size/2 - 1, size/4, 2, size/2);
     graphics.lineStyle(2, colors.puzzle);
     graphics.strokeCircle(size/2, size/2, size/4);
     graphics.generateTexture('marker-puzzle', size, size);

     // Intersection
     graphics.clear();
     graphics.fillStyle(colors.intersection);
     // Draw an X rune
     graphics.lineStyle(3, colors.intersection);
     graphics.lineBetween(size/3, size/3, 2*size/3, 2*size/3);
     graphics.lineBetween(2*size/3, size/3, size/3, 2*size/3);
     graphics.generateTexture('marker-intersection', size, size);

     // Player
     graphics.clear();
     graphics.fillStyle(0xffffff);
     // Simple 8-bit character shape (head and body)
     graphics.fillRect(size/2 - 3, size/2 - 6, 6, 6); // Head
     graphics.fillRect(size/2 - 5, size/2, 10, 8);   // Body
     graphics.generateTexture('player-sprite', size, size);

     // Clean up
     graphics.destroy();
   }
 }
