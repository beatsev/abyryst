/**
 * TileGraphics System
 * Generates procedural high-contrast labyrinth textures.
 */

export default class TileGraphics {
  /**
   * Generate tileset and markers in the texture manager.
   * @param {Phaser.Scene} scene - The scene to register textures in
   */
  static generate(scene) {
    const size = 64;
    const margin = 12;
    const core = size - margin * 2;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    const colors = {
      void: 0x070a12,
      wallTop: 0x1d2942,
      wallBottom: 0x0c1220,
      wallEdge: 0x35476e,
      floor: 0x17233a,
      floorDeep: 0x0f1829,
      path: 0x62e5bf,
      pathGlow: 0x1f9f87,
      start: 0x62e5bf,
      end: 0xff5f73,
      puzzle: 0xffc857,
      intersection: 0xb88cff
    };

    for (let mask = 0; mask < 16; mask++) {
      graphics.clear();

      graphics.fillGradientStyle(colors.wallTop, colors.wallTop, colors.wallBottom, colors.wallBottom, 1);
      graphics.fillRect(0, 0, size, size);

      graphics.lineStyle(1, colors.wallEdge, 0.28);
      for (let y = 8; y < size; y += 10) {
        graphics.lineBetween(4, y, size - 4, y);
      }
      for (let x = 8; x < size; x += 12) {
        graphics.lineBetween(x, 4, x, size - 4);
      }

      graphics.fillStyle(0x000000, 0.24);
      graphics.fillRoundedRect(margin + 2, margin + 3, core, core, 8);
      graphics.fillGradientStyle(0x20304c, 0x20304c, colors.floorDeep, colors.floorDeep, 1);
      graphics.fillRoundedRect(margin, margin, core, core, 8);

      graphics.fillStyle(colors.pathGlow, 0.55);
      if (mask & 1) graphics.fillRect(margin + 4, 0, core - 8, margin + 4);
      if (mask & 4) graphics.fillRect(margin + 4, size - margin - 4, core - 8, margin + 4);
      if (mask & 2) graphics.fillRect(size - margin - 4, margin + 4, margin + 4, core - 8);
      if (mask & 8) graphics.fillRect(0, margin + 4, margin + 4, core - 8);

      graphics.fillStyle(colors.floor, 1);
      if (mask & 1) graphics.fillRect(margin + 7, 0, core - 14, margin + 6);
      if (mask & 4) graphics.fillRect(margin + 7, size - margin - 6, core - 14, margin + 6);
      if (mask & 2) graphics.fillRect(size - margin - 6, margin + 7, margin + 6, core - 14);
      if (mask & 8) graphics.fillRect(0, margin + 7, margin + 6, core - 14);

      graphics.lineStyle(2, colors.path, 0.9);
      graphics.strokeRoundedRect(margin + 1, margin + 1, core - 2, core - 2, 7);
      graphics.lineStyle(1, 0xffffff, 0.16);
      graphics.lineBetween(margin + 8, margin + 8, size - margin - 9, margin + 8);

      graphics.fillStyle(0xffffff, 0.12);
      for (let y = margin + 10; y < size - margin; y += 13) {
        for (let x = margin + 8; x < size - margin; x += 15) {
          graphics.fillCircle(x + ((x + y) % 5), y, 1.2);
        }
      }

      graphics.generateTexture(`tile-${mask}`, size, size);
    }

    graphics.clear();
    graphics.fillStyle(colors.void, 1);
    graphics.fillRect(0, 0, size, size);
    graphics.lineStyle(1, 0x1d2942, 0.38);
    graphics.strokeRect(0.5, 0.5, size - 1, size - 1);
    graphics.fillStyle(0xffffff, 0.035);
    graphics.fillCircle(size * 0.3, size * 0.35, 2);
    graphics.fillCircle(size * 0.72, size * 0.62, 1.4);
    graphics.generateTexture('tile-empty', size, size);

    this.generateStartMarker(graphics, size, colors);
    this.generateEndMarker(graphics, size, colors);
    this.generatePuzzleMarker(graphics, size, colors);
    this.generateIntersectionMarker(graphics, size, colors);
    this.generatePlayer(graphics, size);

    graphics.destroy();
  }

  static generateStartMarker(graphics, size, colors) {
    graphics.clear();
    graphics.fillStyle(colors.start, 0.22);
    graphics.fillCircle(size / 2, size / 2, 22);
    graphics.lineStyle(4, colors.start, 1);
    graphics.strokeCircle(size / 2, size / 2, 17);
    graphics.lineStyle(2, 0xffffff, 0.75);
    graphics.lineBetween(size / 2, 18, size / 2, 46);
    graphics.lineBetween(20, size / 2, 44, size / 2);
    graphics.generateTexture('marker-start', size, size);
  }

  static generateEndMarker(graphics, size, colors) {
    graphics.clear();
    graphics.fillStyle(colors.end, 0.2);
    graphics.fillCircle(size / 2, size / 2, 23);
    graphics.lineStyle(4, colors.end, 1);
    graphics.strokeRoundedRect(18, 18, 28, 28, 5);
    graphics.fillStyle(colors.end, 0.85);
    graphics.fillRoundedRect(25, 25, 14, 14, 3);
    graphics.generateTexture('marker-end', size, size);
  }

  static generatePuzzleMarker(graphics, size, colors) {
    graphics.clear();
    graphics.fillStyle(colors.puzzle, 0.18);
    graphics.fillCircle(size / 2, size / 2, 24);
    graphics.lineStyle(4, colors.puzzle, 1);
    graphics.strokeCircle(size / 2, size / 2, 18);
    graphics.lineStyle(3, colors.puzzle, 1);
    graphics.lineBetween(size / 2, 17, size / 2, 47);
    graphics.lineBetween(22, 26, 42, 38);
    graphics.lineBetween(42, 26, 22, 38);
    graphics.generateTexture('marker-puzzle', size, size);
  }

  static generateIntersectionMarker(graphics, size, colors) {
    graphics.clear();
    graphics.fillStyle(colors.intersection, 0.18);
    graphics.fillCircle(size / 2, size / 2, 23);
    graphics.lineStyle(5, colors.intersection, 1);
    graphics.lineBetween(20, 20, 44, 44);
    graphics.lineBetween(44, 20, 20, 44);
    graphics.lineStyle(2, 0xffffff, 0.65);
    graphics.strokeCircle(size / 2, size / 2, 19);
    graphics.generateTexture('marker-intersection', size, size);
  }

  static generatePlayer(graphics, size) {
    graphics.clear();
    graphics.fillStyle(0x000000, 0.32);
    graphics.fillEllipse(size / 2, 44, 26, 10);
    graphics.fillStyle(0xff647a, 1);
    graphics.fillCircle(size / 2, 24, 8);
    graphics.fillRoundedRect(23, 31, 18, 19, 5);
    graphics.fillStyle(0xffffff, 0.85);
    graphics.fillCircle(29, 22, 2);
    graphics.fillCircle(35, 22, 2);
    graphics.lineStyle(3, 0x62e5bf, 1);
    graphics.strokeCircle(size / 2, size / 2, 24);
    graphics.generateTexture('player-sprite', size, size);
  }
}
