import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// Supreme Court records room. A fictional copyright claim; one exhibit contradicts it.
const text: Record<string, string> = {
  claim: 'The claim (a fictional case): "Our client first released this song in 2019. The other track came out in 2018, so it could not have inspired ours."',
  a: 'Exhibit A, studio invoice: mixing sessions for the client\'s song, billed in March 2019.',
  b: 'Exhibit B, archived streaming page: the client\'s song, published 14 June 2018.',
  c: 'Exhibit C, label release sheet: the other track, released 2 September 2018.',
};

export class LawLevel extends Room {
  stage = stages.find(s => s.id === 'law')!;
  intro = 'Supreme Court of India, records room. Read the claim on the wall, check the three exhibits, then flag the contradiction at the bench.';
  spots: Spot[] = [
    { id: 'claim', x: 40, label: 'read the claim', markerY: 66 },
    { id: 'a', x: 110, label: 'read Exhibit A', markerY: 92 },
    { id: 'b', x: 165, label: 'read Exhibit B', markerY: 92 },
    { id: 'c', x: 220, label: 'read Exhibit C', markerY: 92 },
    { id: 'bench', x: 268, label: 'flag the contradiction', markerY: 80 },
  ];

  constructor() { super('law'); }

  protected hint(s: Spot) {
    return s.id === 'bench' ? 'Which exhibit contradicts the claim? Press 1 (A), 2 (B) or 3 (C)' : super.hint(s);
  }

  protected use(id: string) {
    if (id === 'bench') return hud.say('Press 1, 2 or 3 to flag the exhibit that contradicts the claim.');
    hud.say(text[id]);
  }

  protected choose(key: string) {
    if (this.near?.id !== 'bench' || !'123'.includes(key)) return;
    if (key === '2') {
      hud.say('Exhibit B. The client\'s own song was public in June 2018, so "first released in 2019" does not hold, and it came out before the other track.');
      this.time.delayedCall(1800, () => this.finish());
    } else {
      hud.say(key === '1' ? 'Exhibit A fits the claim\'s story. Mixing in 2019 does not prove when the song was first released.' : 'Exhibit C agrees with the claim: the other track did come out in 2018. Look again.');
    }
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x5a3f2c).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x4a3424);
    for (let x = 0; x < ROOM_W; x += 40) g.fillRect(x, 0, 3, FLOOR);
    g.fillStyle(0x3a2a1e);
    for (const y of [20, 40]) g.fillRect(0, y, ROOM_W, 3);
    g.fillStyle(0x2a211c).fillRect(0, FLOOR, ROOM_W, 30);
    // Claim notice.
    g.fillStyle(0xf1eee5).fillRect(28, 74, 24, 30);
    g.fillStyle(0x9a9488);
    for (let y = 79; y < 100; y += 4) g.fillRect(31, y, 18, 1);
    // Exhibits on easels.
    for (const x of [110, 165, 220]) {
      g.fillStyle(0x3b2618).fillRect(x - 1, 120, 2, 30).fillRect(x - 8, 148, 16, 2);
      g.fillStyle(0xf1eee5).fillRect(x - 9, 98, 18, 22);
      g.fillStyle(0xb5652b).fillRect(x - 9, 98, 18, 3);
    }
    // The bench.
    g.fillStyle(0x6b4a30).fillRect(240, 100, 56, 50);
    g.fillStyle(0x7d5a3c).fillRect(236, 96, 64, 6);
    g.fillStyle(0x9a8a5a).fillCircle(268, 118, 7);
  }
}
