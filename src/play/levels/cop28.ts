import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// COP28: interference is creeping onto one podium's wireless. Find it and switch to backup before broadcast.
const colours = [0xe0483e, 0x3d8fd6, 0x7fd18b, 0xe4b367];
const names = ['red', 'blue', 'green', 'yellow'];
const LIMIT = 40_000;

export class Cop28Level extends Room {
  stage = stages.find(s => s.id === 'cop28')!;
  intro = 'COP28, Dubai. Four podiums go live in 40 seconds. Something is creeping onto the wireless. Find it before broadcast.';
  spots: Spot[] = [
    { id: 'podiums', x: 60, label: 'check the podiums', markerY: 100 },
    { id: 'rf', x: 160, label: 'read the RF monitor', markerY: 76 },
    { id: 'backup', x: 260, label: 'backup receiver rack', markerY: 92 },
  ];
  private bad = 0;
  private seen = false;
  private left = LIMIT;
  private bars: Phaser.GameObjects.Rectangle[] = [];

  constructor() { super('cop28'); }

  protected reset() { this.bad = Phaser.Math.Between(0, 3); this.seen = false; this.left = LIMIT; this.bars = []; }

  protected hint(s: Spot) {
    return s.id === 'backup' ? 'Switch a podium to its backup: 1 red · 2 blue · 3 green · 4 yellow' : super.hint(s);
  }

  protected use(id: string) {
    if (id === 'podiums') return hud.say('All four mics sound fine right now. Whatever is coming has not reached the audio yet.');
    if (id === 'rf') { this.seen = true; return hud.say(`The ${names[this.bad]} podium's frequency has a rising spike from another transmitter. It will break up soon.`); }
    hud.say('Press 1 to 4 to switch that podium to its backup frequency.');
  }

  protected choose(key: string) {
    if (this.near?.id !== 'backup' || !'1234'.includes(key)) return;
    const pick = Number(key) - 1;
    if (!this.seen) return hud.say('Which podium? Read the RF monitor before switching anything live.');
    if (pick !== this.bad) return hud.say(`The ${names[pick]} podium was clean. Switching it caused a click on air. The clock is still running.`);
    this.over = true;
    this.bars[this.bad].setFillStyle(colours[this.bad]).setScale(1, 1);
    hud.status(`${this.stage.place} · switched with ${Math.ceil(this.left / 1000)}s to spare`);
    hud.say(`Switched. The ${names[pick]} podium is on its backup frequency, and the broadcast feed stays clean.`);
    this.time.delayedCall(1800, () => this.finish());
  }

  protected tick(delta: number) {
    this.left -= delta;
    hud.status(`${this.stage.place} · broadcast in ${Math.max(0, Math.ceil(this.left / 1000))}s`);
    this.bars[this.bad].setScale(1, 1 + (1 - this.left / LIMIT) * 2.5).setFillStyle(this.left < LIMIT * 0.6 ? 0xffffff : colours[this.bad]);
    if (this.left > 0) return;
    this.over = true;
    hud.say('The interference reached the broadcast. Prepared backups only help if you spot the problem first. Trying again.');
    this.time.delayedCall(2500, () => this.scene.restart());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xf4f1ea).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x2a9d8f).fillRect(0, 0, ROOM_W, 14);
    g.fillStyle(0xd9d3c4).fillRect(0, FLOOR, ROOM_W, 30);
    // Four podiums, one colour each.
    colours.forEach((c, i) => {
      const x = 22 + i * 26;
      g.fillStyle(0x5a5f66).fillRect(x, 118, 16, 32);
      g.fillStyle(c).fillRect(x, 118, 16, 4);
      g.fillStyle(0x30333a).fillRect(x + 7, 108, 2, 10);
    });
    // RF monitor: one bar per podium frequency.
    g.fillStyle(0x1e1d23).fillRect(130, 84, 60, 40);
    g.fillStyle(0x0f1418).fillRect(133, 87, 54, 34);
    g.fillStyle(0x3a2c22).fillRect(156, 124, 8, 26);
    this.bars = colours.map((c, i) => this.add.rectangle(140 + i * 13, 119, 8, 8, c).setOrigin(0.5, 1));
    // Backup rack.
    g.fillStyle(0x1e1d23).fillRect(248, 100, 26, 50);
    colours.forEach((c, i) => g.fillStyle(c).fillRect(252, 106 + i * 10, 18, 4));
  }
}
