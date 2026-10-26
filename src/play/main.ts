import * as Phaser from 'phaser';
import './play.css';
import './input';
import { WorldScene, VIEW_W, VIEW_H } from './world';
import { studio } from './studioLevel';
import { audio } from './sound';
import { LawLevel } from './levels/law';
import { SacacLevel } from './levels/sacac';
import { SunLevel } from './levels/sun';
import { Cop28Level } from './levels/cop28';
import { FlightLevel } from './levels/flight';
import { KedgeLevel } from './levels/kedge';
import { RouenLevel } from './levels/rouen';
import { Micro1Level } from './levels/micro1';
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
    scene: [new WorldScene(), new LawLevel(), new SacacLevel(), studio, new SunLevel(), new Cop28Level(),
      new FlightLevel(), new KedgeLevel(), new RouenLevel(), new Micro1Level()],
  });
  // Local preview only: lets scripted play-tests jump straight to a level.
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
}, { once: true });

// M toggles sound in any scene.
window.addEventListener('keydown', async e => {
  if (e.key.toLowerCase() !== 'm' || !game) return;
  await audio.setEnabled(!audio.enabled);
  hud.say(audio.enabled ? 'Sound on.' : 'Sound off.');
});
