import Phaser from 'phaser';
import { PowerUpType } from '../types';

const TEXTURE_MAP: Record<PowerUpType, string> = {
  [PowerUpType.Gobstopper]: 'powerup_gobstopper',
  [PowerUpType.RockCandyShard]: 'powerup_shard',
  [PowerUpType.ToxicSyrup]: 'powerup_syrup',
};

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  readonly powerUpType: PowerUpType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, TEXTURE_MAP[type]);
    this.powerUpType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(600);
    body.setCollideWorldBounds(false);

    // Floating bob
    scene.tweens.add({
      targets: this,
      y: y + 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow pulse
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  collect() {
    // Particles on collect
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle').setTint(0xffd700);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Phaser.Math.Between(-50, 50),
        y: this.y + Phaser.Math.Between(-50, 10),
        alpha: 0,
        duration: 350,
        onComplete: () => p.destroy(),
      });
    }
    this.destroy();
  }
}
