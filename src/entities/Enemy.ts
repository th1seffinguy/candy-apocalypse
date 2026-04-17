import Phaser from 'phaser';
import { EnemyType } from '../types';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly enemyType: EnemyType;
  protected hp: number;
  protected maxHp: number;
  protected speed: number;
  protected moveDir: number = 1; // 1 = right, -1 = left
  protected alive: boolean = true;
  protected stunned: boolean = false;
  protected stunnedUntil: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: EnemyType, hp: number, speed: number) {
    super(scene, x, y, texture);
    this.enemyType = type;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setup();
  }

  protected setup() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(800);
    body.setCollideWorldBounds(false);
  }

  isAlive(): boolean { return this.alive; }
  isStunned(): boolean { return this.stunned; }

  // Returns true if enemy was killed, false if stunned/damaged
  abstract onStomp(scene: Phaser.Scene): boolean;

  onProjectileHit(): boolean {
    this.hp--;
    this.flash();
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  protected die() {
    this.alive = false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    body.setGravityY(600);
    body.setAllowGravity(true);
    this.setAlpha(0.7);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 30,
      duration: 400,
      onComplete: () => this.destroy(),
    });
  }

  protected flash() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 2,
    });
  }

  protected spawnParticles(tint: number) {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle').setTint(tint);
      this.scene.tweens.add({
        targets: p,
        x: this.x + Phaser.Math.Between(-40, 40),
        y: this.y + Phaser.Math.Between(-40, 20),
        alpha: 0,
        duration: Phaser.Math.Between(250, 450),
        onComplete: () => p.destroy(),
      });
    }
  }

  update(time: number) {
    if (!this.alive) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.stunned && time >= this.stunnedUntil) {
      this.stunned = false;
      this.onStunEnd();
    }

    if (!this.stunned) {
      this.updateAI(body);
    }

    // Flip to face movement direction
    this.setFlipX(this.moveDir < 0);
  }

  protected updateAI(body: Phaser.Physics.Arcade.Body) {
    // Reverse on wall collision
    if (body.blocked.left) this.moveDir = 1;
    if (body.blocked.right) this.moveDir = -1;
    body.setVelocityX(this.speed * this.moveDir);
  }

  protected onStunEnd() {
    // override in subclasses
  }
}
