import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export interface MobileInputState {
  left: boolean;
  right: boolean;
  jump: boolean;    // just-pressed this frame
  attack: boolean;  // just-pressed this frame
}

const JOYSTICK_RADIUS = 52;
const DEAD_ZONE = 0.2;

export class MobileInput {
  private scene: Phaser.Scene;
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickThumb!: Phaser.GameObjects.Arc;
  private jumpBtn!: Phaser.GameObjects.Arc;
  private attackBtn!: Phaser.GameObjects.Arc;

  private joyCenterX = 90;
  private joyCenterY = GAME_HEIGHT - 80;
  private joyPointerId: number = -1;
  private joyDx: number = 0;
  private joyDy: number = 0;

  private jumpPressed = false;
  private attackPressed = false;
  private jumpConsumed = false;
  private attackConsumed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.buildUI();
    this.registerPointers();
  }

  private buildUI() {
    const cam = this.scene.cameras.main;
    const scrollX = cam.scrollX;
    const scrollY = cam.scrollY;

    // Joystick base
    this.joystickBase = this.scene.add.circle(
      this.joyCenterX + scrollX,
      this.joyCenterY + scrollY,
      JOYSTICK_RADIUS,
      0xffffff, 0.15
    ).setDepth(100).setScrollFactor(0);

    this.joystickBase.setStrokeStyle(2, 0xffffff, 0.4);

    // Joystick thumb
    this.joystickThumb = this.scene.add.circle(
      this.joyCenterX + scrollX,
      this.joyCenterY + scrollY,
      20,
      0xffffff, 0.55
    ).setDepth(101).setScrollFactor(0);

    // Jump button (upper right)
    this.jumpBtn = this.scene.add.circle(
      GAME_WIDTH - 80, GAME_HEIGHT - 100,
      28, 0xff69b4, 0.55
    ).setDepth(100).setScrollFactor(0);
    this.jumpBtn.setStrokeStyle(2, 0xffffff, 0.6);

    this.scene.add.text(GAME_WIDTH - 80, GAME_HEIGHT - 100, 'JUMP', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    // Attack button (lower right)
    this.attackBtn = this.scene.add.circle(
      GAME_WIDTH - 140, GAME_HEIGHT - 55,
      24, 0x88ddff, 0.55
    ).setDepth(100).setScrollFactor(0);
    this.attackBtn.setStrokeStyle(2, 0xffffff, 0.6);

    this.scene.add.text(GAME_WIDTH - 140, GAME_HEIGHT - 55, 'ATK', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
  }

  private registerPointers() {
    this.scene.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const x = ptr.x;
      const y = ptr.y;

      // Joystick zone: left half
      if (x < GAME_WIDTH / 2 && this.joyPointerId === -1) {
        this.joyPointerId = ptr.id;
        this.updateJoy(x, y);
      }

      // Jump button
      const jx = GAME_WIDTH - 80, jy = GAME_HEIGHT - 100;
      if (Math.hypot(x - jx, y - jy) < 44) {
        this.jumpPressed = true;
        this.jumpConsumed = false;
      }

      // Attack button
      const ax = GAME_WIDTH - 140, ay = GAME_HEIGHT - 55;
      if (Math.hypot(x - ax, y - ay) < 40) {
        this.attackPressed = true;
        this.attackConsumed = false;
      }
    });

    this.scene.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id === this.joyPointerId) {
        this.updateJoy(ptr.x, ptr.y);
      }
    });

    this.scene.input.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id === this.joyPointerId) {
        this.joyPointerId = -1;
        this.joyDx = 0;
        this.joyDy = 0;
        this.joystickThumb.setPosition(this.joyCenterX, this.joyCenterY);
      }

      const x = ptr.x;
      const y = ptr.y;
      const jx = GAME_WIDTH - 80, jy = GAME_HEIGHT - 100;
      if (Math.hypot(x - jx, y - jy) < 44) this.jumpPressed = false;
      const ax = GAME_WIDTH - 140, ay = GAME_HEIGHT - 55;
      if (Math.hypot(x - ax, y - ay) < 40) this.attackPressed = false;
    });
  }

  private updateJoy(px: number, py: number) {
    const dx = px - this.joyCenterX;
    const dy = py - this.joyCenterY;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, JOYSTICK_RADIUS);
    this.joyDx = (dx / dist) * (clamped / JOYSTICK_RADIUS);
    this.joyDy = (dy / dist) * (clamped / JOYSTICK_RADIUS);

    const thumbX = this.joyCenterX + (dx / dist) * clamped;
    const thumbY = this.joyCenterY + (dy / dist) * clamped;
    this.joystickThumb.setPosition(thumbX, thumbY);
  }

  getState(): MobileInputState {
    const jumpJustDown = this.jumpPressed && !this.jumpConsumed;
    const attackJustDown = this.attackPressed && !this.attackConsumed;
    if (jumpJustDown) this.jumpConsumed = true;
    if (attackJustDown) this.attackConsumed = true;

    // Jump also triggered by joystick swipe up
    const joyJump = this.joyDy < -0.6;

    return {
      left: this.joyDx < -DEAD_ZONE,
      right: this.joyDx > DEAD_ZONE,
      jump: jumpJustDown || joyJump,
      attack: attackJustDown,
    };
  }
}
