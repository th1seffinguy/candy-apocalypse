import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { EnemyType } from '../../types';
import { ENEMY } from '../../config';

export class GummyBearGrunt extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_gummy', EnemyType.GummyBear, 1, ENEMY.gummySpeed);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 22);
    body.setOffset(2, 4);
    // Random start direction
    this.moveDir = Math.random() > 0.5 ? 1 : -1;
  }

  onStomp(_scene: Phaser.Scene): boolean {
    this.spawnParticles(0xcc2244);
    this.die();
    return true;
  }
}
