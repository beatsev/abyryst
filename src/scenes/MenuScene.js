import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const compact = width < 520;
    const centerX = width / 2;

    this.createBackground(width, height);

    const titleY = compact ? height * 0.16 : height * 0.2;
    this.createTitle(centerX, titleY, compact);

    this.add.text(centerX, titleY + (compact ? 62 : 76), 'LABYRINTH MYSTERY', {
      fontSize: compact ? '14px' : '18px',
      fontFamily: 'Arial Black',
      color: '#62e5bf'
    }).setOrigin(0.5);

    const saveData = this.loadSaveData();
    const panelWidth = Math.min(width - 32, 480);
    const panelHeight = saveData ? 236 : 178;
    const panelY = Math.min(height * 0.56, titleY + 240);

    this.add.rectangle(centerX + 4, panelY + 7, panelWidth, panelHeight, 0x000000, 0.34);
    this.add.rectangle(centerX, panelY, panelWidth, panelHeight, 0x0b1020, 0.88)
      .setStrokeStyle(2, 0x62e5bf, 0.24);

    if (saveData) {
      this.createButton(centerX, panelY - 64, panelWidth - 48, 54, 'CONTINUE CAMPAIGN', 0x62e5bf, 0x07110e, () => this.continueCampaign(saveData));
      this.add.text(centerX, panelY - 18, `Level ${saveData.currentLevel}   HP ${saveData.livesRemaining}`, {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: '#ffcf5a'
      }).setOrigin(0.5);
      this.createButton(centerX, panelY + 46, panelWidth - 48, 50, 'NEW CAMPAIGN', 0x17233a, 0xf5fffb, () => this.startNewCampaign());
    } else {
      this.createButton(centerX, panelY - 24, panelWidth - 48, 58, 'START CAMPAIGN', 0x62e5bf, 0x07110e, () => this.startNewCampaign());
    }

    const highScore = parseInt(localStorage.getItem('abyryst_high_score') || '0');
    if (highScore > 0) {
      this.add.text(centerX, panelY + panelHeight / 2 - 42, `HIGH SCORE ${highScore}`, {
        fontSize: '14px',
        fontFamily: 'Arial Black',
        color: '#ffcf5a'
      }).setOrigin(0.5);
    }

    this.add.text(centerX, Math.min(height - 74, panelY + panelHeight / 2 + 64), 'Explore shifting corridors. Solve riddles. Survive ten depths.', {
      fontSize: compact ? '14px' : '15px',
      fontFamily: 'Arial',
      color: '#a8b7c7',
      align: 'center',
      wordWrap: { width: Math.min(width - 48, 500) }
    }).setOrigin(0.5);

    this.add.text(16, height - 22, 'v2.0.0', {
      fontSize: '12px',
      color: '#58677a',
      fontFamily: 'Arial Black'
    }).setOrigin(0, 1);
  }

  createBackground(width, height) {
    this.add.rectangle(0, 0, width, height, 0x070a12).setOrigin(0);

    const g = this.add.graphics();
    g.fillGradientStyle(0x132942, 0x132942, 0x070a12, 0x070a12, 0.95);
    g.fillRect(0, 0, width, height);
    g.fillStyle(0x62e5bf, 0.06);
    g.fillCircle(width * 0.18, height * 0.18, Math.max(100, width * 0.28));
    g.fillStyle(0xffc857, 0.045);
    g.fillCircle(width * 0.84, height * 0.28, Math.max(90, width * 0.22));

    g.lineStyle(1, 0x62e5bf, 0.08);
    const step = Math.max(34, Math.min(54, width / 9));
    for (let x = -step; x < width + step; x += step) {
      g.lineBetween(x, 0, x + height * 0.28, height);
    }
    for (let y = 0; y < height; y += step) {
      g.lineBetween(0, y, width, y + width * 0.12);
    }
  }

  createTitle(x, y, compact) {
    const fontSize = compact ? '52px' : '72px';
    const offsets = [
      { x: 5, y: 6, color: '#000000', alpha: 0.45 },
      { x: 3, y: 3, color: '#14233a', alpha: 0.78 }
    ];

    offsets.forEach((shadow) => {
      this.add.text(x + shadow.x, y + shadow.y, 'ABYRYST', {
        fontSize,
        fontFamily: 'Arial Black',
        color: shadow.color
      }).setOrigin(0.5).setAlpha(shadow.alpha);
    });

    const title = this.add.text(x, y, 'ABYRYST', {
      fontSize,
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#62e5bf',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: 0.86,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createButton(x, y, width, height, label, fill, color, onClick) {
    const button = this.add.container(x, y).setSize(width, height);
    const bg = this.add.rectangle(0, 0, width, height, fill, 1)
      .setStrokeStyle(2, 0xffffff, 0.18);
    const text = this.add.text(0, 0, label, {
      fontSize: width < 360 ? '16px' : '18px',
      fontFamily: 'Arial Black',
      color: Phaser.Display.Color.IntegerToColor(color).rgba
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    button.on('pointerover', () => bg.setAlpha(0.86));
    button.on('pointerout', () => bg.setAlpha(1));
    button.on('pointerdown', onClick);
    return button;
  }

  /**
   * Load saved campaign data from localStorage.
   * @returns {Object|null} Save data or null if invalid/missing
   */
  loadSaveData() {
    try {
      const saveJson = localStorage.getItem('abyryst_campaign_save');
      if (!saveJson) return null;

      const data = JSON.parse(saveJson);
      const ageMs = Date.now() - data.timestamp;
      if (ageMs > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('abyryst_campaign_save');
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }

  continueCampaign(saveData) {
    this.scene.start('GameScene', {
      resumeCampaign: true,
      saveData: saveData
    });
  }

  startNewCampaign() {
    if (this.loadSaveData()) {
      const confirmed = confirm('This will delete your saved progress. Continue?');
      if (!confirmed) return;
      localStorage.removeItem('abyryst_campaign_save');
    }

    this.scene.start('GameScene', {
      resumeCampaign: false
    });
  }
}
