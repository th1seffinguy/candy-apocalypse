import Phaser from 'phaser';

export interface CheckpointData {
  x: number;
  y: number;
  activated: boolean;
  sprite: Phaser.Physics.Arcade.Image;
}

export class CheckpointSystem {
  private scene: Phaser.Scene;
  private checkpoints: CheckpointData[] = [];
  private lastCheckpointX: number = 0;
  private lastCheckpointY: number = 0;

  constructor(scene: Phaser.Scene, spawnX: number, spawnY: number) {
    this.scene = scene;
    this.lastCheckpointX = spawnX;
    this.lastCheckpointY = spawnY;
  }

  addCheckpoint(x: number, y: number): Phaser.Physics.Arcade.Image {
    const sprite = this.scene.physics.add.staticImage(x, y, 'checkpoint_off');
    sprite.setOrigin(0.5, 1);
    (sprite.body as Phaser.Physics.Arcade.StaticBody).setSize(16, 48);

    this.checkpoints.push({ x, y, activated: false, sprite });
    return sprite;
  }

  activate(sprite: Phaser.Physics.Arcade.Image) {
    const cp = this.checkpoints.find(c => c.sprite === sprite);
    if (!cp || cp.activated) return;

    cp.activated = true;
    cp.sprite.setTexture('checkpoint_on');
    this.lastCheckpointX = cp.x;
    this.lastCheckpointY = cp.y - 60;

    // Flash effect
    this.scene.tweens.add({
      targets: cp.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3,
    });
  }

  getRespawnPoint(): { x: number; y: number } {
    return { x: this.lastCheckpointX, y: this.lastCheckpointY };
  }

  getStaticImages(): Phaser.Physics.Arcade.Image[] {
    return this.checkpoints.map(c => c.sprite);
  }
}
