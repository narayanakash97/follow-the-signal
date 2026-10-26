import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { audio } from '../sound';
import * as hud from '../hud';

// SACAC: the chain is patched but silent. Strum, watch where the signal stops, fix it. Twice.
const chain = ['guitar', 'mic', 'preamp', 'speakers'];

export class SacacLevel extends Room {
  stage = stages.find(s => s.id === 'sacac')!;
  intro = 'First week at SACAC. The rig is patched, but nothing comes out of the speakers. Strum the guitar and watch the signal lights to see where the sound stops.';
  spots: Spot[] = [
    { id: 'guitar', x: 30, label: 'Guitar', markerY: 96 },
    { id: 'mic', x: 95, label: 'Condenser microphone', markerY: 92 },
    { id: 'preamp', x: 165, label: 'Preamp', markerY: 100 },
    { id: 'speakers', x: 245, label: 'Speakers', markerY: 76 },
  ];
  private phantom = false;
  private cableOk = false;
  private cableSeen = false;
  private signalLights: Phaser.GameObjects.Arc[] = [];
  private cone!: Phaser.GameObjects.Arc;

  constructor() { super('sacac'); }

  protected reset() { this.phantom = this.cableOk = this.cableSeen = false; this.signalLights = []; }

  protected hint(s: Spot) {
    if (s.id === 'guitar') return 'Guitar · E strum';
    if (s.id === 'preamp') return `Preamp · 1 phantom power 48V (${this.phantom ? 'on' : 'off'}) · 2 gain up`;
    if (s.id === 'speakers' && this.cableSeen && !this.cableOk) return 'Speakers · E swap in a new cable';
    return `${s.label} · E inspect`;
  }

  /** How far along the chain the signal gets. */
  private reach() {
    if (!this.phantom) return 1; // a condenser mic is dead without power
    if (!this.cableOk) return 3; // stops at the cracked speaker cable
    return 4;
  }

  protected use(id: string) {
    if (id === 'guitar') return this.strum();
    if (id === 'mic') return hud.say('A condenser mic. Unlike a dynamic mic, it needs power from the preamp to make any signal at all.');
    if (id === 'preamp') return hud.say('Use 1 or 2 here.');
    if (this.cableOk) return hud.say('New cable, firmly seated.');
    if (!this.cableSeen) { this.cableSeen = true; this.refreshPrompt(); return hud.say('The speakers are switched on. Behind them, the cable\'s connector is cracked.'); }
    this.cableOk = true;
    this.refreshPrompt();
    hud.say('Old cable out, new cable in. Strum again.');
  }

  protected choose(key: string) {
    if (this.near?.id !== 'preamp') return;
    if (key === '1') { this.phantom = !this.phantom; this.refreshPrompt(); hud.say(`Phantom power ${this.phantom ? 'on' : 'off'}.`); }
    if (key === '2') hud.say(this.phantom ? 'Gain up a little. Fine, but gain was never the problem.' : 'Gain up. The meter still shows nothing: there is no signal to amplify.');
  }

  private strum() {
    const n = this.reach();
    this.signalLights.forEach((l, i) => l.setFillStyle(i < n ? 0x7fd18b : 0x3a3744));
    if (n < chain.length) return hud.say(`Strum. The signal lights stop after the ${chain[n - 1]}. Something between there and the ${chain[n]} is wrong.`);
    this.over = true;
    void audio.chord();
    this.tweens.add({ targets: this.cone, scale: 1.4, yoyo: true, repeat: 5, duration: 120 });
    hud.say('The room fills with sound. Two faults, both found by following the signal. This is what you want to do.');
    this.time.delayedCall(2200, () => this.finish());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x34404a).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0xf1eee5).fillRect(60, 14, 180, 40);
    g.lineStyle(1, 0x3d6a96).lineBetween(76, 34, 226, 34);
    for (let x = 84; x < 226; x += 30) g.fillStyle(0x3d6a96).fillRect(x, 30, 8, 8);
    g.fillStyle(0x5a4433).fillRect(0, FLOOR, ROOM_W, 30);
    g.lineStyle(1, 0xe4b367, 0.7).lineBetween(30, 146, 245, 146); // the patched chain
    g.fillStyle(0xb5652b).fillEllipse(30, 138, 16, 14).fillEllipse(30, 128, 12, 10);
    g.fillStyle(0x3b2618).fillRect(29, 100, 3, 28);
    g.fillStyle(0x30333a).fillRect(94, 108, 2, 40).fillRect(88, 147, 14, 3);
    g.fillStyle(0xb9bdc4).fillRoundedRect(90, 98, 10, 12, 3);
    g.fillStyle(0x1e1d23).fillRect(153, 112, 24, 36);
    g.fillStyle(0xe4b367);
    for (const y of [118, 128, 138]) g.fillCircle(165, y, 2);
    g.fillStyle(0x1b1a21).fillRect(232, 84, 26, 64);
    g.fillStyle(0x3a3744).fillCircle(245, 102, 5);
    this.cone = this.add.circle(245, 128, 9, 0x3a3744);
    this.signalLights = this.spots.map(s => this.add.circle(s.x, (s.markerY ?? 70) - 10, 3, 0x3a3744));
  }
}
