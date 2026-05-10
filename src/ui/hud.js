export class Hud {
  constructor() {
    this.speedEl = document.getElementById('speed');
    this.gearEl = document.getElementById('gear');
    this.boostbar = document.getElementById('boostbar');
    this.lapEl = document.getElementById('lap');
    this.elevEl = document.getElementById('elev');
    this.tach = document.getElementById('tach');
    this.warning = document.createElement('div');
    this.warning.style.cssText = 'position:absolute;left:50%;top:24%;transform:translateX(-50%);font-size:28px;letter-spacing:4px;color:#ffef8a;opacity:0;text-align:center;text-shadow:3px 3px 0 #300,0 0 18px #f33;transition:opacity 80ms linear;';
    document.getElementById('hud').appendChild(this.warning);
    this.crashOverlay = document.createElement('div');
    this.crashOverlay.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle,rgba(255,255,255,.25),rgba(255,0,0,.32) 46%,rgba(0,0,0,.52));opacity:0;pointer-events:none;mix-blend-mode:screen;';
    document.getElementById('hud').appendChild(this.crashOverlay);

    for (let i = 0; i < 16; i++) {
      const bar = document.createElement('i');
      bar.style.height = `${14 + i * 2.5}px`;
      this.tach.appendChild(bar);
    }
  }

  update({ speed, boost, lap, elevation, risk = 0, crashed = false, crashFlash = 0 }) {
    this.speedEl.textContent = String(Math.round(speed * 2.45)).padStart(3, '0');
    this.gearEl.textContent = crashed ? '!' : Math.min(6, Math.max(1, Math.floor(speed / 34) + 1));
    this.boostbar.style.width = `${Math.round(boost * 100)}%`;
    this.lapEl.textContent = `${lap}/3`;
    this.elevEl.textContent = `${Math.round(elevation * 5 + 70)}m`;
    [...this.tach.children].forEach((bar, index) => bar.classList.toggle('on', index < Math.round(speed / 15)));

    if (crashed) {
      this.warning.textContent = 'CRASH';
      this.warning.style.opacity = '1';
    } else if (risk > 0.78) {
      this.warning.textContent = 'GRIP LIMIT';
      this.warning.style.opacity = String(Math.min(1, (risk - 0.65) * 2.5));
    } else {
      this.warning.style.opacity = '0';
    }
    this.crashOverlay.style.opacity = String(Math.max(crashFlash, crashed ? 0.18 : 0));
  }
}
