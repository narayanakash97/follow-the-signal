import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { audio } from '../sound';
import * as hud from '../hud';

// micro1: rank three AI voice clips, diagnose each flaw, then calibrate a reviewer who disagrees.
type Step = { ask: string; options: string[]; answer: number; right: string; wrong: string };
const steps: Step[] = [
  { ask: 'Which clip is most natural?', options: ['clip A', 'clip B', 'clip C'], answer: 0,
    right: 'Clip A. Now explain the other two, so your call can be checked.', wrong: 'Listen again, or compare the waveforms. One is steady, one jumps, one is squeezed.' },
  { ask: 'What is wrong with clip B?', options: ['pitch jumps mid-phrase', 'timing is rushed', 'background hiss'], answer: 0,
    right: 'Right: B leaps in pitch in the middle.', wrong: 'Not that. Look at the middle of B\'s waveform.' },
  { ask: 'What is wrong with clip C?', options: ['pitch jumps mid-phrase', 'timing is rushed', 'background hiss'], answer: 1,
    right: 'Right: C squeezes the whole phrase. Feedback written. One reviewer task left.', wrong: 'Not that. C\'s pitch is fine. Compare its length with A.' },
  { ask: 'Another reviewer rated C best: "it sounds more energetic". Your call?', options: ['accept it', 'send it back'], answer: 1,
    right: 'Sent back: energy is not naturalness, and C is rushed. Same guideline, same standard for everyone.', wrong: 'That rating goes against the guideline. A reviewer catches it and explains why.' },
];

export class Micro1Level extends Room {
  stage = stages.find(s => s.id === 'micro1')!;
  intro = 'Home desk in Paris. Three AI voice clips need a judgment within 90 seconds. Listen (M turns sound on) or read the waveforms, check the guideline, then decide at the laptop.';
  limit = 90_000;
  outOfTime = 'The task timed out before you submitted.';
  spots: Spot[] = [
    { id: 'a', x: 40, label: 'Clip A', markerY: 60 },
    { id: 'b', x: 95, label: 'Clip B', markerY: 60 },
    { id: 'c', x: 150, label: 'Clip C', markerY: 60 },
    { id: 'guide', x: 205, label: 'Guideline', markerY: 70 },
    { id: 'laptop', x: 270, label: 'Laptop', markerY: 96 },
  ];
  private step = 0;

  constructor() { super('micro1'); }

  protected reset() { this.step = 0; }

  protected hint(s: Spot) {
    if (s.id === 'laptop') { const q = steps[this.step]; return `${q.ask} ${q.options.map((o, i) => `${i + 1} ${o}`).join(' · ')}`; }
    return `${s.label} · E ${s.id === 'guide' ? 'read' : 'play'}`;
  }

  protected use(id: string) {
    if (id === 'a') { void audio.voice('clean'); return hud.say('Clip A plays.'); }
    if (id === 'b') { void audio.voice('glitch'); return hud.say('Clip B plays.'); }
    if (id === 'c') { void audio.voice('rushed'); return hud.say('Clip C plays.'); }
    if (id === 'guide') return hud.say('Guideline (fictional): rate naturalness, timing and prosody. Loudness or energy on their own are not quality.');
    hud.say('Answer with the number keys.');
  }

  protected choose(key: string) {
    const q = steps[this.step], pick = Number(key) - 1;
    if (this.near?.id !== 'laptop' || !(pick >= 0 && pick < q.options.length)) return;
    if (pick !== q.answer) { this.penalty(5_000); return hud.say(`${q.wrong} Minus 5 seconds.`); }
    hud.say(q.right);
    if (++this.step < steps.length) return this.refreshPrompt();
    this.over = true;
    hud.prompt('');
    this.time.delayedCall(2400, () => this.finish());
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xdcd6c8).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x8fb3d9).fillRect(186, 14, 40, 26);
    g.fillStyle(0x5a6a7a).fillRect(186, 32, 40, 8);
    g.fillStyle(0x6b4a30).fillRect(0, FLOOR, ROOM_W, 30);
    // Three waveform panels: A steady, B with a jump, C squeezed into half the time.
    for (const [x, kind] of [[40, 'clean'], [95, 'glitch'], [150, 'rushed']] as const) {
      g.fillStyle(0x0f1418).fillRect(x - 23, 70, 46, 26);
      g.lineStyle(1, 0x6fc7d6).beginPath();
      const len = kind === 'rushed' ? 22 : 40;
      for (let i = 0; i <= len; i++) {
        const t = i * (40 / len);
        let y = 83 + Math.sin(t * 0.9) * Math.sin(t * 0.15) * 6;
        if (kind === 'glitch' && i > 18 && i < 23) y = 83 + (i % 2 ? -11 : 11);
        i ? g.lineTo(x - 20 + i, y) : g.moveTo(x - 20, y);
      }
      g.strokePath();
      g.fillStyle(0x1b1a21).fillRect(x - 6, 110, 12, 18).fillRect(x - 1, 128, 2, 22);
    }
    g.fillStyle(0xf1eee5).fillRect(195, 80, 20, 26);
    g.fillStyle(0x9a9488);
    for (let y = 85; y < 102; y += 4) g.fillRect(198, y, 14, 1);
    g.fillStyle(0x7d5a3c).fillRect(250, 116, 44, 5).fillRect(252, 121, 3, 29).fillRect(289, 121, 3, 29);
    g.fillStyle(0x2f3138).fillRect(260, 98, 24, 16);
    g.fillStyle(0x6fc7d6).fillRect(262, 100, 20, 12);
    g.fillStyle(0x2f3138).fillRect(256, 113, 32, 3);
  }
}
