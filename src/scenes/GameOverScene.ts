import Phaser from 'phaser';
import { SceneKey } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

interface GameOverData {
  mode: 'gameover' | 'levelcomplete';
  score: number;
  nextLevel?: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.GameOver });
  }

  create(data: GameOverData) {
    this.cameras.main.setBackgroundColor('#0d0514');
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky').setAlpha(0.5);

    if (data.mode === 'levelcomplete') {
      this.showLevelComplete(data);
    } else {
      this.showGameOver(data);
    }
  }

  private showLevelComplete(data: GameOverData) {
    this.add.text(GAME_WIDTH / 2, 140, 'LEVEL COMPLETE', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ffd700',
      stroke: '#554400',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 210, 'LOLLIPOP RUINS CLEARED', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ff69b4',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 270, `SCORE: ${data.score}`, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const nextText = this.add.text(GAME_WIDTH / 2, 360, '[ CONTINUE ]', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const menuText = this.add.text(GAME_WIDTH / 2, 400, '[ MAIN MENU ]', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#8866aa',
    }).setOrigin(0.5);

    this.tweens.add({ targets: nextText, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.addButton(nextText, () => {
      // Level 2 not yet built — restart level 1 for now
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.Game, { level: 1 });
    });
    this.addButton(menuText, () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.Menu);
    });

    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    space.once('down', () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.Game, { level: 1 });
    });
  }

  private showGameOver(data: GameOverData) {
    this.add.text(GAME_WIDTH / 2, 150, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#ff2244',
      stroke: '#440011',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 230, `FINAL SCORE: ${data.score}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const retryText = this.add.text(GAME_WIDTH / 2, 330, '[ RETRY ]', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff69b4',
    }).setOrigin(0.5);

    const menuText = this.add.text(GAME_WIDTH / 2, 380, '[ MAIN MENU ]', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#8866aa',
    }).setOrigin(0.5);

    this.tweens.add({ targets: retryText, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.addButton(retryText, () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.Game, { level: 1 });
    });
    this.addButton(menuText, () => {
      this.scene.stop(SceneKey.UI);
      this.scene.start(SceneKey.Menu);
    });
  }

  private addButton(text: Phaser.GameObjects.Text, callback: () => void) {
    text.setInteractive({ useHandCursor: true });
    text.on('pointerover', () => text.setAlpha(0.6));
    text.on('pointerout', () => text.setAlpha(1));
    text.on('pointerdown', callback);
  }
}
