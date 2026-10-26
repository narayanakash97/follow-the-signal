import * as Phaser from 'phaser';
import { stages } from '../../stages';
import { Room, FLOOR, ROOM_W, type Spot } from '../room';
import { audio } from '../sound';
import * as hud from '../hud';

// micro1: compare two AI voice clips, name the issue, then review another evaluator's call.
type Step = 'pick' | 'reason' | 'review';

export class Micro1Level extends Room {
  stage = stages.find(s => s.id === 'micro1')!;
  intro = 'Home desk in Paris. Two AI voice clips need a judgment. Listen to both (press M for sound, or read the waveforms), check the guideline, then decide at the laptop.';
  spots: Spot[] = [
    { id: 'a', x: 50, label: 'play clip A', markerY: 60 },
    { id: 'b', x: 120, label: 'play clip B', markerY: 60 },
    { id: 'guide', x: 190, label: 'read the guideline', markerY: 70 },
    { id: 'laptop', x: 270, label: 'decide', markerY: 96 },
  ];
  private step: Step = 'pick';

  constructor() { super('micro1'); }

  protected reset() { this.step = 'pick'; }

  protected hint(s: Spot) {
    if (s.id !== 'laptop') return super.hint(s);
    if (this.step === 'pick') return 'Which sounds more natural? 1: clip A · 2: clip B';
    if (this.step === 'reason') return 'Why? 1: a pitch jump mid-phrase in B · 2: background hiss in B · 3: B is too quiet';
    return 'Another reviewer chose B because "it sounds louder, so it\'s clearer". 1: accept · 2: send it back';
  }

  protected use(id: string) {
    if (id === 'a') { void audio.voice(false); return hud.say('Clip A: smooth rise and fall, steady timing.'); }
    if (id === 'b') { void audio.voice(true); return hud.say('Clip B: louder, but look at the waveform. Something jumps in the middle.'); }
    if (id === 'guide') return hud.say('Guideline (fictional): rate naturalness, timing and prosody. Loudness on its own is not quality.');
    hud.say('Use the number keys to decide.');
  }

  protected choose(key: string) {
    if (this.near?.id !== 'laptop') return;
    if (this.step === 'pick') {
      if (key === '1') { this.step = 'reason'; hud.say('Clip A. Now give the reason, so the decision can be checked.'); }
      else if (key === '2') hud.say('B is louder, but listen to the middle again. Natural speech does not leap like that.');
    } else if (this.step === 'reason') {
      if (key === '1') { this.step = 'review'; hud.say('Right: B jumps in pitch mid-phrase. Feedback written. Next, a reviewer task.'); }
      else if (key === '2' || key === '3') hud.say('Not quite. B is clean and loud enough. The problem is what happens to its pitch.');
    } else if (key === '2') {
      this.over = true;
      hud.say('Sent back with a note: loudness is not naturalness, and B has a pitch jump. Same guideline, same standard for everyone.');
      this.time.delayedCall(2000, () => this.finish());
    } else if (key === '1') hud.say('That judgment goes against the guideline. A reviewer\'s job is to catch it and explain why.');
    this.refreshPrompt();
  }

  protected draw(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0xdcd6c8).fillRect(0, 0, ROOM_W, FLOOR);
    g.fillStyle(0x8fb3d9).fillRect(140, 20, 40, 30); // window over the rooftops
    g.fillStyle(0x5a6a7a).fillRect(140, 40, 40, 10);
    g.fillStyle(0x6b4a30).fillRect(0, FLOOR, ROOM_W, 30);
    // Two waveform panels; B has a visible jump.
    for (const [x, glitch] of [[50, false], [120, true]] as const) {
      g.fillStyle(0x0f1418).fillRect(x - 24, 70, 48, 26);
      g.lineStyle(1, glitch ? 0xe4b367 : 0x6fc7d6).beginPath();
      for (let i = 0; i <= 42; i++) {
        let y = 83 + Math.sin(i * 0.9) * Math.sin(i * 0.15) * (glitch ? 8 : 6);
        if (glitch && i > 18 && i < 23) y = 83 + (i % 2 ? -11 : 11);
        i ? g.lineTo(x - 21 + i, y) : g.moveTo(x - 21, y);
      }
      g.strokePath();
      g.fillStyle(0x1b1a21).fillRect(x - 6, 110, 12, 18).fillRect(x - 1, 128, 2, 22);
    }
    // Guideline sheet.
    g.fillStyle(0xf1eee5).fillRect(180, 80, 20, 26);
    g.fillStyle(0x9a9488);
    for (let y = 85; y < 102; y += 4) g.fillRect(183, y, 14, 1);
    // Laptop on a desk.
    g.fillStyle(0x7d5a3c).fillRect(245, 116, 50, 5).fillRect(247, 121, 3, 29).fillRect(290, 121, 3, 29);
    g.fillStyle(0x2f3138).fillRect(258, 98, 24, 16);
    g.fillStyle(0x6fc7d6).fillRect(260, 100, 20, 12);
    g.fillStyle(0x2f3138).fillRect(254, 113, 32, 3);
  }
}
