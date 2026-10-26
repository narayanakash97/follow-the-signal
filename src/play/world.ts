import * as Phaser from 'phaser';
import { frames, drawSprite } from '../sprite';
import { stages, type Stage } from '../stages';
import { input } from './input';
import * as hud from './hud';

export const VIEW_W = 320, VIEW_H = 180;
const WORLD_W = 2650, GROUND = 160, DOOR_REACH = 18, SEA = [1780, 1860];
/** Where the plane drops you in Paris. */
export const LAND_X = 1880;

/** Stages finished this session. A gate opens once the stage before it is done. */
export const done = new Set<Stage['id']>();

export function ensureTextures(scene: Phaser.Scene) {
  frames.forEach((f, i) => { if (!scene.textures.exists(`akash${i}`)) scene.textures.addCanvas(`akash${i}`, drawSprite(f)); });
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private near: Stage | null = null;
  private walkClock = 0;

  constructor() { super('world'); }

  create(data: { x?: number }) {
    ensureTextures(this);
    this.physics.world.setBounds(0, 0, WORLD_W, VIEW_H);
    this.drawWorld();

    const ground = this.add.rectangle(WORLD_W / 2, GROUND + 10, WORLD_W, 20).setVisible(false);
    this.physics.add.existing(ground, true);
    this.player = this.physics.add.sprite(data.x ?? 30, GROUND - 14, 'akash0').setDepth(10).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // A gate stands before every stage whose previous stage is not finished.
    stages.forEach((s, i) => {
      if (i === 0 || done.has(stages[i - 1].id)) return;
      const gate = this.add.rectangle(s.x - 70, GROUND - 20, 6, 40, 0xe0a83a).setDepth(4);
      this.add.rectangle(s.x - 70, GROUND - 42, 14, 4, 0xe0a83a).setDepth(4);
      this.physics.add.existing(gate, true);
      this.physics.add.collider(this.player, gate);
    });

    // Until you have flown, the sea between Delhi and Paris blocks the way.
    if (!done.has('flight')) {
      const wall = this.add.rectangle(SEA[0], GROUND - 40, 4, 80).setVisible(false);
      this.physics.add.existing(wall, true);
      this.physics.add.collider(this.player, wall);
    }

    this.cameras.main.setBounds(0, 0, WORLD_W, VIEW_H).startFollow(this.player, true, 0.15, 0.15);
    input.handler = key => { if ((key === 'e' || key === 'Enter') && this.near) this.enter(this.near); };
    this.near = null;
    hud.prompt('');
    hud.say('');
    hud.showQueuedEnding();
  }

  update(_: number, delta: number) {
    const body = this.player.body;
    const dir = hud.cardOpen() ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    body.setVelocityX(dir * 90);
    if (input.jump && body.blocked.down && !hud.cardOpen()) body.setVelocityY(-250);
    input.jump = false;
    if (dir) { this.player.setFlipX(dir < 0); this.walkClock += delta; }
    this.player.setTexture(`akash${dir && body.blocked.down ? Math.floor(this.walkClock / 150) % 2 : 0}`);

    const x = this.player.x;
    const region = [...stages].reverse().find(s => x > s.x - 130) ?? stages[0];
    hud.where(region);
    const near = stages.find(s => Math.abs(s.x - x) < DOOR_REACH) ?? null;
    if (near !== this.near) {
      this.near = near;
      hud.prompt(near ? `Press E to enter: ${near.title}${done.has(near.id) ? ' ✓' : ''}` : '');
    }
  }

  private enter(stage: Stage) { this.scene.start(stage.scene); }

  private drawWorld() {
    const g = this.add.graphics();
    // Sky by region: Delhi dusk, Mumbai festival night, Dubai gold, Delhi airport, Paris, Rouen, Paris.
    const skies: [number, number, number][] = [[0, 1000, 0xe8a87c], [1000, 1300, 0x1d1b3a], [1300, 1600, 0xe9c98f], [1600, 1780, 0xe8a87c], [1780, 2120, 0x8fb3d9], [2120, 2380, 0xb9cde0], [2380, WORLD_W, 0x8fb3d9]];
    skies.forEach(([a, b, c]) => g.fillStyle(c).fillRect(a, 0, b - a, GROUND));
    g.fillStyle(0x6b5a4a).fillRect(0, GROUND, WORLD_W, VIEW_H - GROUND);
    g.fillStyle(0x4e4136);
    for (let x = 0; x < WORLD_W; x += 24) g.fillRect(x, GROUND + 6, 12, 2);

    // 1. Jamia gate, then the Supreme Court: cream facade, dome, columns.
    g.fillStyle(0x2e6b4a).fillRect(104, 112, 8, 48).fillRect(136, 112, 8, 48).fillRect(100, 104, 48, 10);
    g.fillStyle(0xf1eee5).fillRect(112, 106, 24, 5);
    g.fillStyle(0xe9dfc6).fillRect(250, 100, 100, 60);
    g.fillStyle(0xd8ccb0).fillTriangle(250, 100, 350, 100, 300, 84).fillRect(240, 155, 120, 5);
    g.fillStyle(0xe9dfc6).fillEllipse(300, 72, 30, 26);
    g.fillStyle(0x5a4a3a).fillRect(298, 54, 4, 8);
    g.fillStyle(0xcbbd9c);
    for (let x = 258; x < 345; x += 12) g.fillRect(x, 106, 4, 49);
    g.fillStyle(0x4a3a2c).fillRect(292, 132, 16, 23);

    // 2. SACAC: brick building with a music-note sign.
    g.fillStyle(0xa04a32).fillRect(520, 96, 80, 64);
    g.fillStyle(0xf3d9a0);
    for (const x of [530, 552, 574]) for (const y of [106, 128]) g.fillRect(x, y, 12, 10);
    g.fillStyle(0x1b1a21).fillRect(554, 140, 12, 20).fillCircle(548, 88, 4).fillRect(551, 74, 2, 14).fillRect(551, 74, 8, 2);

    // 3. Square Wave Studios: charcoal block with a cyan waveform sign.
    g.fillStyle(0x2b2a33).fillRect(780, 100, 80, 60);
    g.lineStyle(2, 0x6fc7d6).beginPath();
    for (let i = 0; i <= 50; i++) { const y = 112 + Math.sin(i * 0.8) * Math.sin(i * 0.12) * 6; i ? g.lineTo(795 + i, y) : g.moveTo(795, y); }
    g.strokePath();
    g.fillStyle(0x15141a).fillRect(812, 136, 16, 24);

    // 4. Mumbai festival stage: truss, hanging line arrays, lights.
    g.fillStyle(0x6f7378).fillRect(1060, 70, 4, 90).fillRect(1196, 70, 4, 90).fillRect(1060, 66, 140, 6);
    g.fillStyle(0x15141a).fillRect(1066, 110, 128, 6);
    g.fillStyle(0x24232b);
    for (const x of [1072, 1176]) for (let y = 76; y < 106; y += 6) g.fillRect(x, y, 12, 5);
    [0xe0483e, 0x6fc7d6, 0xe4b367, 0xb07cd6, 0x7fd18b].forEach((c, i) => g.fillStyle(c).fillCircle(1100 + i * 15, 76, 3));
    g.fillStyle(0x0f0e1c);
    for (let x = 1010; x < 1250; x += 9) g.fillCircle(x, 158, 4 + (x % 3));

    // 5. Dubai: Burj silhouette and the COP28 conference hall with podiums.
    g.fillStyle(0xc9a86a).fillRect(1350, 40, 6, 120).fillRect(1346, 80, 14, 80).fillRect(1342, 120, 22, 40).fillRect(1352, 24, 2, 16);
    g.fillStyle(0xf4f1ea).fillRect(1400, 110, 110, 50);
    g.fillStyle(0x2a9d8f).fillRect(1400, 104, 110, 8);
    g.fillStyle(0x5a5f66);
    for (let x = 1410; x < 1505; x += 14) g.fillRect(x, 144, 6, 16);

    // Delhi airport: terminal and a parked plane.
    g.fillStyle(0xd8d2c4).fillRect(1640, 110, 110, 50);
    g.fillStyle(0x6f9ac0);
    for (let x = 1646; x < 1745; x += 10) g.fillRect(x, 116, 7, 20);
    g.fillStyle(0x3d4a5a).fillRect(1692, 138, 16, 22);
    g.fillStyle(0xf4f1ea).fillEllipse(1620, 146, 40, 9).fillTriangle(1604, 146, 1610, 146, 1604, 134);

    // The sea, crossed only by plane.
    g.fillStyle(0x3d6a96).fillRect(SEA[0], GROUND, SEA[1] - SEA[0], VIEW_H - GROUND);

    // Paris: Eiffel Tower, then KEDGE's glass building.
    g.lineStyle(2, 0x4a4f5a).lineBetween(1890, 160, 1910, 40).lineBetween(1930, 160, 1910, 40);
    g.lineBetween(1896, 126, 1924, 126).lineBetween(1902, 90, 1918, 90);
    g.fillStyle(0x3d6a96).fillRect(1950, 92, 80, 68);
    g.fillStyle(0x9cc3e0);
    for (let x = 1954; x < 2026; x += 10) for (let y = 96; y < 132; y += 10) g.fillRect(x, y, 7, 7);
    g.fillStyle(0x1b2a3a).fillRect(1972, 138, 16, 22);

    // Rouen: cathedral spire and a half-timbered house.
    g.fillStyle(0x7d776c).fillRect(2180, 70, 26, 90).fillTriangle(2180, 70, 2206, 70, 2193, 26);
    g.fillStyle(0xf1e6cc).fillRect(2225, 96, 50, 64);
    g.lineStyle(2, 0x5a3a24).strokeRect(2225, 96, 50, 64).lineBetween(2225, 96, 2250, 128).lineBetween(2275, 96, 2250, 128);
    g.fillStyle(0x8a3a2a).fillTriangle(2221, 96, 2279, 96, 2250, 78);
    g.fillStyle(0x5a3a24).fillRect(2242, 140, 16, 20);

    // micro1: a Paris apartment block with a lit window.
    g.fillStyle(0xe8dcc4).fillRect(2460, 70, 80, 90);
    g.fillStyle(0x4a5a6a).fillRect(2456, 62, 88, 10);
    g.fillStyle(0x9cc3e0);
    for (const x of [2470, 2495, 2520]) for (const y of [80, 104]) g.fillRect(x, y, 12, 14);
    g.fillStyle(0x6fc7d6).fillRect(2495, 104, 12, 14);
    g.fillStyle(0x4a3a2c).fillRect(2492, 136, 16, 24);

    // Door markers so every entrance is easy to spot.
    for (const s of stages) g.fillStyle(0xe4b367).fillTriangle(s.x - 4, 34, s.x + 4, 34, s.x, 40);
  }
}
