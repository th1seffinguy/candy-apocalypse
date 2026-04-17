import Phaser from 'phaser';
import { COLORS } from '../config';
import { SceneKey } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Boot });
  }

  preload() {
    this.load.json('level1', 'assets/tilemaps/level1.json');

    // Loading bar
    const bar = this.add.graphics();
    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0xff69b4);
      bar.fillRect(100, 260, 600 * v, 20);
    });
    this.load.on('complete', () => bar.destroy());
  }

  create() {
    this.generateTextures();
    this.scene.start(SceneKey.Menu);
  }

  private g(): Phaser.GameObjects.Graphics {
    return this.make.graphics({ x: 0, y: 0, add: false });
  }

  private generateTextures() {
    this.makeTileWafer();
    this.makeTileToffee();
    this.makeTileCrumble();
    this.makeTileCaramel();
    this.makeBlockBreakable();
    this.makeBlockEmpty();
    this.makePlayerNormal();
    this.makePlayerLarge();
    this.makeEnemyGummy();
    this.makeEnemyJawbreaker();
    this.makeEnemyJawbreakerStunned();
    this.makeEnemyDrone();
    this.makeEnemyGolem();
    this.makePowerUpGobstopper();
    this.makePowerUpShard();
    this.makePowerUpSyrup();
    this.makeProjectile();
    this.makeCheckpoint();
    this.makeEndFlag();
    this.makeToxicPuddle();
    this.makeBgSky();
    this.makeBgFar();
    this.makeBgMid();
    this.makeParticle();
  }

  private makeTileWafer() {
    const g = this.g();
    // Chocolate bottom layer
    g.fillStyle(COLORS.waferChoc);
    g.fillRect(0, 22, 32, 10);
    // Cream middle layer
    g.fillStyle(COLORS.waferCream);
    g.fillRect(0, 11, 32, 11);
    // Pink top layer
    g.fillStyle(COLORS.waferPink);
    g.fillRect(0, 0, 32, 11);
    // Subtle horizontal dividers
    g.fillStyle(COLORS.waferEdge, 0.6);
    g.fillRect(0, 10, 32, 2);
    g.fillRect(0, 21, 32, 2);
    // Worn texture dots
    g.fillStyle(0xffffff, 0.15);
    for (let x = 3; x < 32; x += 8) {
      g.fillRect(x, 3, 2, 2);
      g.fillRect(x + 2, 14, 2, 2);
      g.fillRect(x - 1, 25, 2, 2);
    }
    g.generateTexture('tile_wafer', 32, 32);
    g.destroy();
  }

  private makeTileToffee() {
    const g = this.g();
    g.fillStyle(COLORS.toffeeBase);
    g.fillRect(0, 0, 32, 32);
    // Darker border
    g.fillStyle(COLORS.toffeeDark);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(0, 0, 2, 32);
    g.fillRect(30, 0, 2, 32);
    // Lighter highlight
    g.fillStyle(COLORS.toffeeLight);
    g.fillRect(2, 2, 28, 4);
    // Crack lines
    g.fillStyle(COLORS.toffeeCrack);
    g.fillRect(8, 6, 1, 16);
    g.fillRect(20, 10, 1, 12);
    g.fillRect(4, 18, 10, 1);
    g.fillRect(22, 22, 6, 1);
    g.generateTexture('tile_toffee', 32, 32);
    g.destroy();
  }

  private makeTileCrumble() {
    const g = this.g();
    g.fillStyle(COLORS.crumbleBase);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(COLORS.crumbleDark);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(0, 0, 2, 32);
    g.fillRect(30, 0, 2, 32);
    // Many crack lines for flaky look
    g.fillStyle(COLORS.crumbleDark);
    g.fillRect(5, 5, 1, 10);
    g.fillRect(12, 8, 1, 14);
    g.fillRect(20, 4, 1, 8);
    g.fillRect(26, 12, 1, 12);
    g.fillRect(3, 16, 12, 1);
    g.fillRect(18, 20, 10, 1);
    g.fillRect(7, 24, 15, 1);
    // Light chips
    g.fillStyle(COLORS.crumbleLight);
    g.fillRect(4, 4, 3, 3);
    g.fillRect(15, 9, 3, 3);
    g.fillRect(24, 5, 3, 3);
    g.generateTexture('tile_crumble', 32, 32);
    g.destroy();
  }

  private makeTileCaramel() {
    const g = this.g();
    g.fillStyle(COLORS.caramelBase);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(COLORS.caramelDark);
    g.fillRect(0, 0, 32, 3);
    g.fillRect(0, 29, 32, 3);
    g.fillStyle(COLORS.caramelLight);
    g.fillRect(0, 3, 32, 5);
    // Drip effect at bottom
    g.fillStyle(COLORS.caramelDrip);
    g.fillRect(4, 28, 4, 4);
    g.fillRect(14, 29, 3, 3);
    g.fillRect(24, 27, 4, 5);
    // Glossy highlight
    g.fillStyle(0xfff0a0, 0.3);
    g.fillRect(3, 4, 6, 2);
    g.fillRect(20, 4, 5, 2);
    g.generateTexture('tile_caramel', 32, 32);
    g.destroy();
  }

  private makeBlockBreakable() {
    const g = this.g();
    g.fillStyle(0x9b4dc0);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x7a3a9a);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(0, 0, 2, 32);
    g.fillRect(30, 0, 2, 32);
    g.fillStyle(0xc47fe0);
    g.fillRect(2, 2, 28, 4);
    g.fillRect(2, 2, 4, 28);
    // ? mark
    g.fillStyle(0xffd700);
    g.fillRect(13, 7, 6, 2);
    g.fillRect(17, 9, 2, 4);
    g.fillRect(13, 13, 6, 2);
    g.fillRect(13, 15, 2, 4);
    g.fillRect(13, 22, 4, 2);
    g.generateTexture('block_breakable', 32, 32);
    g.destroy();
  }

  private makeBlockEmpty() {
    const g = this.g();
    g.fillStyle(0x5a2a80);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x3d1a5c);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(0, 0, 2, 32);
    g.fillRect(30, 0, 2, 32);
    g.generateTexture('block_empty', 32, 32);
    g.destroy();
  }

  private makePlayerNormal() {
    const g = this.g();
    const w = 22, h = 30;
    // Body
    g.fillStyle(0x4a90d9);
    g.fillRect(3, 12, 16, 16);
    // Head
    g.fillStyle(0xf0c080);
    g.fillRect(2, 2, 18, 12);
    // Hair (punk spikes)
    g.fillStyle(0xff4466);
    g.fillRect(4, 0, 4, 4);
    g.fillRect(10, 0, 4, 4);
    g.fillRect(16, 0, 4, 4);
    // Eyes
    g.fillStyle(0x1a1a2e);
    g.fillRect(5, 5, 3, 3);
    g.fillRect(12, 5, 3, 3);
    // Belt
    g.fillStyle(0xd4900a);
    g.fillRect(3, 22, 16, 3);
    // Legs
    g.fillStyle(0x2d3a6b);
    g.fillRect(3, 25, 7, 5);
    g.fillRect(12, 25, 7, 5);
    // Boots
    g.fillStyle(0x1a1a1a);
    g.fillRect(2, 28, 8, 2);
    g.fillRect(11, 28, 8, 2);
    g.generateTexture('player_normal', w, h);
    g.destroy();
  }

  private makePlayerLarge() {
    const g = this.g();
    const w = 36, h = 50;
    g.fillStyle(0x4a90d9);
    g.fillRect(4, 20, 28, 26);
    g.fillStyle(0xf0c080);
    g.fillRect(4, 4, 28, 18);
    g.fillStyle(0xff4466);
    g.fillRect(6, 0, 6, 6);
    g.fillRect(15, 0, 6, 6);
    g.fillRect(24, 0, 6, 6);
    g.fillStyle(0x1a1a2e);
    g.fillRect(8, 8, 5, 5);
    g.fillRect(20, 8, 5, 5);
    g.fillStyle(0xd4900a);
    g.fillRect(4, 36, 28, 4);
    g.fillStyle(0x2d3a6b);
    g.fillRect(4, 40, 12, 7);
    g.fillRect(20, 40, 12, 7);
    g.fillStyle(0x1a1a1a);
    g.fillRect(2, 46, 14, 4);
    g.fillRect(20, 46, 14, 4);
    g.generateTexture('player_large', w, h);
    g.destroy();
  }

  private makeEnemyGummy() {
    const g = this.g();
    // Gummy bear body - red translucent look
    g.fillStyle(0xcc2244);
    g.fillRect(4, 8, 16, 14);
    // Head (round)
    g.fillStyle(0xdd3355);
    g.fillRect(5, 2, 14, 10);
    // Ears
    g.fillRect(3, 1, 5, 5);
    g.fillRect(16, 1, 5, 5);
    // Eyes (white + dark)
    g.fillStyle(0xffffff);
    g.fillRect(7, 4, 4, 4);
    g.fillRect(13, 4, 4, 4);
    g.fillStyle(0x1a1a2e);
    g.fillRect(8, 5, 2, 2);
    g.fillRect(14, 5, 2, 2);
    // Legs
    g.fillStyle(0xaa1133);
    g.fillRect(5, 21, 5, 5);
    g.fillRect(14, 21, 5, 5);
    g.generateTexture('enemy_gummy', 24, 26);
    g.destroy();
  }

  private makeEnemyJawbreaker() {
    const g = this.g();
    // Round shell - concentric color rings
    g.fillStyle(0xe0e0e0);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0xff6688);
    g.fillCircle(14, 14, 10);
    g.fillStyle(0xffd700);
    g.fillCircle(14, 14, 7);
    g.fillStyle(0x44aaff);
    g.fillCircle(14, 14, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(14, 14, 2);
    // Shell highlight
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(9, 9, 4);
    g.generateTexture('enemy_jawbreaker', 28, 28);
    g.destroy();
  }

  private makeEnemyJawbreakerStunned() {
    const g = this.g();
    g.fillStyle(0xa0a0a0);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0xcc8899);
    g.fillCircle(14, 14, 10);
    g.fillStyle(0xaaa020);
    g.fillCircle(14, 14, 7);
    g.fillStyle(0x2266aa);
    g.fillCircle(14, 14, 4);
    // X eyes
    g.fillStyle(0xffffff);
    g.fillRect(8, 10, 4, 2);
    g.fillRect(9, 9, 2, 4);
    g.fillRect(16, 10, 4, 2);
    g.fillRect(17, 9, 2, 4);
    g.generateTexture('enemy_jawbreaker_stunned', 28, 28);
    g.destroy();
  }

  private makeEnemyDrone() {
    const g = this.g();
    // Body
    g.fillStyle(0x446688);
    g.fillRect(6, 8, 20, 12);
    // Wings
    g.fillStyle(0x88ccee, 0.7);
    g.fillRect(0, 4, 10, 6);
    g.fillRect(22, 4, 10, 6);
    // Engine pods
    g.fillStyle(0x223344);
    g.fillRect(4, 6, 6, 4);
    g.fillRect(22, 6, 6, 4);
    // Eye/sensor
    g.fillStyle(0xff3300);
    g.fillRect(12, 10, 4, 4);
    g.fillStyle(0xff6600, 0.5);
    g.fillRect(13, 11, 2, 2);
    // Propeller blur
    g.fillStyle(0xaaddff, 0.3);
    g.fillRect(0, 2, 10, 3);
    g.fillRect(22, 2, 10, 3);
    g.generateTexture('enemy_drone', 32, 20);
    g.destroy();
  }

  private makeEnemyGolem() {
    const g = this.g();
    // Massive blocky body made of caramel
    g.fillStyle(COLORS.caramelBase);
    g.fillRect(4, 14, 32, 30);
    // Head
    g.fillStyle(COLORS.caramelLight);
    g.fillRect(8, 4, 24, 14);
    // Angry eyes
    g.fillStyle(0xff2200);
    g.fillRect(10, 7, 6, 6);
    g.fillRect(24, 7, 6, 6);
    g.fillStyle(0xff6600);
    g.fillRect(11, 8, 3, 3);
    g.fillRect(25, 8, 3, 3);
    // Mouth
    g.fillStyle(0x3d2a00);
    g.fillRect(12, 13, 16, 3);
    g.fillStyle(0xff6600);
    g.fillRect(14, 13, 3, 3);
    g.fillRect(19, 13, 3, 3);
    g.fillRect(24, 13, 3, 3);
    // Arms
    g.fillStyle(COLORS.caramelDark);
    g.fillRect(0, 16, 8, 20);
    g.fillRect(32, 16, 8, 20);
    // Feet
    g.fillStyle(COLORS.caramelDark);
    g.fillRect(4, 40, 12, 6);
    g.fillRect(24, 40, 12, 6);
    g.generateTexture('enemy_golem', 40, 46);
    g.destroy();
  }

  private makePowerUpGobstopper() {
    const g = this.g();
    g.fillStyle(0xff2255);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xffaa00);
    g.fillCircle(12, 12, 8);
    g.fillStyle(0x00cc44);
    g.fillCircle(12, 12, 5);
    g.fillStyle(0x4466ff);
    g.fillCircle(12, 12, 3);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(8, 8, 3);
    g.generateTexture('powerup_gobstopper', 24, 24);
    g.destroy();
  }

  private makePowerUpShard() {
    const g = this.g();
    // Crystal shard shape
    g.fillStyle(0x88ddff);
    g.fillTriangle(10, 0, 20, 10, 8, 28);
    g.fillStyle(0x44bbee);
    g.fillTriangle(10, 0, 2, 14, 8, 28);
    g.fillStyle(0xaaeeff, 0.6);
    g.fillRect(8, 2, 3, 12);
    g.generateTexture('powerup_shard', 20, 28);
    g.destroy();
  }

  private makePowerUpSyrup() {
    const g = this.g();
    // Green ooze splash
    g.fillStyle(0x22cc44);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x55ee66);
    g.fillCircle(12, 12, 7);
    // Splatter droplets
    g.fillStyle(0x22cc44);
    g.fillCircle(22, 6, 4);
    g.fillCircle(4, 18, 3);
    g.fillCircle(20, 20, 3);
    g.fillStyle(0x00aa22);
    g.fillCircle(12, 12, 3);
    g.generateTexture('powerup_syrup', 24, 24);
    g.destroy();
  }

  private makeProjectile() {
    const g = this.g();
    g.fillStyle(0x88ddff);
    g.fillRect(0, 2, 10, 4);
    g.fillStyle(0xaaeeff);
    g.fillRect(2, 1, 6, 6);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(3, 2, 2, 2);
    g.generateTexture('projectile', 10, 8);
    g.destroy();
  }

  private makeCheckpoint() {
    const g = this.g();
    // Pole
    g.fillStyle(0x888888);
    g.fillRect(6, 0, 4, 48);
    // Flag (inactive = grey)
    g.fillStyle(0x666666);
    g.fillRect(10, 4, 16, 12);
    g.generateTexture('checkpoint_off', 28, 48);
    g.destroy();

    const g2 = this.g();
    g2.fillStyle(0x888888);
    g2.fillRect(6, 0, 4, 48);
    // Flag (active = pink/gold)
    g2.fillStyle(0xff69b4);
    g2.fillRect(10, 4, 16, 12);
    g2.fillStyle(0xffd700);
    g2.fillRect(10, 4, 4, 12);
    g2.generateTexture('checkpoint_on', 28, 48);
    g2.destroy();
  }

  private makeEndFlag() {
    const g = this.g();
    g.fillStyle(0xaaaaaa);
    g.fillRect(6, 0, 4, 56);
    g.fillStyle(0xffd700);
    g.fillRect(10, 2, 20, 14);
    g.fillStyle(0xff6600);
    g.fillRect(10, 2, 6, 14);
    // Star on flag
    g.fillStyle(0xffffff);
    g.fillRect(16, 6, 6, 6);
    g.generateTexture('end_flag', 32, 56);
    g.destroy();
  }

  private makeToxicPuddle() {
    const g = this.g();
    g.fillStyle(0x22cc44, 0.75);
    g.fillEllipse(40, 16, 80, 32);
    g.fillStyle(0x55ee66, 0.5);
    g.fillEllipse(40, 14, 60, 20);
    g.fillStyle(0x00ff44, 0.3);
    g.fillEllipse(40, 12, 30, 10);
    g.generateTexture('toxic_puddle', 80, 32);
    g.destroy();
  }

  private makeBgSky() {
    const g = this.g();
    // Deep purple-black gradient (dark candy sky)
    for (let y = 0; y < 560; y += 4) {
      const t = y / 560;
      const r = Math.floor(13 + t * 20);
      const gv = Math.floor(5 + t * 8);
      const b = Math.floor(20 + t * 30);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gv, b));
      g.fillRect(0, y, 800, 4);
    }
    // Stars
    g.fillStyle(0xffffff);
    const stars = [
      [40, 30], [120, 60], [200, 20], [300, 45], [420, 15], [530, 55],
      [660, 25], [750, 40], [80, 90], [350, 80], [500, 100], [700, 70],
      [170, 130], [450, 120], [620, 140], [25, 150], [280, 160], [580, 130],
    ];
    for (const [sx, sy] of stars) {
      g.fillRect(sx, sy, 2, 2);
    }
    g.generateTexture('bg_sky', 800, 560);
    g.destroy();
  }

  private makeBgFar() {
    // Distant ruined candy skyline silhouettes
    const g = this.g();
    g.fillStyle(0x1e0838);
    // Ruined lollipop towers
    const buildings = [
      { x: 20, w: 40, h: 180 }, { x: 80, w: 30, h: 140 }, { x: 130, w: 60, h: 200 },
      { x: 210, w: 35, h: 160 }, { x: 260, w: 50, h: 220 }, { x: 330, w: 40, h: 130 },
      { x: 390, w: 70, h: 180 }, { x: 480, w: 45, h: 200 }, { x: 545, w: 35, h: 150 },
      { x: 600, w: 55, h: 190 }, { x: 670, w: 30, h: 170 }, { x: 720, w: 60, h: 210 },
    ];
    for (const b of buildings) {
      g.fillRect(b.x, 560 - b.h, b.w, b.h);
      // Ruined top
      g.fillRect(b.x + b.w / 4, 560 - b.h - 20, b.w / 2, 20);
      // Lollipop round top (candy)
      g.fillStyle(0x2a0a4a);
      g.fillCircle(b.x + b.w / 2, 560 - b.h - 10, 15);
      g.fillStyle(0x1e0838);
    }
    g.generateTexture('bg_far', 800, 560);
    g.destroy();
  }

  private makeBgMid() {
    // Closer ruined platforms/debris
    const g = this.g();
    g.fillStyle(0x2a1040, 0.8);
    const chunks = [
      { x: 0, y: 420, w: 100, h: 20 }, { x: 150, y: 400, w: 80, h: 20 },
      { x: 280, y: 430, w: 120, h: 25 }, { x: 450, y: 390, w: 90, h: 20 },
      { x: 580, y: 415, w: 110, h: 22 }, { x: 710, y: 435, w: 90, h: 18 },
    ];
    for (const c of chunks) {
      g.fillRect(c.x, c.y, c.w, c.h);
    }
    // Ruined candy pillar stumps
    g.fillStyle(0x3d1a5c);
    g.fillRect(50, 300, 20, 120);
    g.fillRect(350, 280, 25, 150);
    g.fillRect(640, 310, 20, 130);
    g.generateTexture('bg_mid', 800, 560);
    g.destroy();
  }

  private makeParticle() {
    const g = this.g();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);
    g.destroy();
  }
}
