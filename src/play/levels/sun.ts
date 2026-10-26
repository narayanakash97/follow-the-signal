import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import * as hud from '../hud';

// Festival soundcheck in Mumbai: ring out the monitor and clear the wireless before doors open.
export class SunLevel extends Room {
  stage = stages.find(s => s.id === 'sun')!;
  intro = 'Festival soundcheck, Mumbai. The monitor wedge is feeding back and a wireless channel is dropping out. Fix both, then do the line check before the doors open.';
  spots: Spot[] = [
    { id: 'wedge', x: 50, label: 'listen to the monitor wedge', markerY: 116 },
    { id: 'desk', x: 125, label: 'Allen & Heath desk', markerY: 96 },
    { id: 'rack', x: 200, label: 'scan the Shure wireless rack', markerY: 92 },
    { id: 'array', x: 280, label: 'line check on the Meyer Sound system', markerY: 30 },
  ];
  private heard = false;
  private feedback = true;
  private scanned = false;
  private wireless = false;
  private rings!: Phaser.GameObjects.Arc;
  private crowd!: Phaser.GameObjects.Graphics;

  constructor() { super('sun'); }

  protected reset() { this.heard = this.scanned = this.wireless = false; this.feedback = true; }

  protected hint(s: Spot) {
    if (s.id === 'desk') return '1: cut 2.5 kHz on the monitor mix · 2: cut 250 Hz · 3: push the master fader up';
    if (s.id === 'rack' && this.scanned && !this.wireless) return '1: move channel 3 to a clear frequency · 2: turn its transmitter power up';
    return super.hint(s);
  }

  protected use(id: string) {
    if (id === 'wedge') {
      this.heard = true;
      return hud.say(this.feedback ? 'A sharp ring, high and piercing. It sits around 2.5 kHz.' : 'Clean. The vocal mic can go loud without ringing.');
    }
    if (id === 'desk') return hud.say('Pick an EQ move with 1, 2 or 3.');
    if (id === 'rack') {
      this.scanned = true;
      this.refreshPrompt();
      return hud.say(this.wireless ? 'All channels clean.' : 'Scan done: channel 3 sits on a frequency a local transmitter is using. Press 1 or 2.');
    }
    const left = [this.feedback && 'the wedge is still feeding back', !this.wireless && 'channel 3 is still dropping out'].filter(Boolean);
    if (left.length) return hud.say(`Not ready: ${left.join(' and ')}.`);
    hud.say('Line check passes. Doors open.');
    this.crowd.setVisible(true);
    this.time.delayedCall(1800, () => this.finish());
  }

  protected choose(key: string) {
    if (this.near?.id === 'desk') {
      if (key === '1') {
        if (!this.heard) return hud.say('Which frequency? Listen at the wedge before you reach for the EQ.');
        this.feedback = false;
        this.rings.setVisible(false);
        hud.say('Ringing gone. A narrow cut fixed it without dulling the whole mix.');
      } else if (key === '2') hud.say('250 Hz is the low-mid body. The ring is much higher. Listen again.');
      else if (key === '3') hud.say('Louder makes feedback worse, not better.');
    } else if (this.near?.id === 'rack' && this.scanned && !this.wireless) {
      if (key === '1') { this.wireless = true; this.refreshPrompt(); hud.say('Channel 3 moved to a clear frequency. No more dropouts.'); }
      else if (key === '2') hud.say('More power on a crowded frequency just means a louder fight. Move it instead.');
    }
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x1d1b3a).fillRect(0, 0, ROOM_W, FLOOR);
    [0xe0483e, 0x6fc7d6, 0xe4b367, 0xb07cd6, 0x7fd18b].forEach((c, i) => {
      g.fillStyle(c, 0.18).fillTriangle(60 + i * 50, 0, 40 + i * 50, FLOOR, 80 + i * 50, FLOOR);
      g.fillStyle(c).fillCircle(60 + i * 50, 6, 3);
    });
    g.fillStyle(0x6f7378).fillRect(0, 0, ROOM_W, 3);
    g.fillStyle(0x2a2833).fillRect(0, FLOOR, ROOM_W, 30);
    // Monitor wedge.
    g.fillStyle(0x15141a).fillTriangle(36, 150, 64, 150, 64, 132);
    this.rings = this.add.circle(52, 128, 8).setStrokeStyle(1, 0xe0483e);
    this.tweens.add({ targets: this.rings, scale: 2, alpha: 0, repeat: -1, duration: 500 });
    // Mixing desk.
    g.fillStyle(0x2f3138).fillRect(104, 112, 44, 14);
    g.fillStyle(0x3a2c22).fillRect(106, 126, 3, 24).fillRect(143, 126, 3, 24);
    g.fillStyle(0xe0483e);
    for (let x = 108; x < 146; x += 6) g.fillRect(x, 115, 2, 6);
    // Wireless rack.
    g.fillStyle(0x1e1d23).fillRect(188, 104, 24, 46);
    g.fillStyle(0x7fd18b);
    for (let y = 108; y < 146; y += 8) g.fillRect(192, y, 16, 3);
    // Line array, hung.
    g.fillStyle(0x6f7378).fillRect(279, 3, 2, 24);
    g.fillStyle(0x15141a);
    for (let y = 30; y < 80; y += 8) g.fillRect(268, y, 24, 7);
    this.crowd = this.add.graphics().setVisible(false).setDepth(4);
    this.crowd.fillStyle(0x0f0e1c);
    for (let x = 4; x < ROOM_W; x += 9) this.crowd.fillCircle(x, 176, 6);
  }
}
