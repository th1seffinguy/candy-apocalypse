import Phaser from 'phaser';
import { SizeState, PowerUpType, PlayerInputs } from '../types';
import { PHYSICS, PLAYER, GAME_HEIGHT } from '../config';
import { Projectile } from './Projectile';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: number;
  lives: number;
  score: number;
  sizeState: SizeState = SizeState.Normal;
  activeShards: number = 0;
  activePowerUp: PowerUpType | null = null;

  private jumpCount: number = 0;
  private isInvincible: boolean = false;
  private invincibleUntil: number = 0;
  private facingRight: boolean = true;

  // Projectile group reference, set by GameScene
  projectileGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_normal');
    this.health = PLAYER.maxHealth;
    this.lives = PLAYER.maxLives;
    this.score = 0;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.initBody();
  }

  private initBody() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(PHYSICS.gravity);
    body.setMaxVelocityY(900);
    body.setCollideWorldBounds(false);
    this.setBodySize(PLAYER.normalWidth, PLAYER.normalHeight);
  }

  private setBodySize(w: number, h: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(w, h);
    body.setOffset((this.width - w) / 2, this.height - h);
  }

  update(time: number, inputs: PlayerInputs) {
    if (this.health <= 0) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // Reset jump counter on landing
    if (onGround) this.jumpCount = 0;

    // Invincibility blink
    if (this.isInvincible) {
      this.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
      if (time >= this.invincibleUntil) {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    }

    // Horizontal movement
    const speed = inputs.onCaramel
      ? PHYSICS.playerSpeed * PHYSICS.caramelSpeedMultiplier
      : PHYSICS.playerSpeed;

    if (inputs.left) {
      body.setVelocityX(-speed);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (inputs.right) {
      body.setVelocityX(speed);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      // Decelerate
      body.setVelocityX(body.velocity.x * 0.7);
      if (Math.abs(body.velocity.x) < 5) body.setVelocityX(0);
    }

    // Jump
    if (inputs.jumpJustDown && this.jumpCount < 2) {
      const vel = this.jumpCount === 0
        ? PHYSICS.playerJumpVel
        : PHYSICS.playerDoubleJumpVel;
      body.setVelocityY(vel);
      this.jumpCount++;
    }

    // Attack (throw shard)
    if (inputs.attackJustDown) {
      this.throwShard();
    }

    // Fall death
    if (this.y > GAME_HEIGHT + 100) {
      this.onFallDeath();
    }
  }

  onStomp(enemyKilled: boolean) {
    const vel = enemyKilled ? PHYSICS.stompBounceVel : PHYSICS.stompBounceVel * 0.7;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(vel);
    this.jumpCount = 1; // allow double-jump after stomp
  }

  takeDamage(scene: Phaser.Scene) {
    if (this.isInvincible) return;

    if (this.sizeState === SizeState.Large) {
      this.shrink();
      this.startInvincibility(scene.time.now);
      return;
    }

    this.health--;
    this.startInvincibility(scene.time.now);
    scene.cameras.main.shake(200, 0.01);

    if (this.health <= 0) {
      this.onDie(scene);
    }
  }

  private startInvincibility(now: number) {
    this.isInvincible = true;
    this.invincibleUntil = now + PLAYER.invincibilityMs;
  }

  private onDie(scene: Phaser.Scene) {
    this.lives--;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -300);
    body.setAllowGravity(true);
    this.setTint(0xff0000);

    scene.time.delayedCall(800, () => {
      if (this.lives > 0) {
        // Respawn handled by GameScene via registry event
        scene.events.emit('player-died');
      } else {
        scene.events.emit('game-over');
      }
    });
  }

  private onFallDeath() {
    if (this.health <= 0) return;
    this.health = 0;
    this.onDie(this.scene);
  }

  applyGobstopper() {
    this.sizeState = SizeState.Large;
    this.activePowerUp = PowerUpType.Gobstopper;
    this.setTexture('player_large');
    this.setBodySize(PLAYER.largeWidth, PLAYER.largeHeight);
    this.setTint(0xffddee);
    this.scene.tweens.add({
      targets: this, scaleX: 1.1, scaleY: 1.1,
      duration: 200, yoyo: true, repeat: 1,
      onComplete: () => this.clearTint(),
    });
  }

  addShards(count: number) {
    this.activeShards = Math.min(this.activeShards + count, PLAYER.maxShards);
    this.activePowerUp = PowerUpType.RockCandyShard;
  }

  private throwShard() {
    if (this.activeShards <= 0 || !this.projectileGroup) return;
    this.activeShards--;
    if (this.activeShards === 0) this.activePowerUp = null;

    const offsetX = this.facingRight ? 20 : -20;
    const proj = new Projectile(this.scene, this.x + offsetX, this.y, this.facingRight);
    this.projectileGroup.add(proj);
  }

  private shrink() {
    this.sizeState = SizeState.Normal;
    this.activePowerUp = null;
    this.setTexture('player_normal');
    this.setBodySize(PLAYER.normalWidth, PLAYER.normalHeight);
  }

  isFacingRight(): boolean { return this.facingRight; }
  getIsInvincible(): boolean { return this.isInvincible; }
}
