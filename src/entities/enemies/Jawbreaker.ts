import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { EnemyType } from '../../types';
import { ENEMY } from '../../config';

export class Jawbreaker extends Enemy {
  private stomped: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_jawbreaker', EnemyType.Jawbreaker, 2, ENEMY.jawbreakerSpeed);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 26);
    body.setOffset(1, 1);
    this.moveDir = Math.random() > 0.5 ? 1 : -1;
  }

  onStomp(_scene: Phaser.Scene): boolean {
    if (!this.stomped) {
      // First stomp: stun
      this.stomped = true;
      this.stunned = true;
      this.stunnedUntil = this.scene.time.now + 3500;
      this.setTexture('enemy_jawbreaker_stunned');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(0);
      this.flash();
      return false;
    } else {
      // Second stomp while stunned: kill
      this.spawnParticles(0xe0e0e0);
      this.die();
      return true;
    }
  }

  protected onStunEnd() {
    this.stomped = false;
    this.setTexture('enemy_jawbreaker');
  }

  protected updateAI(body: Phaser.Physics.Arcade.Body) {
    if (this.stunned) {
      body.setVelocityX(0);
      return;
    }
    super.updateAI(body);
  }
}
