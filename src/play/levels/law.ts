import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// Supreme Court records room. A fictional copyright claim, six exhibits, two of which break it.
const claim = 'Our client first released this song in 2019. The other track came out in 2020, so it copied ours.';
const exhibits: Record<string, [string, string]> = {
  a: ['Exhibit A: studio invoice', 'Mixing sessions for the client\'s song, billed in March 2019.'],
  b: ['Exhibit B: streaming page', 'The client\'s song, first published in June 2019.'],
  c: ['Exhibit C: radio station log', 'The other track was played on air in November 2018.'],
};
const CONTRADICTION = 'c';

export class LawLevel extends Room {
  stage = stages.find(s => s.id === 'law')!;
  intro = 'Supreme Court of India. The hearing starts in 45 seconds. One exhibit breaks the claim on the wall. Read them, flag it with F, then present it at the bench.';
  limit = 45_000;
  outOfTime = 'The hearing started before the brief was ready.';
  spots: Spot[] = [
    { id: 'claim', x: 26, label: 'The claim', markerY: 66 },
    ...'abc'.split('').map((id, i) => ({ id, x: 90 + i * 60, label: `Exhibit ${id.toUpperCase()}`, markerY: 92 })),
    { id: 'bench', x: 282, label: 'The bench', markerY: 80 },
  ];
  private flagged = new Set<string>();
  private flags: Record<string, Phaser.GameObjects.Rectangle> = {};

  constructor() { super('law'); }

  protected reset() { this.flagged = new Set(); this.flags = {}; }

  protected hint(s: Spot) {
    if (s.id in exhibits) return `${s.label} · E read · F ${this.flagged.has(s.id) ? 'unflag' : 'flag'}`;
    if (s.id === 'bench') return `The bench · E present your flagged exhibit (${this.flagged.size} flagged)`;
    return super.hint(s);
  }

  protected use(id: string) {
    if (id === 'claim') return hud.read('The claim (a fictional case)', `"${claim}"`);
    if (id !== 'bench') return hud.read(...exhibits[id]);
    if (this.flagged.size === 1 && this.flagged.has(CONTRADICTION)) {
      this.over = true;
      hud.say(`Exhibit C, with ${Math.ceil(this.left / 1000)}s to spare. The other track was on air in 2018, before the client's song existed. It can't have copied it.`);
      return void this.time.delayedCall(2600, () => this.finish());
    }
    this.penalty(10_000);
    const wrong = [...this.flagged].filter(f => f !== CONTRADICTION);
    hud.say((wrong.length ? `Exhibit ${wrong[0].toUpperCase()} fits the claim. Flag only the one that breaks it.` : 'Nothing flagged yet.') + ' The judge is waiting: minus 10 seconds.');
  }

  protected choose(key: string) {
    const id = this.near?.id;
    if (key !== 'f' || !id || !(id in exhibits)) return;
    this.flagged.has(id) ? this.flagged.delete(id) : this.flagged.add(id);
    this.flags[id].setVisible(this.flagged.has(id));
    this.refreshPrompt();
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x5a3f2c).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x4a3424);
    for (let x = 0; x < ROOM_W; x += 40) g.fillRect(x, 0, 3, FLOOR);
    g.fillStyle(0x3a2a1e);
    for (const y of [20, 40]) g.fillRect(0, y, ROOM_W, 3);
    g.fillStyle(0x2a211c).fillRect(0, FLOOR, ROOM_W, 30);
    g.fillStyle(0xf1eee5).fillRect(14, 74, 24, 30);
    g.fillStyle(0x9a9488);
    for (let y = 79; y < 100; y += 4) g.fillRect(17, y, 18, 1);
    for (const s of this.spots.filter(s => s.id in exhibits)) {
      g.fillStyle(0x3b2618).fillRect(s.x - 1, 120, 2, 30).fillRect(s.x - 7, 148, 14, 2);
      g.fillStyle(0xf1eee5).fillRect(s.x - 8, 98, 16, 22);
      g.fillStyle(0x9a9488);
      for (let y = 103; y < 118; y += 3) g.fillRect(s.x - 6, y, 12, 1);
      this.flags[s.id] = this.add.rectangle(s.x + 6, 96, 4, 8, 0xe0483e).setVisible(false);
    }
    g.fillStyle(0x6b4a30).fillRect(258, 100, 44, 50);
    g.fillStyle(0x7d5a3c).fillRect(254, 96, 50, 6);
    g.fillStyle(0x9a8a5a).fillCircle(280, 118, 6);
  }
}
