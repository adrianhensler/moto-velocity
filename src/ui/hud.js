function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '--.--';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return minutes > 0
    ? `${minutes}:${remainder.toFixed(2).padStart(5, '0')}`
    : remainder.toFixed(2);
}

export class Hud {
  constructor() {
    this.speedEl = document.getElementById('speed');
    this.gearEl = document.getElementById('gear');
    this.boostbar = document.getElementById('boostbar');
    this.lapEl = document.getElementById('lap');
    this.elevEl = document.getElementById('elev');
    this.tach = document.getElementById('tach');
    this.readouts = document.querySelector('.readouts');
    this.timeEl = this.addReadout('TIME');
    this.bestEl = this.addReadout('BEST');
    this.positionEl = this.addReadout('POS');

    this.riskbar = document.createElement('div');
    this.riskbar.style.cssText = 'margin-top:7px;height:8px;border:1px solid rgba(255,241,196,.75);background:rgba(35,12,3,.42);';
    this.riskFill = document.createElement('div');
    this.riskFill.style.cssText = 'height:100%;width:0%;background:#8ff5ff;box-shadow:0 0 12px rgba(143,245,255,.65);transition:width 70ms linear,background 70ms linear;';
    this.riskbar.appendChild(this.riskFill);
    document.querySelector('.cluster').appendChild(this.riskbar);

    this.raceBanner = document.createElement('div');
    this.raceBanner.style.cssText = 'position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font-size:44px;line-height:1.1;letter-spacing:5px;color:#fff6c8;opacity:0;text-align:center;text-shadow:4px 4px 0 #210c06,0 0 24px rgba(255,151,55,.9);transition:opacity 80ms linear;';
    document.getElementById('hud').appendChild(this.raceBanner);

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

  addReadout(label) {
    const item = document.createElement('span');
    item.textContent = label;
    const value = document.createElement('b');
    value.textContent = '--';
    item.appendChild(value);
    this.readouts.appendChild(item);
    return value;
  }

  update({ speed, boost, lap, elevation, risk = 0, crashed = false, crashFlash = 0, race }) {
    this.speedEl.textContent = String(Math.round(speed * 2.45)).padStart(3, '0');
    this.gearEl.textContent = crashed ? '!' : Math.min(6, Math.max(1, Math.floor(speed / 34) + 1));
    this.boostbar.style.width = `${Math.round(boost * 100)}%`;
    this.lapEl.textContent = `${lap}/${race?.totalLaps ?? 3}`;
    this.elevEl.textContent = `${Math.round(elevation * 5 + 70)}m`;
    this.timeEl.textContent = race?.state === 'countdown' ? 'READY' : formatTime(race?.currentLapTime);
    this.bestEl.textContent = formatTime(race?.bestLapTime);
    this.positionEl.textContent = race?.position ?? '-/4';
    [...this.tach.children].forEach((bar, index) => bar.classList.toggle('on', index < Math.round(speed / 15)));

    const riskPercent = Math.round(Math.min(1, risk / 1.15) * 100);
    this.riskFill.style.width = `${riskPercent}%`;
    this.riskFill.style.background = risk > 0.92 ? '#f04b35' : risk > 0.68 ? '#ffd15a' : '#8ff5ff';

    if (race?.state === 'countdown') {
      this.raceBanner.textContent = String(Math.max(1, Math.ceil(race.countdown)));
      this.raceBanner.style.opacity = '1';
    } else if (race?.state === 'finished') {
      this.raceBanner.innerHTML = `FINISH<br><small style="font-size:20px;letter-spacing:2px;">${formatTime(race.finishTime)} · R RESTART</small>`;
      this.raceBanner.style.opacity = '1';
    } else {
      this.raceBanner.style.opacity = '0';
    }

    if (crashed) {
      this.warning.textContent = 'CRASH';
      this.warning.style.opacity = '1';
    } else if (race?.state === 'finished') {
      this.warning.style.opacity = '0';
    } else if (risk > 0.94) {
      this.warning.textContent = 'BRAKE';
      this.warning.style.opacity = String(Math.min(1, (risk - 0.78) * 3.2));
    } else if (risk > 0.68) {
      this.warning.textContent = 'GRIP';
      this.warning.style.opacity = String(Math.min(1, (risk - 0.55) * 2.4));
    } else {
      this.warning.style.opacity = '0';
    }
    this.crashOverlay.style.opacity = String(Math.max(crashFlash, crashed ? 0.18 : 0));
  }
}
