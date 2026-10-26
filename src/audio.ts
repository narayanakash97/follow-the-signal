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
  stop() {
    window.clearTimeout(this.stopTimer);
    for (const node of this.nodes) { try { node.stop(); } catch {} node.disconnect(); }
    this.nodes = [];
  }
}
