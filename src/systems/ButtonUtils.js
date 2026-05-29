import Phaser from 'phaser';

/**
 * Shared button interaction helpers for Phaser UI.
 */

export function wireButton(scene, target, onClick, options = {}) {
  const {
    bg = null,
    hitArea = null,
    hitAreaCallback = null,
    pressScale = 0.98,
    hoverAlpha = 0.88,
    normalAlpha = 1,
    disabled = false,
    activateOn = 'up'
  } = options;

  if (hitArea && hitAreaCallback) {
    target.setInteractive(hitArea, hitAreaCallback);
    if (target.input) {
      target.input.cursor = 'pointer';
    }
  } else {
    target.setInteractive({ useHandCursor: true });
  }

  target.isUiButton = true;
  target.setData('buttonPressed', false);

  const visual = bg || target;
  const resetVisual = () => {
    visual.setAlpha(normalAlpha);
    target.setScale(1);
    target.setData('buttonPressed', false);
  };

  target.on('pointerover', () => {
    if (disabled) return;
    visual.setAlpha(hoverAlpha);
  });

  target.on('pointerout', () => {
    resetVisual();
  });

  target.on('pointerdown', (pointer, localX, localY, event) => {
    if (disabled) return;
    event?.stopPropagation();
    target.setData('buttonPressed', true);
    target.setScale(pressScale);

    if (activateOn === 'down') {
      onClick();
    }
  });

  target.on('pointerup', (pointer, localX, localY, event) => {
    if (disabled || !target.getData('buttonPressed')) return;
    event?.stopPropagation();
    resetVisual();
    if (activateOn === 'up') {
      onClick();
    }
  });

  return target;
}

export function rectangleHitArea(width, height, padding = 0) {
  return {
    area: new Phaser.Geom.Rectangle(
      -width / 2 - padding,
      -height / 2 - padding,
      width + padding * 2,
      height + padding * 2
    ),
    callback: Phaser.Geom.Rectangle.Contains
  };
}

export function circleHitArea(radius, padding = 0) {
  return {
    area: new Phaser.Geom.Circle(0, 0, radius + padding),
    callback: Phaser.Geom.Circle.Contains
  };
}
