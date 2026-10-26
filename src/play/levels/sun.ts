import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { input } from '../input';
import * as hud from '../hud';

// Festival soundcheck, Mumbai: sweep the EQ to find the ringing band. When the crowd arrives, a second one rings.
const BANDS = ['63 Hz', '125 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz'];
const describe = (b: number) => (b >= 5 ? 'high and piercing' : b >= 4 ? 'a hard, nasal honk' : 'a low, boomy howl');

export class SunLevel extends Room {
  stage = stages.find(s => s.id === 'sun')!;
  intro = 'Festival soundcheck, Mumbai. The vocal wedge is feeding back and the doors open in 60 seconds. Find the ringing frequency and cut only that.';
  limit = 60_000;
  outOfTime = 'Doors opened with the wedge still screaming.';
  spots: Spot[] = [
    { id: 'wedge', x: 50, label: 'Vocal monitor wedge', markerY: 116 },
    { id: 'desk', x: 140, label: 'Allen & Heath desk', markerY: 96 },
    { id: 'array', x: 270, label: 'Meyer Sound line array', markerY: 30 },
  ];
  private ring = 0;
  private round = 1;
  private cut = new Set<number>();
  private eqOpen = false;
  private cursor = 0;
  private repeatIn = 0;
  private eq!: Phaser.GameObjects.Graphics;
  private rings!: Phaser.GameObjects.Arc;
  private crowd!: Phaser.GameObjects.Graphics;

  constructor() { super('sun'); }

  protected reset() {
    this.ring = Phaser.Math.Between(4, 6);
    this.round = 1; this.cut = new Set(); this.eqOpen = false; this.cursor = 2;
  }

  protected hint(s: Spot) {
    if (this.eqOpen) return `Monitor EQ · ← → band: ${BANDS[this.cursor]} · E cut · X close`;
    if (s.id === 'desk') return 'Allen & Heath desk · E open the monitor EQ';
    return `${s.label} · E listen`;
  }

  protected use(id: string) {
    if (id === 'wedge') return hud.say(this.ring >= 0 ? `The wedge is ringing: ${describe(this.ring)}.` : 'The wedge is clean.');
    if (id === 'array') return hud.say('The Meyer Sound line array sounds clean out front. The problem is on stage, in the monitor.');
    if (!this.eqOpen) { this.eqOpen = this.frozen = true; this.drawEq(); this.refreshPrompt(); return hud.say('Monitor EQ open. The tallest bar is the one ringing. Move to it and cut.'); }
    this.applyCut();
  }

  protected choose(key: string) {
    if (key === 'x' && this.eqOpen) { this.eqOpen = this.frozen = false; this.eq.clear(); this.refreshPrompt(); }
  }

  private applyCut() {
    if (this.cut.has(this.cursor)) return hud.say(`${BANDS[this.cursor]} is already cut.`);
    this.cut.add(this.cursor);
    if (this.cursor !== this.ring) {
      this.penalty(5_000);
      return hud.say(`You cut ${BANDS[this.cursor]}. The vocal gets thinner and the ring is still there. Minus 5 seconds.`);
    }
    if (this.round === 1) {
      this.round = 2;
      this.crowd.setVisible(true);
      const options = [3, 4, 5, 6, 7].filter(b => !this.cut.has(b));
      this.ring = options[Phaser.Math.Between(0, options.length - 1)];
      return hud.say(`Ring gone. Doors open early and the crowd pours in. The singer pushes harder, and a new ring starts: ${describe(this.ring)}.`);
    }
    this.ring = -1;
    this.over = true;
    this.eqOpen = this.frozen = false;
    this.rings.setVisible(false);
    hud.say(`Both rings out with ${Math.ceil(this.left / 1000)}s on the clock. Narrow cuts, and the vocal still sounds like a vocal.`);
    this.time.delayedCall(2400, () => this.finish());
  }

  protected tick(delta: number) {
    if (!this.eqOpen) return;
    this.repeatIn -= delta;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir && this.repeatIn <= 0) { this.cursor = Phaser.Math.Clamp(this.cursor + dir, 0, 7); this.repeatIn = 160; this.refreshPrompt(); }
    if (!dir) this.repeatIn = 0;
    this.drawEq();
  }

  private drawEq() {
    const g = this.eq.clear().setDepth(8);
    g.fillStyle(0x0f1418, 0.95).fillRect(40, 20, 240, 90);
    g.lineStyle(1, 0x6f7378).strokeRect(40, 20, 240, 90);
    BANDS.forEach((_, i) => {
      const x = 56 + i * 28;
      const h = this.cut.has(i) ? 4 : i === this.ring ? 46 + Math.sin(this.time.now / 60) * 8 : 8 + Math.abs(Math.sin(this.time.now / 300 + i)) * 10;
      g.fillStyle(this.cut.has(i) ? 0x3a3744 : 0x6fc7d6).fillRect(x, 96 - h, 16, h);
    });
    g.fillStyle(0xe4b367).fillTriangle(56 + this.cursor * 28 + 2, 106, 56 + this.cursor * 28 + 14, 106, 56 + this.cursor * 28 + 8, 100);
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x1d1b3a).fillRect(0, 0, ROOM_W, FLOOR);
    [0xe0483e, 0x6fc7d6, 0xe4b367, 0xb07cd6, 0x7fd18b].forEach((c, i) => {
      g.fillStyle(c, 0.18).fillTriangle(60 + i * 50, 0, 40 + i * 50, FLOOR, 80 + i * 50, FLOOR);
      g.fillStyle(c).fillCircle(60 + i * 50, 6, 3);
    });
    g.fillStyle(0x6f7378).fillRect(0, 0, ROOM_W, 3);
    g.fillStyle(0x2a2833).fillRect(0, FLOOR, ROOM_W, 30);
    g.fillStyle(0x15141a).fillTriangle(36, 150, 64, 150, 64, 132);
    this.rings = this.add.circle(52, 128, 8).setStrokeStyle(1, 0xe0483e);
    this.tweens.add({ targets: this.rings, scale: 2, alpha: 0, repeat: -1, duration: 500 });
    g.fillStyle(0x2f3138).fillRect(118, 112, 44, 14);
    g.fillStyle(0x3a2c22).fillRect(120, 126, 3, 24).fillRect(157, 126, 3, 24);
    g.fillStyle(0xe0483e);
    for (let x = 122; x < 160; x += 6) g.fillRect(x, 115, 2, 6);
    g.fillStyle(0x6f7378).fillRect(269, 3, 2, 24);
    g.fillStyle(0x15141a);
    for (let y = 30; y < 80; y += 8) g.fillRect(258, y, 24, 7);
    this.crowd = this.add.graphics().setVisible(false).setDepth(4);
    this.crowd.fillStyle(0x0f0e1c);
    for (let x = 4; x < 296; x += 9) this.crowd.fillCircle(x, 176, 6);
    this.eq = this.add.graphics();
  }
}
