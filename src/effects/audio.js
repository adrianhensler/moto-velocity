export class GameAudio {
  constructor() {
    this.context = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.windSource = null;
    this.windGain = null;
    this.skidOsc = null;
    this.skidGain = null;
    this.started = false;

    const start = () => this.start();
    window.addEventListener('keydown', start, { once: true });
    window.addEventListener('pointerdown', start, { once: true });
  }

  start() {
    if (this.started) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.context = new AudioContext();
    this.started = true;

    this.engineGain = this.context.createGain();
    this.engineGain.gain.value = 0.0001;
    this.engineGain.connect(this.context.destination);

    this.engineOsc = this.context.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 80;
    const engineFilter = this.context.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 420;
    this.engineOsc.connect(engineFilter).connect(this.engineGain);
    this.engineOsc.start();

    this.windGain = this.context.createGain();
    this.windGain.gain.value = 0.0001;
    this.windGain.connect(this.context.destination);
    this.windSource = this.createNoiseSource();
    const windFilter = this.context.createBiquadFilter();
    windFilter.type = 'highpass';
    windFilter.frequency.value = 550;
    this.windSource.connect(windFilter).connect(this.windGain);
    this.windSource.start();

    this.skidGain = this.context.createGain();
    this.skidGain.gain.value = 0.0001;
    this.skidGain.connect(this.context.destination);
    this.skidOsc = this.context.createOscillator();
    this.skidOsc.type = 'square';
    this.skidOsc.frequency.value = 95;
    const skidFilter = this.context.createBiquadFilter();
    skidFilter.type = 'bandpass';
    skidFilter.frequency.value = 650;
    this.skidOsc.connect(skidFilter).connect(this.skidGain);
    this.skidOsc.start();
  }

  createNoiseSource() {
    const bufferSize = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  update({ speed, risk, boosting, crashed }) {
    if (!this.started || !this.context) return;
    const now = this.context.currentTime;
    const speed01 = Math.min(1, speed / 220);
    this.engineOsc.frequency.setTargetAtTime(70 + speed01 * 260 + (boosting ? 70 : 0), now, 0.04);
    this.engineGain.gain.setTargetAtTime(crashed ? 0.015 : 0.035 + speed01 * 0.065, now, 0.06);
    this.windGain.gain.setTargetAtTime(crashed ? 0.01 : speed01 * speed01 * 0.075 + (boosting ? 0.035 : 0), now, 0.08);
    this.skidGain.gain.setTargetAtTime(crashed ? 0.0001 : Math.max(0, risk - 0.45) * 0.11, now, 0.035);
  }

  crash() {
    if (!this.started || !this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.35);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  }
}
