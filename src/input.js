export class InputController {
  constructor() {
    this.keys = new Set();
    this.trackSwitchRequested = null;
    this.restartRequested = false;

    window.addEventListener('keydown', event => {
      this.keys.add(event.code);
      if (event.code === 'Digit1') this.trackSwitchRequested = 0;
      if (event.code === 'Digit2') this.trackSwitchRequested = 1;
      if (event.code === 'KeyR' || event.code === 'Enter') this.restartRequested = true;
      if (event.code === 'Space') event.preventDefault();
      if (event.code === 'Enter') event.preventDefault();
    });

    window.addEventListener('keyup', event => this.keys.delete(event.code));
  }

  consumeTrackSwitch() {
    const requested = this.trackSwitchRequested;
    this.trackSwitchRequested = null;
    return requested;
  }

  consumeRestart() {
    const requested = this.restartRequested;
    this.restartRequested = false;
    return requested;
  }

  snapshot() {
    return {
      accel: this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      brake: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft'),
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight'),
      boost: this.keys.has('Space'),
    };
  }
}
