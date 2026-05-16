import * as THREE from 'three';
import { BIKE_TUNING, RACE_TUNING } from '../tuning.js';

export class BikePhysics {
  constructor(trackSystem) {
    this.trackSystem = trackSystem;
    this.speed = 0;
    this.steer = 0;
    this.boost = 1;
    this.progress = 0;
    this.lateral = 0;
    this.lap = 1;
    this.lapsCompleted = 0;
    this.risk = 0;
    this.slip = 0;
    this.offRoad = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.crashFlash = 0;
    this.finished = false;
  }

  resetForTrack() {
    this.speed = 0;
    this.progress = 0;
    this.lateral = 0;
    this.lap = 1;
    this.lapsCompleted = 0;
    this.risk = 0;
    this.slip = 0;
    this.offRoad = 0;
    this.crashed = false;
    this.crashTimer = 0;
    this.crashFlash = 0;
    this.finished = false;
  }

  crash() {
    if (this.crashed) return false;
    this.crashed = true;
    this.crashTimer = BIKE_TUNING.crash.duration;
    this.crashFlash = 1;
    this.speed *= BIKE_TUNING.crash.speedRetained;
    this.steer *= BIKE_TUNING.crash.steerRetained;
    return true;
  }

  applyImpact(amount, dt) {
    if (amount <= 0 || this.crashed || this.finished) return false;
    const { collision } = BIKE_TUNING;
    if (amount > collision.crashSeverity && this.speed > collision.crashSpeed) return this.crash();
    this.speed = Math.max(0, this.speed - amount * collision.speedLossPerSecond * dt);
    this.risk = THREE.MathUtils.clamp(this.risk + amount * collision.riskAdd, 0, 1.4);
    return false;
  }

  update(input, dt, options = {}) {
    const tuning = BIKE_TUNING;
    const slope = this.trackSystem.tangentAt(this.progress).dy;
    this.crashFlash = Math.max(0, this.crashFlash - dt * tuning.crash.flashDecay);

    if (options.hold || this.finished) {
      this.speed = Math.max(0, this.speed - tuning.acceleration.coastDrag * 2 * dt);
      this.steer += (0 - this.steer) * tuning.steering.response * dt;
      this.risk = Math.max(0, this.risk - dt * 1.5);
      this.slip = Math.max(0, this.slip - dt * 1.5);
      return { boosting: false, slope, crashedNow: false };
    }

    if (this.crashed) {
      this.crashTimer -= dt;
      this.speed = Math.max(0, this.speed - tuning.crash.decel * dt);
      this.risk = 1;
      this.slip = 1;
      if (this.crashTimer <= 0) {
        this.crashed = false;
        this.lateral *= 0.35;
        this.speed = tuning.crash.recoverySpeed;
        this.risk = 0.15;
        this.slip = 0;
      }
      return { boosting: false, slope, crashedNow: false };
    }

    const boosting = input.boost && this.boost > 0.03;

    if (input.accel) this.speed += tuning.acceleration.throttle * dt;
    this.speed -= Math.max(0, slope) * tuning.acceleration.uphillPenalty * dt;
    this.speed += Math.max(0, -slope) * tuning.acceleration.downhillAssist * dt;
    if (input.brake) this.speed -= tuning.acceleration.brake * dt;
    if (!input.accel) this.speed -= tuning.acceleration.coastDrag * dt;
    if (boosting) {
      this.speed += tuning.acceleration.boost * dt;
      this.boost -= tuning.acceleration.boostDrain * dt;
    } else {
      this.boost = Math.min(1, this.boost + tuning.acceleration.boostRegen * dt);
    }

    const steeringInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    this.steer += (steeringInput - this.steer) * tuning.steering.response * dt;

    const nearCurve = (
      this.trackSystem.tangentAt(this.progress + tuning.grip.curveLookAhead).dx -
      this.trackSystem.tangentAt(this.progress - tuning.grip.curveLookBehind).dx
    ) / tuning.grip.curveSampleSpan;
    const curveSeverity = Math.min(1.8, Math.abs(nearCurve));
    const safeSpeed = tuning.grip.safeSpeedBase - curveSeverity * tuning.grip.curvePenalty - Math.abs(this.steer) * tuning.grip.steerPenalty;
    const overspeed = Math.max(0, this.speed - safeSpeed);
    const hardSteer =
      Math.max(0, Math.abs(this.steer) - tuning.grip.hardSteerStart) *
      Math.max(0, this.speed - tuning.grip.hardSteerSpeedStart) /
      tuning.grip.hardSteerDivisor;
    this.slip = THREE.MathUtils.clamp(overspeed / tuning.grip.overspeedDivisor + hardSteer - (input.brake ? tuning.grip.brakeStability : 0), 0, 1.6);

    const curveDrift = (
      this.trackSystem.tangentAt(this.progress + tuning.grip.driftLookAhead).dx -
      this.trackSystem.tangentAt(this.progress - tuning.grip.driftLookBehind).dx
    ) / tuning.grip.driftSampleSpan;
    const gripLoss = 1 + this.slip * tuning.grip.gripLossScale;
    this.lateral = THREE.MathUtils.clamp(
      this.lateral + (
        this.steer * (tuning.steering.lateralBase + this.speed / tuning.steering.lateralSpeedDivisor) -
        curveDrift * this.speed * tuning.grip.curveDriftScale * gripLoss
      ) * dt,
      -tuning.steering.lateralClamp,
      tuning.steering.lateralClamp,
    );

    const roadNow = this.trackSystem.roadAt(this.progress);
    this.offRoad = Math.max(0, Math.abs(this.lateral) - roadNow.width * tuning.offRoad.roadEdgeRatio);
    if (this.offRoad > 0) this.speed -= (tuning.offRoad.slowdown + this.offRoad * tuning.offRoad.slowdownPerMeter) * dt;
    if (this.offRoad > tuning.offRoad.slipStart && this.speed > tuning.offRoad.slipSpeed) {
      this.slip += this.offRoad * tuning.offRoad.slipPerMeter;
    }

    this.risk = THREE.MathUtils.clamp(this.slip * tuning.grip.riskSlip + this.offRoad * tuning.grip.riskOffRoad + (boosting ? tuning.grip.riskBoost : 0), 0, 1.4);
    let crashedNow = false;
    if (
      (this.risk > tuning.crash.riskThreshold && this.speed > tuning.crash.riskSpeed) ||
      (this.offRoad > tuning.crash.offRoadThreshold && this.speed > tuning.crash.offRoadSpeed)
    ) {
      crashedNow = this.crash();
    }

    this.speed = THREE.MathUtils.clamp(this.speed, 0, boosting ? tuning.acceleration.boostMaxSpeed : tuning.acceleration.maxSpeed);
    const oldProgress = this.progress;
    this.progress = (this.progress + this.speed * tuning.progress.speedScale * dt) % this.trackSystem.activeTrack.length;
    if (this.progress < oldProgress && !this.finished) {
      this.lapsCompleted += 1;
      if (this.lapsCompleted >= RACE_TUNING.totalLaps) {
        this.finished = true;
        this.lap = RACE_TUNING.totalLaps;
      } else {
        this.lap = this.lapsCompleted + 1;
      }
    }

    return { boosting, slope, crashedNow };
  }
}
