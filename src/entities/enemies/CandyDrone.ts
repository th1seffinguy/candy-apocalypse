import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { EnemyType } from '../../types';
import { ENEMY } from '../../config';

export class CandyDrone extends Enemy {
  private patrolLeft: number;
  private patrolRight: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_drone', EnemyType.CandyDrone, 1, ENEMY.droneSpeed);
    this.patrolLeft = x - ENEMY.dronePatrolRange;
    this.patrolRight = x + ENEMY.dronePatrolRange;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(28, 16);
    body.setOffset(2, 2);
    // Slight vertical hover oscillation handled via tween
    scene.tweens.add({
      targets: this,
      y: y + 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  onStomp(_scene: Phaser.Scene): boolean {
    // Cannot be stomped — player should take damage instead
    // Return false so caller knows stomp was rejected
    return false;
  }

  get canBeStopped(): boolean { return false; }

  protected updateAI(body: Phaser.Physics.Arcade.Body) {
    if (this.x <= this.patrolLeft) this.moveDir = 1;
    if (this.x >= this.patrolRight) this.moveDir = -1;
    body.setVelocityX(this.speed * this.moveDir);
  }
}
