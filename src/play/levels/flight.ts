import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { input } from '../input';
import { done, VIEW_W, LAND_X } from '../world';
import * as hud from '../hud';

// Delhi to Paris. The plane flies itself forward; you steer up and down.
const DURATION = 30_000;
type Thing = { obj: Phaser.GameObjects.Container; storm: boolean };

export class FlightLevel extends Phaser.Scene {
  private stage = stages.find(s => s.id === 'flight')!;
  private plane!: Phaser.GameObjects.Container;
  private things: Thing[] = [];
  private t = 0;
  private spawnIn = 0;
  private notes = 0;
  private landing = false;
  private delhi!: Phaser.GameObjects.Graphics;
  private paris!: Phaser.GameObjects.Graphics;

  constructor() { super('flight'); }

  create() {
    this.things = []; this.t = 0; this.spawnIn = 1200; this.notes = 0; this.landing = false;
    const g = this.add.graphics();
    [0x5d8fc4, 0x76a3cf, 0x93b8da, 0xb1cde4].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 45, VIEW_W, 45));
    this.delhi = this.add.graphics();
    this.delhi.fillStyle(0xc9a86a).fillRect(40, 140, 44, 40).fillRect(30, 132, 64, 10);
    this.delhi.fillStyle(0x93b8da).fillRect(52, 152, 20, 28);
    this.delhi.fillStyle(0x7a8a6a).fillRect(0, 170, VIEW_W, 10);
    this.paris = this.add.graphics().setX(VIEW_W + 40);
    this.paris.lineStyle(2, 0x4a4f5a).lineBetween(40, 180, 60, 90).lineBetween(80, 180, 60, 90).lineBetween(46, 150, 74, 150).lineBetween(52, 120, 68, 120);
    this.paris.fillStyle(0x7a8a6a).fillRect(-60, 170, 300, 10);

    this.plane = this.add.container(70, 90, [this.add.graphics()
      .fillStyle(0xf4f1ea).fillEllipse(0, 0, 36, 9)
      .fillStyle(0xd8d2c4).fillTriangle(-4, 1, 8, 1, -2, 12).fillTriangle(-18, 0, -12, 0, -18, -10)
      .fillStyle(0x3d6a96).fillRect(-8, -2, 2, 2).fillRect(-3, -2, 2, 2).fillRect(2, -2, 2, 2).fillRect(13, -2, 3, 2)]).setDepth(5);

    input.handler = key => { if (key === 'Escape') this.scene.start('world', { x: this.stage.x }); };
    hud.prompt('↑ ↓ fly · catch the notes, dodge the storm clouds');
    hud.say('Delhi to Paris. You have the controls.');
  }

  update(_: number, delta: number) {
    this.t += delta;
    const progress = Math.min(1, this.t / DURATION);
    hud.status(`Delhi ✈ Paris · ${Math.round(progress * 100)}% · notes caught: ${this.notes}`);
    this.delhi.x -= delta * 0.03;
    if (progress > 0.8) this.paris.x = Math.max(200, this.paris.x - delta * 0.04);

    if (this.landing) {
      this.plane.y = Math.min(160, this.plane.y + delta * 0.03);
      this.plane.x += delta * 0.04;
    } else {
      this.plane.y = Phaser.Math.Clamp(this.plane.y + ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * delta * 0.09, 14, 150);
      input.jump = false;
      this.spawnIn -= delta;
      if (this.spawnIn <= 0 && progress < 0.85) { this.spawn(); this.spawnIn = 700 + Math.random() * 500; }
      if (progress >= 1) this.land();
    }

    for (const thing of [...this.things]) {
      thing.obj.x -= delta * 0.1;
      const hit = Math.abs(thing.obj.x - this.plane.x) < 16 && Math.abs(thing.obj.y - this.plane.y) < 10;
      if (hit && !thing.storm) { this.notes++; this.remove(thing); }
      else if (hit) { this.cameras.main.shake(200, 0.01); hud.say('Turbulence. Steer around the dark clouds.'); this.remove(thing); }
      else if (thing.obj.x < -20) this.remove(thing);
    }
  }

  private spawn() {
    const storm = Math.random() < 0.4, y = 20 + Math.random() * 120, g = this.add.graphics();
    if (storm) {
      g.fillStyle(0x4a4f5a).fillEllipse(0, 0, 30, 14).fillEllipse(-8, -5, 16, 12).fillEllipse(8, -6, 18, 12);
      g.lineStyle(1, 0xe4b367).lineBetween(0, 6, -3, 12).lineBetween(-3, 12, 2, 12).lineBetween(2, 12, -1, 18);
    } else {
      g.fillStyle(0xe4b367).fillCircle(0, 4, 3).fillRect(2, -6, 1.5, 10).fillRect(2, -6, 5, 1.5);
    }
    this.things.push({ obj: this.add.container(VIEW_W + 20, y, [g]), storm });
  }

  private remove(thing: Thing) { thing.obj.destroy(); this.things = this.things.filter(t => t !== thing); }

  private land() {
    this.landing = true;
    hud.say(`Landing in Paris. ${this.notes} notes caught on the way.`);
    hud.prompt('');
    this.time.delayedCall(2500, () => hud.card(this.stage, () => {
      done.add(this.stage.id);
      this.scene.start('world', { x: LAND_X });
    }));
  }
}
