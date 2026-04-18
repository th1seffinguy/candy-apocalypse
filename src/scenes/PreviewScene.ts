import Phaser from 'phaser';
import { SceneKey } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const PREVIEW_WORLD_W = 1600;

interface PreviewEntity {
  x: number;
  y: number;
  key: string;
  label: string;
  labelColor: string;
}

interface PreviewPlatform {
  x: number;
  y: number;
  tiles: number;
  tile: string;
}

export class PreviewScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Preview });
  }

  create() {
    this.cameras.main.setBounds(0, 0, PREVIEW_WORLD_W, GAME_HEIGHT);

    this.buildBackgrounds();
    this.buildWorld();
    this.buildOverlay();
    this.startCameraPan();
    this.bindSkip();
  }

  private buildBackgrounds() {
    // Sky fills full world width with fixed scroll
    this.add.image(0, 0, 'bg_sky').setOrigin(0).setScrollFactor(0);

    // Parallax far layer (two copies to cover world width)
    for (let i = 0; i < 2; i++) {
      this.add.image(i * GAME_WIDTH, 0, 'bg_far').setOrigin(0).setScrollFactor(0.25);
    }

    // Parallax mid layer
    for (let i = 0; i < 2; i++) {
      this.add.image(i * GAME_WIDTH, 0, 'bg_mid').setOrigin(0).setScrollFactor(0.5);
    }
  }

  private buildWorld() {
    const groundY = GAME_HEIGHT - 16;

    // Ground tiles across full width
    for (let x = 0; x < PREVIEW_WORLD_W; x += 32) {
      this.add.image(x + 16, groundY, 'tile_wafer');
    }

    // Elevated platforms showcasing each tile type
    const platforms: PreviewPlatform[] = [
      { x: 160, y: 400, tiles: 4, tile: 'tile_toffee' },
      { x: 380, y: 350, tiles: 5, tile: 'tile_wafer' },
      { x: 640, y: 410, tiles: 3, tile: 'tile_caramel' },
      { x: 860, y: 360, tiles: 6, tile: 'tile_crumble' },
      { x: 1100, y: 390, tiles: 4, tile: 'tile_toffee' },
      { x: 1340, y: 345, tiles: 5, tile: 'tile_wafer' },
    ];
    for (const p of platforms) {
      for (let i = 0; i < p.tiles; i++) {
        this.add.image(p.x + i * 32, p.y, p.tile);
      }
    }

    // Breakable blocks scattered above platforms
    const blockPositions = [
      { x: 200, y: 340 }, { x: 420, y: 290 }, { x: 680, y: 350 },
      { x: 920, y: 300 }, { x: 1150, y: 330 }, { x: 1400, y: 285 },
    ];
    for (const b of blockPositions) {
      this.add.image(b.x, b.y, 'block_breakable');
    }

    // Toxic puddles on ground
    this.add.image(560, GAME_HEIGHT - 16, 'toxic_puddle').setAlpha(0.9);
    this.add.image(1300, GAME_HEIGHT - 16, 'toxic_puddle').setAlpha(0.9);

    // Checkpoint mid-world
    this.add.image(790, GAME_HEIGHT - 40, 'checkpoint_on');

    // End flag at far right
    this.add.image(1555, GAME_HEIGHT - 44, 'end_flag');

    this.buildEntities();
  }

  private buildEntities() {
    const groundY = GAME_HEIGHT - 16;

    // Hero player at spawn
    this.addBobbing('player_normal', 96, groundY - 23, 8, 400);

    // Enemies showcased at various positions
    const enemies: PreviewEntity[] = [
      { x: 220, y: 400 - 21, key: 'enemy_gummy', label: 'GUMMY BEAR', labelColor: '#ff6688' },
      { x: 450, y: 350 - 22, key: 'enemy_jawbreaker', label: 'JAWBREAKER', labelColor: '#ffd700' },
      { x: 700, y: groundY - 16, key: 'enemy_drone', label: 'CANDY DRONE', labelColor: '#88ccee' },
      { x: 940, y: 360 - 33, key: 'enemy_golem', label: 'CARAMEL GOLEM', labelColor: '#d4900a' },
      { x: 1200, y: groundY - 21, key: 'enemy_gummy', label: 'GUMMY BEAR', labelColor: '#ff6688' },
      { x: 1420, y: 345 - 22, key: 'enemy_jawbreaker', label: 'JAWBREAKER', labelColor: '#ffd700' },
    ];

    for (const e of enemies) {
      this.addBobbing(e.key, e.x, e.y, 6, 500 + Math.random() * 300);
      this.add.text(e.x, e.y + 26, e.label, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: e.labelColor,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(5);
    }

    // Power-ups floating above breakable blocks
    const powerups: PreviewEntity[] = [
      { x: 200, y: 300, key: 'powerup_gobstopper', label: 'GOBSTOPPER', labelColor: '#88ffcc' },
      { x: 680, y: 310, key: 'powerup_shard', label: 'ROCK SHARD', labelColor: '#88ddff' },
      { x: 1150, y: 290, key: 'powerup_syrup', label: 'TOXIC SYRUP', labelColor: '#55ee66' },
    ];
    for (const pu of powerups) {
      this.addBobbing(pu.key, pu.x, pu.y, 5, 700 + Math.random() * 200);
      this.add.text(pu.x, pu.y + 20, pu.label, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: pu.labelColor,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(5);
    }
  }

  private addBobbing(key: string, x: number, y: number, amplitude: number, duration: number) {
    const sprite = this.add.image(x, y, key).setDepth(3);
    this.tweens.add({
      targets: sprite,
      y: y - amplitude,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private buildOverlay() {
    // Header bar (camera-fixed)
    this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, 0x0d0514, 0.88)
      .setScrollFactor(0).setDepth(10);

    this.add.text(GAME_WIDTH / 2, 12, 'LEVEL 1  ·  LOLLIPOP RUINS', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#aa7799',
      letterSpacing: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    this.add.text(GAME_WIDTH / 2, 30, 'CANDY', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#ff2255',
      stroke: '#440011',
      strokeThickness: 3,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(11);

    this.add.text(GAME_WIDTH / 2 + 4, 30, 'APOCALYPSE', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd700',
      stroke: '#554400',
      strokeThickness: 2,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(11);

    // "PREVIEW" badge
    const badge = this.add.rectangle(GAME_WIDTH - 56, 14, 80, 18, 0xff2255, 1)
      .setScrollFactor(0).setDepth(12);
    this.add.text(GAME_WIDTH - 56, 14, 'PREVIEW', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffffff',
      letterSpacing: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(13);
    this.tweens.add({
      targets: badge,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Footer prompt
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x0d0514, 0.88)
      .setScrollFactor(0).setDepth(10);

    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20,
      'PRESS SPACE / ENTER OR TAP TO START', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ff69b4',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Scroll hint arrow (bottom-right)
    this.add.text(GAME_WIDTH - 12, GAME_HEIGHT - 20, '▶', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#6655aa',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(11);
  }

  private startCameraPan() {
    const maxScroll = PREVIEW_WORLD_W - GAME_WIDTH;
    this.cameras.main.scrollX = 0;
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: maxScroll,
      duration: 9000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private bindSkip() {
    const launch = () => {
      this.tweens.killAll();
      this.scene.start(SceneKey.Game, { level: 1 });
    };

    const kbd = this.input.keyboard!;
    kbd.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once('down', launch);
    kbd.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once('down', launch);
    this.input.once('pointerdown', launch);
  }
}
