import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// Field recording in Rouen: record each place in a quiet gap. The battery drains, and the rain comes in.
const places: (Spot & { what: string; noise: string; offset: number })[] = [
  { id: 'cathedral', x: 45, label: 'Cathedral bells', markerY: 30, what: 'Cathedral bells', noise: 'A tour group walked past chatting.', offset: 0 },
  { id: 'clock', x: 125, label: 'Gros-Horloge', markerY: 50, what: 'Gros-Horloge chime', noise: 'A scooter cut through the arch.', offset: 1300 },
  { id: 'seine', x: 205, label: 'The Seine', markerY: 100, what: 'The Seine at the quay', noise: 'A delivery van idled on the quay.', offset: 2600 },
  { id: 'market', x: 268, label: 'Vieux-Marché', markerY: 90, what: 'Vieux-Marché morning', noise: 'Construction drilling started nearby.', offset: 600 },
];
const CYCLE = 4200, LIMIT = 70_000;

export class RouenLevel extends Room {
  stage = stages.find(s => s.id === 'rouen')!;
  intro = 'Rouen, with a recorder. Build the city\'s sound library: four places, each recorded in a quiet gap (green light). Every spoiled take wastes battery.';
  limit = LIMIT;
  outOfTime = 'The recorder battery died.';
  spots: Spot[] = places;
  private got = new Set<string>();
  private noiseLights: Phaser.GameObjects.Arc[] = [];
  private clock = 0;
  private raining = false;
  private rain!: Phaser.GameObjects.Graphics;

  constructor() { super('rouen'); }

  protected reset() { this.got = new Set(); this.noiseLights = []; this.clock = 0; this.raining = false; }

  private quiet(i: number) { return (this.clock + places[i].offset) % CYCLE < (this.raining ? 1400 : 2400); }

  protected hint(s: Spot) { return `${s.label} · E record`; }

  protected use(id: string) {
    const i = places.findIndex(p => p.id === id), p = places[i];
    if (this.got.has(id)) return hud.say(`${p.what} is already in the library.`);
    if (!this.quiet(i)) { this.penalty(4_000); return hud.say(`${p.noise} Spoiled take, wasted battery.`); }
    this.got.add(id);
    if (this.got.size === 4) {
      this.over = true;
      hud.say(`Four clean takes with ${Math.round(this.left / LIMIT * 100)}% battery left. The Rouen Sound Library has its first entries.`);
      return void this.time.delayedCall(2200, () => this.finish());
    }
    if (this.got.size === 2 && !this.raining) {
      this.raining = true;
      return hud.say('Two clean takes. Then rain rolls in off the Seine, and the quiet gaps get shorter.');
    }
    hud.say(`${p.what}: clean take. ${this.got.size} of 4.`);
  }

  protected tick(delta: number) {
    this.clock += delta;
    hud.status(`${this.stage.place} · recorder battery ${Math.max(0, Math.round(this.left / LIMIT * 100))}%`);
    this.noiseLights.forEach((l, i) => l.setFillStyle(this.got.has(places[i].id) ? 0x6fc7d6 : this.quiet(i) ? 0x7fd18b : 0xe0483e));
    this.rain.clear();
    if (!this.raining) return;
    this.rain.lineStyle(1, 0xdde8f2, 0.6);
    for (let i = 0; i < 40; i++) {
      const x = (i * 37 + this.clock * 0.05) % ROOM_W, y = (i * 53 + this.clock * 0.3) % FLOOR;
      this.rain.lineBetween(x, y, x - 2, y + 6);
    }
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xb9cde0).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x8f8a80).fillRect(0, FLOOR, ROOM_W, 30);
    g.fillStyle(0x7d776c).fillRect(30, 60, 30, 90).fillTriangle(30, 60, 60, 60, 45, 18);
    g.fillStyle(0x5a554c).fillRect(42, 80, 6, 14);
    g.fillStyle(0xd8ccb0).fillRect(105, 64, 40, 86);
    g.fillStyle(0x8f8a80).fillRect(115, 112, 20, 38);
    g.fillStyle(0x2a3a6a).fillCircle(125, 84, 10);
    g.fillStyle(0xe4b367).fillCircle(125, 84, 6);
    g.fillStyle(0x4a7a9a).fillRect(170, 118, 70, 32);
    g.fillStyle(0x30333a);
    for (let x = 170; x < 240; x += 6) g.fillRect(x, 108, 1, 12);
    g.fillRect(170, 108, 70, 2);
    g.fillStyle(0xf1e6cc).fillRect(244, 70, 50, 80);
    g.lineStyle(2, 0x5a3a24).strokeRect(244, 70, 50, 80);
    g.lineBetween(244, 70, 269, 110).lineBetween(294, 70, 269, 110).lineBetween(269, 70, 269, 150);
    g.fillStyle(0x8a3a2a).fillTriangle(240, 70, 298, 70, 269, 50);
    this.noiseLights = places.map(p => this.add.circle(p.x, (p.markerY ?? 70) - 10, 3, 0x7fd18b));
    this.rain = this.add.graphics().setDepth(7);
  }
}
