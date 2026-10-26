import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// KEDGE library, new country: the shelves are in French and the library is closing.
type Shelf = Spot & { take: string; topic?: string };
const shelves: Shelf[] = [
  { id: 'son', x: 60, label: 'Rayon : Ingénierie du son', take: 'Recording and mixing research.', topic: 'sound engineering' },
  { id: 'trad', x: 120, label: 'Rayon : Traduction', take: 'Traduction juridique: legal translation. Not sonic. The sound-related work must be shelved somewhere musical.' },
  { id: 'ia', x: 180, label: 'Rayon : IA et musique', take: 'Research on generative AI and music-making.', topic: 'AI in music' },
  { id: 'musico', x: 240, label: 'Rayon : Musicologie', take: 'Studies of how sound carries meaning across cultures.', topic: 'sonic translation' },
];

export class KedgeLevel extends Room {
  stage = stages.find(s => s.id === 'kedge')!;
  intro = 'KEDGE, Paris. Your thesis covers sound engineering, AI in music and sonic translation. The library closes in 60 seconds and every shelf is labelled in French.';
  limit = 60_000;
  outOfTime = '"La bibliothèque est fermée." The library closed on you.';
  spots: Spot[] = [...shelves.map(s => ({ ...s, markerY: 40 })), { id: 'desk', x: 282, label: 'Bureau : déposer le mémoire', markerY: 96 }];
  private found = new Set<string>();
  private pages: Phaser.GameObjects.Rectangle[] = [];

  constructor() { super('kedge'); }

  protected reset() { this.found = new Set(); this.pages = []; }

  protected use(id: string) {
    const shelf = shelves.find(s => s.id === id);
    if (shelf) {
      if (!shelf.topic) { this.penalty(5_000); return hud.say(`${shelf.take} Minus 5 seconds.`); }
      if (!this.found.has(id)) { this.found.add(id); this.pages[this.found.size - 1].setVisible(true); }
      return hud.say(`${shelf.take} That covers ${shelf.topic}. (${this.found.size} of 3)`);
    }
    if (this.found.size < 3) return hud.say(`"Il manque des sources." Your thesis has ${this.found.size} of 3 threads.`);
    this.over = true;
    hud.say('"Mémoire déposé." Submitted, in a second language, with time to spare.');
    this.time.delayedCall(2200, () => this.finish());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xe8e2d4).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x6b4a30).fillRect(0, FLOOR, ROOM_W, 30);
    const spines = [0x9a3b2a, 0x3d6a96, 0x2e6b4a, 0xb5862b, 0x5a4a7a];
    for (const s of shelves) {
      g.fillStyle(0x6b4a30).fillRect(s.x - 15, 48, 30, 102);
      g.fillStyle(0xf1eee5).fillRect(s.x - 10, 50, 20, 5); // French label plate
      for (let y = 60; y < 148; y += 22) {
        g.fillStyle(0x4a3424).fillRect(s.x - 13, y + 16, 26, 3);
        for (let i = 0; i < 6; i++) g.fillStyle(spines[(i + y + s.x) % 5]).fillRect(s.x - 12 + i * 4.2, y, 3, 16);
      }
    }
    g.fillStyle(0x7d5a3c).fillRect(262, 116, 40, 5).fillRect(264, 121, 3, 29).fillRect(297, 121, 3, 29);
    this.pages = [0, 1, 2].map(i => this.add.rectangle(282, 113 - i * 3, 18, 3, 0xf1eee5).setVisible(false));
  }
}
