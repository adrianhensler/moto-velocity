export class RaceSession {
  constructor({ totalLaps, countdownSeconds }) {
    this.totalLaps = totalLaps;
    this.countdownSeconds = countdownSeconds;
    this.reset();
  }

  reset() {
    this.state = 'countdown';
    this.countdown = this.countdownSeconds;
    this.elapsed = 0;
    this.lapStart = 0;
    this.currentLapTime = 0;
    this.lastLapTime = null;
    this.bestLapTime = null;
    this.recordedLaps = 0;
    this.finishTime = null;
  }

  get canDrive() {
    return this.state === 'racing';
  }

  updateClock(dt) {
    if (this.state === 'countdown') {
      this.countdown = Math.max(0, this.countdown - dt);
      if (this.countdown === 0) this.state = 'racing';
      return;
    }

    if (this.state !== 'racing') return;

    this.elapsed += dt;
    this.currentLapTime = this.elapsed - this.lapStart;
  }

  recordBike(bike) {
    if (this.state !== 'racing') return;

    while (this.recordedLaps < bike.lapsCompleted) {
      const lapTime = this.elapsed - this.lapStart;
      this.lastLapTime = lapTime;
      this.bestLapTime = this.bestLapTime === null ? lapTime : Math.min(this.bestLapTime, lapTime);
      this.lapStart = this.elapsed;
      this.currentLapTime = 0;
      this.recordedLaps += 1;
    }

    if (bike.finished) {
      this.finishTime = this.elapsed;
      this.state = 'finished';
    }
  }

  snapshot(position) {
    return {
      state: this.state,
      countdown: this.countdown,
      elapsed: this.elapsed,
      currentLapTime: this.currentLapTime,
      lastLapTime: this.lastLapTime,
      bestLapTime: this.bestLapTime,
      finishTime: this.finishTime,
      totalLaps: this.totalLaps,
      position,
    };
  }
}
