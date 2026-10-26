import type { Take } from './state';
// Original, short synthesis to illustrate noise. Never records or accesses a microphone.
export class DemoAudio {
  private context?: AudioContext;
  private stopTimer?: number;
  private nodes: AudioScheduledSourceNode[] = [];
  enabled = false;
  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.stop();
    if (enabled) {
      this.context ??= new AudioContext();
      await this.context.resume();
    }
  }
  async play(room: Pick<Take, 'fan' | 'construction'>) {
    if (!this.enabled) return;
    this.stop();
    const context = this.context ??= new AudioContext();
    await context.resume();
    // If muted while the browser was resuming audio, do not start a sound.
    if (!this.enabled) return;
    const now = context.currentTime;
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.type = 'sine'; tone.frequency.value = 220;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.06);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.65);
    gain.gain.linearRampToValueAtTime(0.035, now + 1.1);
    gain.gain.linearRampToValueAtTime(0, now + 1.8);
    tone.connect(gain).connect(context.destination); tone.start(); tone.stop(now + 1.9);
    this.nodes.push(tone);
    if (room.fan || room.construction) {
      const data = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const values = data.getChannelData(0);
      for (let i = 0; i < values.length; i++) {
        const t = i / context.sampleRate;
        values[i] = (Math.random() * 2 - 1) * ((room.fan ? 0.035 : 0) + (room.construction && Math.sin(t * 19) > 0.65 ? 0.11 : 0));
      }
      const noise = context.createBufferSource(); noise.buffer = data;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1800;
      const envelope = context.createGain(); envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(1, now + 0.05);
      envelope.gain.setValueAtTime(1, now + 1.7);
      envelope.gain.linearRampToValueAtTime(0, now + 1.9);
      noise.connect(filter).connect(envelope).connect(context.destination); noise.start(); noise.stop(now + 2);
      this.nodes.push(noise);
    }
    this.stopTimer = window.setTimeout(() => this.stop(), 2100);
  }
  /** A strummed open chord, for the moment the signal chain works. */
  async chord() {
    const ctx = await this.ready();
    if (!ctx) return;
    [196, 247, 294, 392, 494].forEach((f, i) => this.note(ctx, f, ctx.currentTime + i * 0.035, 1.6, 'triangle', 0.03));
  }

  /** A synthetic "voice": a gliding buzz. With glitch, the pitch jumps mid-phrase. */
  async voice(glitch: boolean) {
    const ctx = await this.ready();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.5);
    if (glitch) { osc.frequency.setValueAtTime(320, now + 0.55); osc.frequency.setValueAtTime(170, now + 0.7); }
    osc.frequency.linearRampToValueAtTime(120, now + 1.2);
    filter.type = 'lowpass'; filter.frequency.value = 900;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain.gain.setValueAtTime(0.06, now + 1.1);
    gain.gain.linearRampToValueAtTime(0, now + 1.25);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 1.3);
    this.nodes.push(osc);
  }

  /** A short crack and rumble of thunder. */
  async thunder() {
    const ctx = await this.ready();
    if (!ctx) return;
    const now = ctx.currentTime, data = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const v = data.getChannelData(0);
    for (let i = 0; i < v.length; i++) v[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    src.buffer = data; filter.type = 'lowpass'; filter.frequency.value = 500; gain.gain.value = 0.25;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now);
    this.nodes.push(src);
  }

  private async ready() {
    if (!this.enabled) return null;
    this.stop();
    const ctx = this.context ??= new AudioContext();
    await ctx.resume();
    return this.enabled ? ctx : null;
  }

  private note(ctx: AudioContext, freq: number, at: number, length: number, type: OscillatorType, level: number) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at); osc.stop(at + length);
    this.nodes.push(osc);
  }

  stop() {
    window.clearTimeout(this.stopTimer);
    for (const node of this.nodes) { try { node.stop(); } catch {} node.disconnect(); }
    this.nodes = [];
  }
}
