import * as Phaser from 'phaser';
import { frames, drawSprite } from './sprite';
import type { Station, StudioState } from './state';
import { drawDoor } from './play/room';

export const W = 320, H = 180, FLOOR = 150;
export const stations: { id: Station; x: number; label: string }[] = [
  { id: 'brief', x: 36, label: 'Client brief' },
  { id: 'fan', x: 94, label: 'Fan' },
  { id: 'window', x: 158, label: 'Window' },
  { id: 'mic', x: 224, label: 'Mic booth' },
  { id: 'desk', x: 272, label: 'Mixing desk' },
];
const REACH = 14, SPEED = 70;

type Hooks = { near(station: Station | null): void; use(station: Station): void; ready(): void; door(at: boolean): void; leave(): void };

export class StudioScene extends Phaser.Scene {
  held = { left: false, right: false };
  private player!: Phaser.GameObjects.Image;
  private marker!: Phaser.GameObjects.Triangle;
  private blades!: Phaser.GameObjects.Graphics;
  private digger!: Phaser.GameObjects.Rectangle;
  private dust: Phaser.GameObjects.Rectangle[] = [];
  private wave!: Phaser.GameObjects.Graphics;
  private rec!: Phaser.GameObjects.Arc;
  private target: { x: number; then?: Station } | null = null;
  private nearStation: Station | null = null;
  private atDoor = false;
  private walkClock = 0;
  private fanOn = true;
  private building = true;

  constructor(private hooks: Hooks) { super('studio'); }

  create() {
    frames.forEach((frame, i) => { if (!this.textures.exists(`akash${i}`)) this.textures.addCanvas(`akash${i}`, drawSprite(frame)); });
    this.dust = [];
    this.nearStation = null;
    this.atDoor = false;
    this.drawRoom();
    drawDoor(this.add.graphics());
    this.player = this.add.image(20, FLOOR, 'akash0').setOrigin(0.5, 1).setDepth(5);
    this.marker = this.add.triangle(0, 0, 0, 0, 8, 0, 4, 5, 0xe4b367).setVisible(false).setDepth(6);
    this.hooks.ready();
  }

  update(_: number, delta: number) {
    const dir = this.target
      ? Math.sign(this.target.x - this.player.x)
      : (this.held.right ? 1 : 0) - (this.held.left ? 1 : 0);
    if (dir) {
      this.player.x = Phaser.Math.Clamp(this.player.x + dir * SPEED * delta / 1000, 10, W - 10);
      this.player.setFlipX(dir < 0);
      this.walkClock += delta;
      this.player.setTexture(`akash${Math.floor(this.walkClock / 160) % 2}`);
    } else {
      this.player.setTexture('akash0');
    }
    if (this.target && Math.abs(this.target.x - this.player.x) < 1.5) {
      const then = this.target.then;
      this.target = null;
      this.updateNear();
      if (then) this.hooks.use(then);
    } else {
      this.updateNear();
    }
    if (this.fanOn) this.blades.rotation += delta / 60;
  }

  /** Walk to a station; optionally use it on arrival. */
  walkTo(station: Station, use = false) {
    const x = stations.find(s => s.id === station)!.x;
    this.target = { x, then: use ? station : undefined };
  }

  interact() {
    if (this.atDoor) this.hooks.leave();
    else if (this.nearStation) this.hooks.use(this.nearStation);
  }

  reset() {
    this.target = null;
    this.player.setPosition(20, FLOOR).setFlipX(false);
  }

  show(state: StudioState) {
    this.fanOn = state.fan;
    this.building = state.construction;
    this.digger.setFillStyle(state.construction ? 0xe0a83a : 0x8a7650);
    this.dust.forEach(d => d.setVisible(state.construction));
    this.drawWave(state);
  }

  flashRec() {
    this.tweens.add({ targets: this.rec, alpha: { from: 1, to: 0.25 }, yoyo: true, repeat: 3, duration: 180,
      onComplete: () => this.rec.setAlpha(0.25) });
  }

  private updateNear() {
    const door = this.player.x > 302;
    if (door !== this.atDoor) { this.atDoor = door; this.hooks.door(door); }
    const hit = door ? null : stations.find(s => Math.abs(s.x - this.player.x) < REACH) ?? null;
    const id = hit?.id ?? null;
    if (hit) this.marker.setPosition(hit.x, markerY[hit.id] + Math.sin(this.time.now / 200) * 1.5);
    if (id === this.nearStation) return;
    this.nearStation = id;
    this.marker.setVisible(!!hit);
    this.hooks.near(id);
  }

  private drawRoom() {
    const g = this.add.graphics();
    // Wall with acoustic panels, wooden floor.
    g.fillStyle(0x2b2a33).fillRect(0, 0, W, FLOOR);
    g.fillStyle(0x24232b);
    for (let x = 6; x < W; x += 34) for (let y = 14; y < 70; y += 26) g.fillRect(x, y, 26, 20);
    g.fillStyle(0x5a4433).fillRect(0, FLOOR, W, H - FLOOR);
    g.lineStyle(1, 0x4a3729);
    for (let x = 0; x < W; x += 40) g.lineBetween(x, FLOOR, x, H);
    g.lineBetween(0, FLOOR + 14, W, FLOOR + 14);
    g.fillStyle(0x3a2c22).fillRect(0, FLOOR - 3, W, 3);

    // Client brief: clipboard on the wall.
    g.fillStyle(0x7a5232).fillRect(27, 78, 18, 24);
    g.fillStyle(0xf1eee5).fillRect(29, 82, 14, 18);
    g.fillStyle(0x9a9488);
    for (let y = 85; y < 98; y += 3) g.fillRect(31, y, 10, 1);
    g.fillStyle(0xc0c0c0).fillRect(33, 76, 6, 4);

    // Guitar leaning by the wall: a nod to where the music started.
    g.fillStyle(0x3b2618).fillRect(62, 104, 3, 30);
    g.fillStyle(0x2a1a10).fillRect(61, 100, 5, 5);
    g.fillStyle(0xb5652b).fillEllipse(63.5, 140, 16, 14).fillEllipse(63.5, 130, 12, 10);
    g.fillStyle(0x1b120c).fillCircle(63.5, 134, 2.5);

    // Pedestal fan; blades are a separate object so they can spin.
    g.fillStyle(0x6f7378).fillRect(93, 120, 2, 28).fillRect(87, 147, 14, 3);
    g.lineStyle(1, 0xa9adb2).strokeCircle(94, 112, 10);
    this.blades = this.add.graphics({ x: 94, y: 112 });
    this.blades.fillStyle(0xc9cdd2);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      this.blades.fillTriangle(0, 0, Math.cos(a) * 9, Math.sin(a) * 9, Math.cos(a + 0.7) * 9, Math.sin(a + 0.7) * 9);
    }

    // Window onto a building site.
    g.fillStyle(0x1d1c22).fillRect(132, 46, 52, 64);
    g.fillStyle(0x8fb3c9).fillRect(135, 49, 46, 58);
    g.fillStyle(0x6e8a6a).fillRect(135, 95, 46, 12);
    g.fillStyle(0xd9a637).fillRect(168, 56, 2, 40).fillRect(150, 56, 24, 2); // crane
    g.lineStyle(1, 0x1d1c22).lineBetween(158, 49, 158, 107);
    this.digger = this.add.rectangle(146, 92, 12, 6, 0xe0a83a).setOrigin(0, 0.5);
    this.add.rectangle(140, 95, 10, 6, 0xe0a83a);
    this.tweens.add({ targets: this.digger, angle: { from: -18, to: 6 }, yoyo: true, repeat: -1, duration: 500,
      onUpdate: () => { if (!this.building) this.digger.setAngle(-18); } });
    for (let i = 0; i < 4; i++) {
      const d = this.add.rectangle(150 + i * 6, 100, 2, 2, 0xd8cbb0);
      this.tweens.add({ targets: d, y: 84, alpha: 0, repeat: -1, duration: 700, delay: i * 170 });
      this.dust.push(d);
    }

    // Glass booth with microphone and REC light.
    g.fillStyle(0x3b4450, 0.35).fillRect(202, 40, 46, FLOOR - 40);
    g.lineStyle(1, 0x7e8a96).strokeRect(202, 40, 46, FLOOR - 40);
    g.fillStyle(0x30333a).fillRect(223, 106, 2, 42).fillRect(217, 147, 14, 3);
    g.fillStyle(0x8b8f96).fillRoundedRect(220, 96, 8, 12, 3);
    g.lineStyle(1, 0x55595f).strokeCircle(215, 102, 5);
    this.rec = this.add.circle(225, 32, 3, 0xe0483e).setAlpha(0.25);

    // Mixing desk with monitor.
    g.fillStyle(0x1e1d23).fillRect(250, 86, 46, 30);
    g.fillStyle(0x0f1418).fillRect(252, 88, 42, 26);
    g.fillStyle(0x3a2c22).fillRect(244, 118, 58, 4).fillRect(246, 122, 3, 26).fillRect(297, 122, 3, 26);
    g.fillStyle(0x2f3138).fillRect(248, 114, 50, 5);
    g.fillStyle(0xc9cdd2);
    for (let x = 252; x < 296; x += 5) g.fillRect(x, 115, 2, 2);
    this.wave = this.add.graphics();
  }

  private drawWave(state: StudioState) {
    const take = state.take, g = this.wave.clear();
    const y0 = 101;
    if (!take) { g.lineStyle(1, 0x3f5560).lineBetween(254, y0, 292, y0); return; }
    const noisy = take.fan || take.construction;
    g.lineStyle(1, state.delivered ? 0x7fd18b : take.processed ? 0xe4b367 : noisy ? 0xe0786b : 0x6fc7d6);
    g.beginPath();
    for (let i = 0; i <= 38; i++) {
      const speech = Math.sin(i * 0.9) * Math.sin(i * 0.17) * 7;
      const hiss = noisy && !take.processed ? Math.sin(i * 12.9898) * 3.5 : 0;
      const pt = take.processed ? speech * 0.6 : speech + hiss;
      i ? g.lineTo(254 + i, y0 + pt) : g.moveTo(254, y0 + pt);
    }
    g.strokePath();
  }
}

const markerY: Record<Station, number> = { brief: 68, fan: 92, window: 36, mic: 82, desk: 76 };
