import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { EnemyType } from '../../types';
import { ENEMY } from '../../config';

export class CaramelGolem extends Enemy {
  private hitsLeft: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_golem', EnemyType.CaramelGolem, ENEMY.golemMaxHp, ENEMY.golemSpeed);
    this.hitsLeft = ENEMY.golemMaxHp;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 42);
    body.setOffset(2, 4);
  }

  onStomp(_scene: Phaser.Scene): boolean {
    this.hitsLeft--;
    this.hp = this.hitsLeft;
    this.flash();
    this.spawnParticles(ENEMY.golemSpeed > 0 ? 0xd4900a : 0x8b5e00);

    // Knockback + brief speed boost rage
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-180);
    this.stunned = true;
    this.stunnedUntil = this.scene.time.now + 600;

    // After hit: rage → faster
    this.scene.time.delayedCall(600, () => {
      if (this.alive) this.speed = ENEMY.golemSpeed + (ENEMY.golemMaxHp - this.hitsLeft) * 20;
    });

    if (this.hitsLeft <= 0) {
      this.spawnParticles(0xffd700);
      this.spawnParticles(0xd4900a);
      this.die();
      return true;
    }
    return false;
  }

  onProjectileHit(): boolean {
    return this.onStomp(this.scene);
  }

  protected updateAI(body: Phaser.Physics.Arcade.Body) {
    if (this.stunned) {
      body.setVelocityX(0);
      return;
    }
    // Walk toward player (use a basic aggro check)
    if (body.blocked.left) this.moveDir = 1;
    if (body.blocked.right) this.moveDir = -1;
    body.setVelocityX(this.speed * this.moveDir);
  }
}
