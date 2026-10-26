import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// COP28: eight podiums on wireless. Interference creeps onto one, then another. Catch both before broadcast.
const N = 8;

export class Cop28Level extends Room {
  stage = stages.find(s => s.id === 'cop28')!;
  intro = 'COP28, Dubai. Eight podiums go live in 45 seconds. The RF monitor shows one bar per podium, 1 to 8 from left to right. Watch it, and switch any podium in trouble to its backup.';
  limit = 45_000;
  outOfTime = 'Interference reached the broadcast feed.';
  spots: Spot[] = [
    { id: 'podiums', x: 60, label: 'Podiums 1 to 8', markerY: 100 },
    { id: 'rf', x: 170, label: 'RF monitor', markerY: 70 },
    { id: 'backup', x: 270, label: 'Backup receivers · 1 to 8 switch a podium', markerY: 92 },
  ];
  private bad = 0;
  private caught = 0;
  private bars: Phaser.GameObjects.Rectangle[] = [];
  private growth = 0;
  private safe = new Set<number>();

  constructor() { super('cop28'); }

  protected reset() { this.bad = Phaser.Math.Between(0, N - 1); this.caught = 0; this.bars = []; this.growth = 0; this.safe = new Set(); }

  protected hint(s: Spot) { return s.id === 'backup' ? s.label : `${s.label} · E`; }

  protected use(id: string) {
    if (id === 'podiums') return hud.say('Every mic sounds fine from here. Whatever is coming has not reached the audio yet.');
    if (id === 'rf') {
      const cols = Array.from({ length: N }, (_, i) => `<div><i></i>${i + 1}</div>`).join('');
      return hud.read('RF monitor: one bar per podium', `<div class="rf">${cols}</div><p>Watch for the bar that keeps climbing. Then switch that podium at the backup rack.</p>`);
    }
    hud.say('Press 1 to 8 to switch that podium to its backup frequency.');
  }

  protected choose(key: string) {
    const pick = Number(key) - 1;
    if (this.near?.id !== 'backup' || !(pick >= 0 && pick < N)) return;
    if (pick !== this.bad) {
      this.penalty(5_000);
      return hud.say(`Podium ${pick + 1} was clean. Switching it put a click on air. Minus 5 seconds.`);
    }
    this.bars[this.bad].setScale(1, 1).setFillStyle(0x7fd18b);
    this.safe.add(this.bad);
    this.caught++;
    if (this.caught === 1) {
      const prev = this.bad;
      do this.bad = Phaser.Math.Between(0, N - 1); while (this.bad === prev);
      this.growth = 0;
      return hud.say(`Podium ${pick + 1} is on backup. Then the screen moves again: a second frequency is starting to climb.`);
    }
    this.over = true;
    hud.say(`Both caught with ${Math.ceil(this.left / 1000)}s to spare. The broadcast feed never heard a thing.`);
    this.time.delayedCall(2400, () => this.finish());
  }

  protected tick(delta: number) {
    this.growth = Math.min(1, this.growth + delta / 14_000);
    this.bars.forEach((b, i) => {
      if (i === this.bad) b.setScale(1, 1 + this.growth * 3).setFillStyle(this.growth > 0.5 && Math.floor(this.time.now / 200) % 2 ? 0xffffff : 0xe0483e);
      else if (b.fillColor !== 0x7fd18b) b.setScale(1, 1 + Math.abs(Math.sin(this.time.now / 400 + i)) * 0.4);
    });
    // Mirror the room's monitor on the big screen while it is open.
    if (!hud.reading()) return;
    document.querySelectorAll<HTMLElement>('#doc-body .rf i').forEach((bar, i) => {
      const h = i === this.bad ? 25 + this.growth * 75 : 12 + Math.abs(Math.sin(this.time.now / 400 + i)) * 10;
      bar.style.height = `${this.safe.has(i) ? 10 : h}%`;
      bar.className = this.safe.has(i) ? 'safe' : i === this.bad && this.growth > 0.35 ? 'hot' : '';
    });
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xf4f1ea).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x2a9d8f).fillRect(0, 0, ROOM_W, 14);
    g.fillStyle(0xd9d3c4).fillRect(0, FLOOR, ROOM_W, 30);
    for (let i = 0; i < N; i++) {
      const x = 8 + i * 14;
      g.fillStyle(0x5a5f66).fillRect(x, 120, 11, 30);
      g.fillStyle(0x30333a).fillRect(x + 5, 110, 1, 10);
    }
    g.fillStyle(0x1e1d23).fillRect(128, 78, 84, 48);
    g.fillStyle(0x0f1418).fillRect(131, 81, 78, 42);
    g.fillStyle(0x3a2c22).fillRect(166, 126, 8, 24);
    this.bars = Array.from({ length: N }, (_, i) => this.add.rectangle(137 + i * 9.5, 120, 6, 6, 0x6fc7d6).setOrigin(0.5, 1));
    g.fillStyle(0x1e1d23).fillRect(256, 96, 28, 54);
    for (let i = 0; i < N; i++) g.fillStyle(0x7fd18b).fillRect(260, 100 + i * 6, 20, 3);
  }
}
