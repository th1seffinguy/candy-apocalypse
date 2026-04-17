import Phaser from 'phaser';
import { SceneKey, PlatformType, EnemyType, PowerUpType, SizeState, LevelData, LevelObjectData } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, SCORE } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { GummyBearGrunt } from '../entities/enemies/GummyBearGrunt';
import { Jawbreaker } from '../entities/enemies/Jawbreaker';
import { CandyDrone } from '../entities/enemies/CandyDrone';
import { CaramelGolem } from '../entities/enemies/CaramelGolem';
import { PowerUp } from '../entities/PowerUp';
import { Projectile } from '../entities/Projectile';
import { MobileInput } from '../systems/MobileInput';
import { CheckpointSystem } from '../systems/CheckpointSystem';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private blockGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private powerUpGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private toxicPuddleGroup!: Phaser.Physics.Arcade.StaticGroup;

  private checkpointSystem!: CheckpointSystem;
  private endFlagSprite!: Phaser.Physics.Arcade.Image;

  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    z: Phaser.Input.Keyboard.Key;
    j: Phaser.Input.Keyboard.Key;
  };

  private jumpKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private mobileInput: MobileInput | null = null;
  private isMobile: boolean = false;

  private onCaramelThisFrame: boolean = false;
  private levelData!: LevelData;
  private worldWidth: number = 6400;
  private worldHeight: number = 560;
  private isGameOver: boolean = false;
  private levelComplete: boolean = false;

  constructor() {
    super({ key: SceneKey.Game });
  }

  init() {
    this.isGameOver = false;
    this.levelComplete = false;
  }

  create() {
    this.levelData = this.cache.json.get('level1') as LevelData;

    // Read level properties
    this.worldWidth = this.getLevelProp('worldWidth') as number ?? 6400;
    this.worldHeight = this.getLevelProp('worldHeight') as number ?? 560;

    // Physics world
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight + 200);

    // Backgrounds (parallax)
    this.createBackgrounds();

    // Physics groups
    this.platforms = this.physics.add.staticGroup();
    this.blockGroup = this.physics.add.staticGroup();
    this.enemyGroup = this.physics.add.group({ runChildUpdate: false });
    this.powerUpGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();
    this.toxicPuddleGroup = this.physics.add.staticGroup();

    // Parse level
    let spawnX = 96, spawnY = 496;
    for (const layer of this.levelData.layers) {
      if (layer.name === 'Platforms')    this.spawnPlatforms(layer.objects);
      if (layer.name === 'PowerUpBlocks') this.spawnBlocks(layer.objects);
      if (layer.name === 'Enemies')      this.spawnEnemies(layer.objects);
      if (layer.name === 'Spawns') {
        const sp = layer.objects.find(o => o.name === 'PlayerSpawn');
        if (sp) { spawnX = sp.x; spawnY = sp.y; }
        this.processSpawns(layer.objects);
      }
    }

    // Player
    this.player = new Player(this, spawnX, spawnY);
    this.player.projectileGroup = this.projectileGroup;

    // Camera
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(80, 60);

    // Input
    this.setupInput();

    // Colliders
    this.setupColliders();

    // HUD
    this.scene.launch(SceneKey.UI);

    // Registry init
    this.updateRegistry();

    // Game events
    this.events.on('player-died', this.handlePlayerDied, this);
    this.events.on('game-over', this.handleGameOver, this);
  }

  update(time: number, _delta: number) {
    if (this.isGameOver || this.levelComplete) return;

    this.onCaramelThisFrame = false;

    // Build inputs
    const inputs = this.gatherInputs(time);

    // Player update
    this.player.update(time, inputs);

    // Enemy updates
    this.enemyGroup.getChildren().forEach(obj => {
      (obj as Enemy).update(time);
    });

    // Projectile cleanup (out of world bounds)
    this.projectileGroup.getChildren().forEach(obj => {
      const proj = obj as Projectile;
      if (proj.x < 0 || proj.x > this.worldWidth) proj.destroyProjectile();
    });

    // Parallax update
    this.updateParallax();

    // Sync HUD
    this.updateRegistry();
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  private setupInput() {
    const kb = this.input.keyboard!;
    this.keys = {
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      a:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      z:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      j:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
    };
    this.jumpKey   = this.keys.space;
    this.attackKey = this.keys.z;

    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.isMobile) {
      this.mobileInput = new MobileInput(this);
    }
  }

  private gatherInputs(time: number): import('../types').PlayerInputs {
    const left  = this.keys.left.isDown  || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;
    const jumpJD = Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
                   Phaser.Input.Keyboard.JustDown(this.keys.w) ||
                   Phaser.Input.Keyboard.JustDown(this.keys.up);
    const atkJD = Phaser.Input.Keyboard.JustDown(this.attackKey) ||
                  Phaser.Input.Keyboard.JustDown(this.keys.j);

    if (this.mobileInput) {
      const m = this.mobileInput.getState();
      return {
        left:          left  || m.left,
        right:         right || m.right,
        jumpJustDown:  jumpJD || m.jump,
        attackJustDown: atkJD || m.attack,
        onCaramel:     this.onCaramelThisFrame,
      };
    }

    return { left, right, jumpJustDown: jumpJD, attackJustDown: atkJD, onCaramel: this.onCaramelThisFrame };
  }

  // ─── Level Loading ────────────────────────────────────────────────────────

  private spawnPlatforms(objects: LevelObjectData[]) {
    for (const obj of objects) {
      const type = (this.getObjProp(obj, 'platformType') as PlatformType) ?? PlatformType.Toffee;
      this.createPlatform(obj.x, obj.y, obj.width, obj.height, type);
    }
  }

  private createPlatform(x: number, y: number, w: number, h: number, type: PlatformType) {
    const sprite = this.platforms.create(
      x + w / 2, y + h / 2, `tile_${type}`
    ) as Phaser.Physics.Arcade.Image;
    sprite.setDisplaySize(w, h);
    sprite.setData('platformType', type);
    sprite.setData('crumbling', false);
    sprite.refreshBody();
  }

  private spawnBlocks(objects: LevelObjectData[]) {
    for (const obj of objects) {
      const puType = this.getObjProp(obj, 'powerUpType') as PowerUpType;
      const block = this.blockGroup.create(
        obj.x + 16, obj.y + 16, 'block_breakable'
      ) as Phaser.Physics.Arcade.Image;
      block.setData('powerUpType', puType);
      block.setData('used', false);
      block.refreshBody();
    }
  }

  private spawnEnemies(objects: LevelObjectData[]) {
    for (const obj of objects) {
      const type = this.getObjProp(obj, 'enemyType') as EnemyType;
      let enemy: Enemy | null = null;

      switch (type) {
        case EnemyType.GummyBear:    enemy = new GummyBearGrunt(this, obj.x + obj.width / 2, obj.y); break;
        case EnemyType.Jawbreaker:   enemy = new Jawbreaker(this, obj.x + obj.width / 2, obj.y); break;
        case EnemyType.CandyDrone:   enemy = new CandyDrone(this, obj.x + obj.width / 2, obj.y); break;
        case EnemyType.CaramelGolem: enemy = new CaramelGolem(this, obj.x + obj.width / 2, obj.y); break;
      }
      if (enemy) this.enemyGroup.add(enemy);
    }
  }

  private processSpawns(objects: LevelObjectData[]) {
    let spawnX = 96, spawnY = 496;
    const spawnObj = objects.find(o => o.name === 'PlayerSpawn');
    if (spawnObj) { spawnX = spawnObj.x; spawnY = spawnObj.y; }

    this.checkpointSystem = new CheckpointSystem(this, spawnX, spawnY - 30);

    for (const obj of objects) {
      if (obj.name === 'Checkpoint') {
        this.checkpointSystem.addCheckpoint(obj.x + obj.width / 2, obj.y);
      }
      if (obj.name === 'EndFlag') {
        this.endFlagSprite = this.physics.add.staticImage(
          obj.x + obj.width / 2, obj.y, 'end_flag'
        );
        this.endFlagSprite.setOrigin(0.5, 1);
        (this.endFlagSprite.body as Phaser.Physics.Arcade.StaticBody).setSize(16, 48);
        this.endFlagSprite.refreshBody();
      }
    }
  }

  // ─── Colliders ────────────────────────────────────────────────────────────

  private setupColliders() {
    // Player ↔ platforms
    this.physics.add.collider(
      this.player, this.platforms,
      this.onPlayerPlatformCollide as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Player ↔ breakable blocks
    this.physics.add.collider(
      this.player, this.blockGroup,
      this.onPlayerBlockCollide as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Player ↔ enemies
    this.physics.add.overlap(
      this.player, this.enemyGroup,
      this.onPlayerEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Player ↔ power-ups
    this.physics.add.overlap(
      this.player, this.powerUpGroup,
      this.onPlayerPowerUpOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Player ↔ checkpoints
    this.physics.add.overlap(
      this.player,
      this.checkpointSystem.getStaticImages(),
      this.onCheckpointOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Player ↔ end flag
    if (this.endFlagSprite) {
      this.physics.add.overlap(
        this.player, this.endFlagSprite,
        this.onEndFlagOverlap, undefined, this
      );
    }

    // Enemies ↔ platforms
    this.physics.add.collider(this.enemyGroup, this.platforms);

    // Power-ups ↔ platforms
    this.physics.add.collider(this.powerUpGroup, this.platforms);

    // Projectiles ↔ enemies
    this.physics.add.overlap(
      this.projectileGroup, this.enemyGroup,
      this.onProjectileEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Projectiles ↔ platforms (stop on collision)
    this.physics.add.collider(
      this.projectileGroup, this.platforms,
      this.onProjectilePlatformCollide as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );

    // Toxic puddles ↔ enemies
    this.physics.add.overlap(
      this.toxicPuddleGroup, this.enemyGroup,
      this.onPuddleEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined, this
    );
  }

  // ─── Collision Callbacks ──────────────────────────────────────────────────

  private onPlayerPlatformCollide(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    platformObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const platform = platformObj as Phaser.Physics.Arcade.Image;
    const body = player.body as Phaser.Physics.Arcade.Body;
    const type = platform.getData('platformType') as PlatformType;

    if (body.blocked.down) {
      if (type === PlatformType.Caramel) {
        this.onCaramelThisFrame = true;
      }
      if (type === PlatformType.Crumble) {
        this.startCrumble(platform);
      }
    }
  }

  private onPlayerBlockCollide(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    blockObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const block = blockObj as Phaser.Physics.Arcade.Image;
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.up && !block.getData('used')) {
      this.breakBlock(block);
    }
  }

  private onPlayerEnemyOverlap(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const enemy = enemyObj as Enemy;

    if (!enemy.isAlive()) return;

    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

    // Stomp detection: player falling, feet near top of enemy
    const playerFeet = playerBody.bottom;
    const enemyTop = enemyBody.top;
    const fallingFast = playerBody.velocity.y > 30;
    const overhead = playerFeet - enemyTop <= 14;

    // CandyDrone cannot be stomped
    const canStomp = enemy.enemyType !== EnemyType.CandyDrone;

    if (fallingFast && overhead && canStomp) {
      const killed = enemy.onStomp(this);
      player.onStomp(killed);
      if (killed) {
        this.player.score += this.enemyKillScore(enemy.enemyType);
        this.removeDeadEnemies();
      }
    } else if (!player.getIsInvincible()) {
      player.takeDamage(this);
    }
  }

  private onPlayerPowerUpOverlap(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    puObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const player = playerObj as Player;
    const pu = puObj as PowerUp;

    player.score += SCORE.collectPowerUp;

    switch (pu.powerUpType) {
      case PowerUpType.Gobstopper:
        player.applyGobstopper();
        break;
      case PowerUpType.RockCandyShard:
        player.addShards(3);
        break;
      case PowerUpType.ToxicSyrup:
        this.deployToxicSyrup(player.x, player.y);
        break;
    }
    pu.collect();
  }

  private onCheckpointOverlap(
    _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    cpObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const cp = cpObj as Phaser.Physics.Arcade.Image;
    this.checkpointSystem.activate(cp);
    this.player.score += SCORE.checkpoint;
  }

  private onEndFlagOverlap() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.triggerLevelComplete();
  }

  private onProjectileEnemyOverlap(
    projObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const proj = projObj as Projectile;
    const enemy = enemyObj as Enemy;
    if (!enemy.isAlive() || !proj.active) return;

    const killed = enemy.onProjectileHit();
    if (killed) {
      this.player.score += this.enemyKillScore(enemy.enemyType);
      this.removeDeadEnemies();
    }
    proj.destroyProjectile();
  }

  private onProjectilePlatformCollide(
    projObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    (projObj as Projectile).destroyProjectile();
  }

  private onPuddleEnemyOverlap(
    puddleObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const enemy = enemyObj as Enemy;
    if (!enemy.isAlive()) return;

    // Puddle drains 1 HP per 500ms — use a cooldown stored on the enemy
    const now = this.time.now;
    const lastDmg = enemy.getData('puddleDmgAt') as number ?? 0;
    if (now - lastDmg > 500) {
      enemy.setData('puddleDmgAt', now);
      const killed = enemy.onProjectileHit();
      if (killed) {
        this.player.score += this.enemyKillScore(enemy.enemyType);
        this.removeDeadEnemies();
      }
    }
    // Slow enemy while in puddle
    (enemy.body as Phaser.Physics.Arcade.Body).setVelocityX(
      (enemy.body as Phaser.Physics.Arcade.Body).velocity.x * 0.6
    );
  }

  // ─── Platform Mechanics ───────────────────────────────────────────────────

  private startCrumble(platform: Phaser.Physics.Arcade.Image) {
    if (platform.getData('crumbling')) return;
    platform.setData('crumbling', true);

    this.tweens.add({
      targets: platform,
      x: platform.x + 3,
      duration: 80,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!platform.active) return;
        this.tweens.add({
          targets: platform,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            this.platforms.remove(platform, true, true);
          },
        });
      },
    });

    this.time.delayedCall(700, () => {
      if (!platform.active) return;
      (platform.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    });
  }

  // ─── Block Breaking ───────────────────────────────────────────────────────

  private breakBlock(block: Phaser.Physics.Arcade.Image) {
    block.setData('used', true);
    block.setTexture('block_empty');
    (block.body as Phaser.Physics.Arcade.StaticBody).enable = false;

    // Block bump animation
    this.tweens.add({
      targets: block,
      y: block.y - 8,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Spawn power-up from block
    const puType = block.getData('powerUpType') as PowerUpType;
    if (puType) {
      const pu = new PowerUp(this, block.x, block.y - 20, puType);
      this.powerUpGroup.add(pu);
    }

    // Particle burst
    for (let i = 0; i < 5; i++) {
      const p = this.add.image(block.x, block.y, 'particle').setTint(0x9b4dc0);
      this.tweens.add({
        targets: p,
        x: block.x + Phaser.Math.Between(-30, 30),
        y: block.y + Phaser.Math.Between(-40, -10),
        alpha: 0,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  // ─── Toxic Syrup ─────────────────────────────────────────────────────────

  private deployToxicSyrup(x: number, y: number) {
    const puddle = this.toxicPuddleGroup.create(x, y + 20, 'toxic_puddle') as Phaser.Physics.Arcade.Image;
    puddle.setOrigin(0.5, 0.5);
    puddle.refreshBody();

    // Puddle lasts 6 seconds
    this.time.delayedCall(6000, () => {
      this.tweens.add({
        targets: puddle,
        alpha: 0,
        duration: 500,
        onComplete: () => this.toxicPuddleGroup.remove(puddle, true, true),
      });
    });
  }

  // ─── Death & Respawn ──────────────────────────────────────────────────────

  private handlePlayerDied() {
    this.cameras.main.shake(300, 0.015);
    const respawn = this.checkpointSystem.getRespawnPoint();

    this.time.delayedCall(1200, () => {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.reset(respawn.x, respawn.y);
      this.player.health = 3;
      this.player.sizeState = SizeState.Normal;
      this.player.activeShards = 0;
      this.player.activePowerUp = null;
      this.player.setTexture('player_normal');
      this.player.setAlpha(1);
      this.player.clearTint();
    });
  }

  private handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.cameras.main.shake(400, 0.02);

    this.time.delayedCall(1500, () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.GameOver, {
        mode: 'gameover',
        score: this.player.score,
      });
    });
  }

  private triggerLevelComplete() {
    this.cameras.main.flash(500, 255, 215, 0);
    this.player.score += 1000;

    // Wave flag
    this.tweens.add({
      targets: this.endFlagSprite,
      angle: 10,
      duration: 200,
      yoyo: true,
      repeat: 4,
    });

    this.time.delayedCall(2000, () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.GameOver, {
        mode: 'levelcomplete',
        score: this.player.score,
        nextLevel: 2,
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private removeDeadEnemies() {
    // Cleanup is handled by Enemy.die() via destroy() — nothing to do here
  }

  private enemyKillScore(type: EnemyType): number {
    switch (type) {
      case EnemyType.GummyBear:    return SCORE.stompGummy;
      case EnemyType.Jawbreaker:   return SCORE.stompJawbreaker;
      case EnemyType.CaramelGolem: return SCORE.killGolem;
      default:                     return 100;
    }
  }

  private getLevelProp(name: string): unknown {
    return this.levelData.properties?.find(p => p.name === name)?.value;
  }

  private getObjProp(obj: LevelObjectData, name: string): unknown {
    return obj.properties?.find(p => p.name === name)?.value;
  }

  private updateRegistry() {
    this.game.registry.set('health',      this.player.health);
    this.game.registry.set('maxHealth',   3);
    this.game.registry.set('lives',       this.player.lives);
    this.game.registry.set('score',       this.player.score);
    this.game.registry.set('activePowerUp', this.player.activePowerUp);
    this.game.registry.set('shards',      this.player.activeShards);
    this.game.registry.set('levelName',   this.getLevelProp('levelName') ?? 'LEVEL 1');
  }

  // ─── Parallax ─────────────────────────────────────────────────────────────

  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;

  private createBackgrounds() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.bgSky = this.add.tileSprite(cx, cy, GAME_WIDTH, GAME_HEIGHT, 'bg_sky').setScrollFactor(0).setDepth(-10);
    this.bgFar = this.add.tileSprite(cx, cy, GAME_WIDTH, GAME_HEIGHT, 'bg_far').setScrollFactor(0).setDepth(-9);
    this.bgMid = this.add.tileSprite(cx, cy, GAME_WIDTH, GAME_HEIGHT, 'bg_mid').setScrollFactor(0).setDepth(-8);
  }

  private updateParallax() {
    const camX = this.cameras.main.scrollX;
    this.bgFar.setTilePosition(camX * 0.1);
    this.bgMid.setTilePosition(camX * 0.3);
  }
}
