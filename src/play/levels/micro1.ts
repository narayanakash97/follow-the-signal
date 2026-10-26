import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { audio } from '../sound';
import * as hud from '../hud';

// micro1, kept short: compare two AI voice clips and explain the call.
type Step = { ask: string; options: string[]; answer: number; right: string; wrong: string };
const steps: Step[] = [
  { ask: 'Which clip sounds more natural?', options: ['clip A', 'clip B'], answer: 0,
    right: 'Clip A. Now say why, so the call can be checked.', wrong: 'Listen again, or look at the middle of B\'s waveform.' },
  { ask: 'What is wrong with clip B?', options: ['its pitch jumps mid-phrase', 'it is too quiet'], answer: 0,
    right: 'Right: B leaps in pitch in the middle. Feedback written and submitted.', wrong: 'B is loud enough. Look at what happens in the middle of its waveform.' },
];

export class Micro1Level extends Room {
  stage = stages.find(s => s.id === 'micro1')!;
  intro = 'Home desk in Paris. Two AI voice clips: play both (M turns sound on, or read the waveforms), then judge them at the laptop.';
  spots: Spot[] = [
    { id: 'a', x: 70, label: 'Clip A', markerY: 60 },
    { id: 'b', x: 150, label: 'Clip B', markerY: 60 },
    { id: 'laptop', x: 270, label: 'Laptop', markerY: 96 },
  ];
  private step = 0;

  constructor() { super('micro1'); }

  protected reset() { this.step = 0; }

  protected hint(s: Spot) {
    if (s.id === 'laptop') { const q = steps[this.step]; return `${q.ask} ${q.options.map((o, i) => `${i + 1} ${o}`).join(' · ')}`; }
    return `${s.label} · E play`;
  }

  protected use(id: string) {
    if (id === 'a') { void audio.voice('clean'); return hud.say('Clip A plays.'); }
    if (id === 'b') { void audio.voice('glitch'); return hud.say('Clip B plays.'); }
    hud.say('Answer with the number keys.');
  }

  protected choose(key: string) {
    const q = steps[this.step], pick = Number(key) - 1;
    if (this.near?.id !== 'laptop' || !(pick >= 0 && pick < q.options.length)) return;
    if (pick !== q.answer) return hud.say(q.wrong);
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
    // Two waveform panels: A steady, B with a jump.
    for (const [x, kind] of [[70, 'clean'], [150, 'glitch']] as const) {
      g.fillStyle(0x0f1418).fillRect(x - 23, 70, 46, 26);
      g.lineStyle(1, 0x6fc7d6).beginPath();
      const len = 40;
      for (let i = 0; i <= len; i++) {
        const t = i * (40 / len);
        let y = 83 + Math.sin(t * 0.9) * Math.sin(t * 0.15) * 6;
        if (kind === 'glitch' && i > 18 && i < 23) y = 83 + (i % 2 ? -11 : 11);
        i ? g.lineTo(x - 20 + i, y) : g.moveTo(x - 20, y);
      }
      g.strokePath();
      g.fillStyle(0x1b1a21).fillRect(x - 6, 110, 12, 18).fillRect(x - 1, 128, 2, 22);
    }
    g.fillStyle(0x7d5a3c).fillRect(250, 116, 44, 5).fillRect(252, 121, 3, 29).fillRect(289, 121, 3, 29);
    g.fillStyle(0x2f3138).fillRect(260, 98, 24, 16);
    g.fillStyle(0x6fc7d6).fillRect(262, 100, 20, 12);
    g.fillStyle(0x2f3138).fillRect(256, 113, 32, 3);
  }
}
