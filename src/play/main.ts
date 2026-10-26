import * as Phaser from 'phaser';
import './play.css';
import './input';
import { WorldScene, VIEW_W, VIEW_H } from './world';
import { studio, toggleSound } from './studioLevel';
import * as hud from './hud';

let game: Phaser.Game | null = null;

// First key press: go full screen and start. Browsers only allow full screen after a key or click.
window.addEventListener('keydown', () => {
  document.documentElement.requestFullscreen?.().catch(() => {});
  document.getElementById('start')!.hidden = true;
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: VIEW_W, height: VIEW_H, pixelArt: true,
    backgroundColor: '#000000',
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 700 } } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new WorldScene(), studio],
  });
}, { once: true });

// M toggles sound in any scene.
window.addEventListener('keydown', async e => {
  if (e.key.toLowerCase() !== 'm' || !game) return;
  hud.say((await toggleSound()) ? 'Sound on.' : 'Sound off.');
});
