import Phaser from 'phaser';
import { SceneKey, GameRegistryData, PowerUpType } from '../types';
import { GAME_WIDTH, PLAYER } from '../config';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private powerUpText!: Phaser.GameObjects.Text;
  private shardsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKey.UI });
  }

  create() {
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    // Health bar background
    const hbg = this.add.graphics();
    hbg.fillStyle(0x000000, 0.5);
    hbg.fillRect(8, 8, 104, 14);

    this.healthBar = this.add.graphics();

    // Labels
    this.add.text(8, 26, 'HP', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ff69b4',
    });

    this.livesText = this.add.text(8, 36, '♥ x3', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff4466',
    });

    this.scoreText = this.add.text(GAME_WIDTH - 8, 8, 'SCORE: 0', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffd700',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(GAME_WIDTH / 2, 8, 'LOLLIPOP RUINS', {
      fontFamily: 'monospace', fontSize: '10px', color: '#aa7799',
    }).setOrigin(0.5, 0);

    this.powerUpText = this.add.text(8, 50, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffd700',
    });

    this.shardsText = this.add.text(8, 62, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#88ddff',
    });

    // Poll registry for updates
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: this.syncFromRegistry,
      callbackScope: this,
    });
  }

  private syncFromRegistry() {
    const gameScene = this.scene.get(SceneKey.Game);
    if (!gameScene || !gameScene.scene.isActive()) return;

    const reg = this.game.registry;
    const health = reg.get('health') as number ?? PLAYER.maxHealth;
    const maxHealth = reg.get('maxHealth') as number ?? PLAYER.maxHealth;
    const lives = reg.get('lives') as number ?? PLAYER.maxLives;
    const score = reg.get('score') as number ?? 0;
    const powerUp = reg.get('activePowerUp') as PowerUpType | null;
    const shards = reg.get('shards') as number ?? 0;
    const levelName = reg.get('levelName') as string ?? '';

    this.drawHealthBar(health, maxHealth);
    this.livesText.setText(`♥ x${lives}`);
    this.scoreText.setText(`SCORE: ${score}`);
    if (levelName) this.levelText.setText(levelName);

    if (powerUp === PowerUpType.Gobstopper) {
      this.powerUpText.setText('⬤ GOBSTOPPER').setColor('#ff69b4');
    } else if (powerUp === PowerUpType.RockCandyShard) {
      this.powerUpText.setText(`◆ SHARDS: ${shards}`).setColor('#88ddff');
      this.shardsText.setText('');
    } else {
      this.powerUpText.setText('');
      this.shardsText.setText('');
    }
  }

  private drawHealthBar(health: number, max: number) {
    this.healthBar.clear();
    const barW = 100;
    const filled = Math.max(0, (health / max) * barW);
    const color = health > max / 2 ? 0x44ee44 : health > max / 4 ? 0xffd700 : 0xff2244;
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(9, 9, filled, 12);
  }
}
