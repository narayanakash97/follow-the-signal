import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { input } from '../input';
import { done, VIEW_W, LAND_X } from '../world';
import { audio } from '../sound';
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
  private stolen = 0;
  private safeUntil = 0;
  private landing = false;
  private delhi!: Phaser.GameObjects.Graphics;
  private paris!: Phaser.GameObjects.Graphics;

  constructor() { super('flight'); }

  create() {
    this.things = []; this.t = 0; this.spawnIn = 1200; this.notes = 0; this.stolen = 0; this.safeUntil = 0; this.landing = false;
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
    hud.status(`Delhi ✈ Paris ${Math.round(progress * 100)}% · ♪ yours: ${this.notes} · ⚡ storm took: ${this.stolen}`);
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
      else if (hit && this.t > this.safeUntil) { this.thunder(thing); this.remove(thing); }
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

  /** Lightning strikes: the plane rattles, and the storm takes up to two of your notes. */
  private thunder(cloud: Thing) {
    const taken = Math.min(2, this.notes);
    this.notes -= taken;
    this.stolen += taken;
    this.safeUntil = this.t + 1200;
    const bolt = this.add.graphics().setDepth(6).lineStyle(2, 0xfff3b0);
    let x = cloud.obj.x, y = cloud.obj.y + 6;
    bolt.beginPath().moveTo(x, y);
    while (y < this.plane.y - 4) { x += (this.plane.x - x) / 3 + (Math.random() * 8 - 4); y += 7; bolt.lineTo(x, y); }
    bolt.lineTo(this.plane.x, this.plane.y).strokePath();
    this.tweens.add({ targets: bolt, alpha: 0, duration: 350, onComplete: () => bolt.destroy() });
    this.cameras.main.flash(120, 255, 250, 220).shake(400, 0.015);
    this.tweens.add({ targets: this.plane, angle: { from: -12, to: 12 }, yoyo: true, repeat: 4, duration: 50, onComplete: () => this.plane.setAngle(0) });
    this.tweens.add({ targets: this.plane, alpha: 0.3, yoyo: true, repeat: 5, duration: 100, onComplete: () => this.plane.setAlpha(1) });
    void audio.thunder();
    hud.say(taken ? `Lightning! The storm took ${taken} of your notes.` : 'Lightning! Nothing to lose yet, but steer clear.');
  }

  private remove(thing: Thing) { thing.obj.destroy(); this.things = this.things.filter(t => t !== thing); }

  private land() {
    this.landing = true;
    hud.say(this.notes > this.stolen
      ? `Landing in Paris with ${this.notes} notes. The storm only got ${this.stolen}.`
      : `Landing in Paris. The storm took ${this.stolen} notes and you kept ${this.notes}. Rough flight.`);
    hud.prompt('');
    this.time.delayedCall(2500, () => hud.card(this.stage, () => {
      done.add(this.stage.id);
      this.scene.start('world', { x: LAND_X });
    }));
  }
}
