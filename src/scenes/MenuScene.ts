import Phaser from 'phaser';
import { SceneKey } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Menu });
  }

  create() {
    // Background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky').setScrollFactor(0);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_far').setScrollFactor(0).setAlpha(0.8);

    // Title text (drawn with graphics since no bitmap font)
    this.drawTitle();

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 220, 'A POST-SUGAR-WAR PLATFORMER', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aa7799',
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Flashing start prompt
    const startText = this.add.text(GAME_WIDTH / 2, 320, 'PRESS SPACE OR TAP TO START', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff69b4',
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 410, 'WASD / ARROWS  ·  JUMP: W or SPACE  ·  ATTACK: Z or J', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#6655aa',
    }).setOrigin(0.5);

    // Version
    this.add.text(8, GAME_HEIGHT - 12, 'v0.1 — LEVEL 1 PROTOTYPE', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#443355',
    });

    // Input listeners
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const startGame = () => this.scene.start(SceneKey.Game, { level: 1 });

    space.once('down', startGame);
    enter.once('down', startGame);
    this.input.once('pointerdown', startGame);
  }

  private drawTitle() {
    // Draw "CANDY" in large styled text
    const titleStyle = {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#ff2255',
      stroke: '#440011',
      strokeThickness: 4,
    };
    const subStyle = {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffd700',
      stroke: '#554400',
      strokeThickness: 3,
    };

    this.add.text(GAME_WIDTH / 2, 100, 'CANDY', titleStyle).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 155, 'APOCALYPSE', subStyle).setOrigin(0.5);

    // Decorative candy block row
    const blockColors = [0xff2255, 0xffd700, 0x00cc44, 0x4466ff, 0xff6600, 0xaa00ff];
    for (let i = 0; i < 6; i++) {
      const x = GAME_WIDTH / 2 - 90 + i * 32;
      const rect = this.add.rectangle(x, 190, 28, 12, blockColors[i]);
      this.tweens.add({
        targets: rect,
        y: 194,
        duration: 400 + i * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
