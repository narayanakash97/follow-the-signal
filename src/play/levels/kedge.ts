import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// KEDGE library: gather the three threads of the thesis, then submit it.
const topics: Record<string, string> = {
  engineering: 'Sound engineering: how a recording is made, and what the engineer decides along the way.',
  ai: 'AI in music: what generative tools change for the people who make and shape sound.',
  translation: 'Sonic translation: how meaning carries, or fails to carry, when sound moves between people and cultures.',
};

export class KedgeLevel extends Room {
  stage = stages.find(s => s.id === 'kedge')!;
  intro = 'KEDGE Business School library, Paris. Your master\'s thesis needs three threads. Find them on the shelves, then submit at the desk.';
  spots: Spot[] = [
    { id: 'engineering', x: 60, label: 'take the sound engineering research', markerY: 40 },
    { id: 'ai', x: 125, label: 'take the AI in music research', markerY: 40 },
    { id: 'translation', x: 190, label: 'take the sonic translation research', markerY: 40 },
    { id: 'desk', x: 275, label: 'submit the thesis', markerY: 96 },
  ];
  private found = new Set<string>();
  private pages: Phaser.GameObjects.Rectangle[] = [];

  constructor() { super('kedge'); }

  protected reset() { this.found = new Set(); this.pages = []; }

  protected use(id: string) {
    if (id !== 'desk') {
      if (!this.found.has(id)) { this.found.add(id); this.pages[this.found.size - 1].setVisible(true); }
      return hud.say(`${topics[id]} (${this.found.size} of 3)`);
    }
    if (this.found.size < 3) return hud.say(`The thesis has ${this.found.size} of 3 threads. Keep looking on the shelves.`);
    this.over = true;
    hud.say('Thesis submitted: sound engineering, AI in music and sonic translation, tied together.');
    this.time.delayedCall(1800, () => this.finish());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xe8e2d4).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x6b4a30).fillRect(0, FLOOR, ROOM_W, 30);
    const spines = [0x9a3b2a, 0x3d6a96, 0x2e6b4a, 0xb5862b, 0x5a4a7a];
    for (const x of [40, 105, 170]) {
      g.fillStyle(0x6b4a30).fillRect(x, 48, 40, 102);
      for (let y = 54; y < 148; y += 24) {
        g.fillStyle(0x4a3424).fillRect(x + 2, y + 18, 36, 3);
        for (let i = 0; i < 8; i++) g.fillStyle(spines[(i + y) % 5]).fillRect(x + 3 + i * 4.4, y, 3, 18);
      }
    }
    // Desk with a stack that grows as you collect.
    g.fillStyle(0x7d5a3c).fillRect(250, 116, 50, 5).fillRect(252, 121, 3, 29).fillRect(295, 121, 3, 29);
    this.pages = [0, 1, 2].map(i => this.add.rectangle(275, 113 - i * 3, 18, 3, 0xf1eee5).setVisible(false));
  }
}
