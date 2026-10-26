import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { audio } from '../sound';
import * as hud from '../hud';

// SACAC classroom: patch the signal chain in the order the sound actually travels.
const order = ['guitar', 'mic', 'preamp', 'mixer', 'speakers'];

export class SacacLevel extends Room {
  stage = stages.find(s => s.id === 'sacac')!;
  intro = 'First week at SACAC. Make the guitar heard: connect the signal chain in the order the sound travels.';
  spots: Spot[] = [
    { id: 'guitar', x: 30, label: 'pick up the guitar', markerY: 96 },
    { id: 'mic', x: 90, label: 'connect the microphone', markerY: 92 },
    { id: 'preamp', x: 150, label: 'connect the preamp', markerY: 104 },
    { id: 'mixer', x: 215, label: 'connect the mixer', markerY: 98 },
    { id: 'speakers', x: 285, label: 'connect the speakers', markerY: 76 },
  ];
  private step = 0;
  private cables!: Phaser.GameObjects.Graphics;
  private cone!: Phaser.GameObjects.Arc;

  constructor() { super('sacac'); }

  protected reset() { this.step = 0; }

  protected use(id: string) {
    const label = this.spots.find(s => s.id === id)!.label.replace(/^\w+ (up )?(the )?/, '');
    if (order.indexOf(id) < this.step) return hud.say(`The ${label} is already connected.`);
    if (id !== order[this.step]) return hud.say(`The ${label} has no signal yet. What does the sound pass through before it gets here?`);
    this.step++;
    const pts = order.slice(0, this.step).map(o => this.spots.find(s => s.id === o)!.x);
    this.cables.clear().lineStyle(2, 0xe4b367);
    for (let i = 1; i < pts.length; i++) this.cables.lineBetween(pts[i - 1], 146, pts[i], 146);
    if (this.step === 1) return hud.say('Guitar in hand. Now follow the sound: where does it go first?');
    if (this.step < order.length) return hud.say(`${label[0].toUpperCase()}${label.slice(1)} connected. Keep going.`);
    hud.say('Signal through. The room fills with sound. This is what you want to do.');
    void audio.chord();
    this.tweens.add({ targets: this.cone, scale: 1.4, yoyo: true, repeat: 5, duration: 120 });
    this.time.delayedCall(1800, () => this.finish());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x34404a).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0xf1eee5).fillRect(60, 20, 200, 44); // whiteboard
    g.lineStyle(1, 0x3d6a96).lineBetween(80, 42, 240, 42);
    for (let x = 90; x < 240; x += 36) g.fillStyle(0x3d6a96).fillRect(x, 38, 8, 8);
    g.fillStyle(0x5a4433).fillRect(0, FLOOR, ROOM_W, 30);
    // Guitar on a stand.
    g.fillStyle(0xb5652b).fillEllipse(30, 138, 16, 14).fillEllipse(30, 128, 12, 10);
    g.fillStyle(0x3b2618).fillRect(29, 100, 3, 28);
    // Mic stand.
    g.fillStyle(0x30333a).fillRect(89, 108, 2, 40).fillRect(83, 147, 14, 3);
    g.fillStyle(0x8b8f96).fillRoundedRect(86, 100, 8, 10, 3);
    // Preamp rack.
    g.fillStyle(0x1e1d23).fillRect(138, 112, 24, 36);
    g.fillStyle(0xe4b367);
    for (const y of [118, 128, 138]) g.fillCircle(150, y, 2);
    // Mixer on a table.
    g.fillStyle(0x3a2c22).fillRect(196, 120, 40, 4).fillRect(198, 124, 3, 24).fillRect(231, 124, 3, 24);
    g.fillStyle(0x2f3138).fillRect(198, 108, 36, 12);
    g.fillStyle(0xc9cdd2);
    for (let x = 201; x < 232; x += 5) g.fillRect(x, 111, 2, 6);
    // Speaker.
    g.fillStyle(0x1b1a21).fillRect(272, 84, 26, 64);
    g.fillStyle(0x3a3744).fillCircle(285, 102, 5);
    this.cone = this.add.circle(285, 128, 9, 0x3a3744);
    this.cables = this.add.graphics();
  }
}
