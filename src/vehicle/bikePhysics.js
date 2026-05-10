import * as THREE from 'three';

export class BikePhysics {
  constructor(trackSystem) {
    this.trackSystem = trackSystem;
    this.speed = 0;
    this.steer = 0;
    this.boost = 1;
    this.progress = 0;
    this.lateral = 0;
    this.lap = 1;
    this.risk = 0;
    this.slip = 0;
    this.offRoad = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.crashFlash = 0;
  }

  resetForTrack() {
    this.speed = Math.min(this.speed, 80);
    this.progress = 0;
    this.lateral = 0;
    this.lap = 1;
    this.risk = 0;
    this.slip = 0;
    this.offRoad = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.crashFlash = 0;
  }

  crash() {
    if (this.crashed) return false;
    this.crashed = true;
    this.crashTimer = 1.35;
    this.crashFlash = 1;
    this.speed *= 0.18;
    this.steer *= 0.35;
    return true;
  }

  applyImpact(amount) {
    if (amount > 0.65 && this.speed > 70) return this.crash();
    this.speed = Math.max(0, this.speed - amount * 42);
    return false;
  }

  update(input, dt) {
    this.crashFlash = Math.max(0, this.crashFlash - dt * 1.8);

    if (this.crashed) {
      this.crashTimer -= dt;
      this.speed = Math.max(0, this.speed - 90 * dt);
      this.risk = 1;
      this.slip = 1;
      if (this.crashTimer <= 0) {
        this.crashed = false;
        this.lateral *= 0.35;
        this.speed = 28;
        this.risk = 0.15;
        this.slip = 0;
      }
      return { boosting: false, slope: this.trackSystem.tangentAt(this.progress).dy, crashedNow: false };
    }

    const slope = this.trackSystem.tangentAt(this.progress).dy;
    const boosting = input.boost && this.boost > 0.03;

    this.speed += (input.accel ? 78 : 18) * dt - Math.max(0, slope) * 38 * dt + Math.max(0, -slope) * 14 * dt;
    if (input.brake) this.speed -= 135 * dt;
    if (!input.accel) this.speed -= 25 * dt;
    if (boosting) {
      this.speed += 165 * dt;
      this.boost -= 0.38 * dt;
    } else {
      this.boost = Math.min(1, this.boost + 0.15 * dt);
    }

    const steeringInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    this.steer += (steeringInput - this.steer) * 8.5 * dt;

    const nearCurve = (this.trackSystem.tangentAt(this.progress + 22).dx - this.trackSystem.tangentAt(this.progress - 10).dx) / 32;
    const curveSeverity = Math.min(1.8, Math.abs(nearCurve));
    const safeSpeed = 190 - curveSeverity * 92 - Math.abs(this.steer) * 25;
    const overspeed = Math.max(0, this.speed - safeSpeed);
    const hardSteer = Math.max(0, Math.abs(this.steer) - 0.48) * Math.max(0, this.speed - 90) / 100;
    this.slip = THREE.MathUtils.clamp(overspeed / 70 + hardSteer, 0, 1.6);

    const curveDrift = (this.trackSystem.tangentAt(this.progress + 14).dx - this.trackSystem.tangentAt(this.progress - 14).dx) / 28;
    const gripLoss = 1 + this.slip * 1.7;
    this.lateral = THREE.MathUtils.clamp(
      this.lateral + (this.steer * (1.8 + this.speed / 52) - curveDrift * this.speed * 0.21 * gripLoss) * dt,
      -10.5,
      10.5,
    );

    const roadNow = this.trackSystem.roadAt(this.progress);
    this.offRoad = Math.max(0, Math.abs(this.lateral) - roadNow.width * 0.48);
    if (this.offRoad > 0) this.speed -= (75 + this.offRoad * 55) * dt;
    if (this.offRoad > 2.4 && this.speed > 75) this.slip += this.offRoad * 0.18;

    this.risk = THREE.MathUtils.clamp(this.slip * 0.72 + this.offRoad * 0.22 + (boosting ? 0.08 : 0), 0, 1.4);
    let crashedNow = false;
    if ((this.risk > 1.05 && this.speed > 105) || (this.offRoad > 4.0 && this.speed > 65)) crashedNow = this.crash();

    this.speed = THREE.MathUtils.clamp(this.speed, 0, boosting ? 235 : 175);
    const oldProgress = this.progress;
    this.progress = (this.progress + (this.speed * 0.72 + 28) * dt) % this.trackSystem.activeTrack.length;
    if (this.progress < oldProgress) this.lap = Math.min(3, this.lap + 1);

    return { boosting, slope, crashedNow };
  }
}
