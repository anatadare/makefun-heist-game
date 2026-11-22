// All sound in Star Sapphire Heist is synthesised live with WebAudio.
// No audio files, no network: every effect is an oscillator or filtered noise.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.ambientOn = false;
  }

  // Browsers need a user gesture before audio starts, so create lazily.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, filterFreq, filterType) {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType || 'lowpass';
    filter.frequency.value = filterFreq || 800;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur);
  }

  pickup() {
    this.tone(880, 0.12, 'sine', 0.25);
    setTimeout(() => this.tone(1318, 0.18, 'sine', 0.22), 70);
  }

  coin() {
    this.tone(2093, 0.09, 'triangle', 0.2);
    setTimeout(() => this.tone(2637, 0.14, 'triangle', 0.16), 60);
    this.noise(0.06, 0.08, 6000, 'highpass');
  }

  smoke() {
    this.noise(0.5, 0.22, 500, 'lowpass');
  }

  step() {
    this.noise(0.05, 0.05, 300, 'lowpass');
  }

  alarmBeep() {
    this.tone(1046, 0.16, 'square', 0.1, 784);
  }

  spotted() {
    this.tone(220, 0.35, 'sawtooth', 0.22, 440);
    setTimeout(() => this.tone(440, 0.3, 'sawtooth', 0.18, 220), 120);
  }

  caught() {
    this.tone(392, 0.5, 'sawtooth', 0.25, 98);
    this.noise(0.4, 0.15, 400, 'lowpass');
  }

  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'triangle', 0.22), i * 110));
  }

  click() {
    this.tone(1200, 0.05, 'square', 0.08);
  }

  // A low, quiet night hum that starts on the first gesture.
  startAmbient() {
    if (!this.ctx || this.ambientOn) return;
    this.ambientOn = true;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.04;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    lfo.start();
  }
}
