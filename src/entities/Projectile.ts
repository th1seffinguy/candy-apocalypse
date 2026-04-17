import Phaser from 'phaser';
import { PHYSICS } from '../config';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, facingRight: boolean) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(facingRight ? PHYSICS.projectileSpeed : -PHYSICS.projectileSpeed);
    body.setCollideWorldBounds(false);

    this.setFlipX(!facingRight);

    // Destroy after 1.8s if it hits nothing
    scene.time.delayedCall(1800, () => { if (this.active) this.destroyProjectile(); });
  }

  destroyProjectile() {
    if (!this.active) return;
    // Tiny impact flash
    const flash = this.scene.add.rectangle(this.x, this.y, 8, 8, 0x88ddff, 0.8);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 120,
      onComplete: () => flash.destroy(),
    });
    this.destroy();
  }
}
