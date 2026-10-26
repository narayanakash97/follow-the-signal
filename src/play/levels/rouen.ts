import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// Rouen, kept short: record three places, then deliver them to the tourism office.
const places: Record<string, string> = {
  cathedral: 'Cathedral bells',
  clock: 'Gros-Horloge chime',
  seine: 'The Seine at the quay',
};

export class RouenLevel extends Room {
  stage = stages.find(s => s.id === 'rouen')!;
  intro = 'Rouen, with a recorder. Capture three sounds of the city, then bring them to the tourism office.';
  spots: Spot[] = [
    { id: 'cathedral', x: 45, label: 'Cathedral bells · E record', markerY: 30 },
    { id: 'clock', x: 125, label: 'Gros-Horloge · E record', markerY: 50 },
    { id: 'seine', x: 205, label: 'The Seine · E record', markerY: 100 },
    { id: 'office', x: 268, label: 'Office de Tourisme · E deliver', markerY: 46 },
  ];
  private got = new Set<string>();
  private ticks: Phaser.GameObjects.Arc[] = [];

  constructor() { super('rouen'); }

  protected reset() { this.got = new Set(); this.ticks = []; }

  protected hint(s: Spot) { return s.label; }

  protected use(id: string) {
    if (id !== 'office') {
      this.got.add(id);
      this.ticks[Object.keys(places).indexOf(id)].setVisible(true);
      return hud.say(`${places[id]}: recorded. ${this.got.size} of 3.`);
    }
    if (this.got.size < 3) return hud.say(`${this.got.size} of 3 recorded. The library needs all three.`);
    this.over = true;
    hud.say('Edited, restored and filed: the start of the Rouen Sound Library, and sound for Seine Rise.');
    this.time.delayedCall(2400, () => this.finish());
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
    // The tourism office: a half-timbered house.
    g.fillStyle(0xf1e6cc).fillRect(244, 70, 50, 80);
    g.lineStyle(2, 0x5a3a24).strokeRect(244, 70, 50, 80);
    g.lineBetween(244, 70, 269, 110).lineBetween(294, 70, 269, 110).lineBetween(269, 70, 269, 150);
    g.fillStyle(0x8a3a2a).fillTriangle(240, 70, 298, 70, 269, 50);
    // A blue light above each place once it is recorded.
    this.ticks = [45, 125, 205].map((x, i) => this.add.circle(x, [20, 40, 90][i], 3, 0x6fc7d6).setVisible(false));
  }
}
