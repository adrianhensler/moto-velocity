import assert from 'node:assert/strict';
import { BikePhysics } from '../src/vehicle/bikePhysics.js';
import { RaceSession } from '../src/raceSession.js';
import { RACE_TUNING } from '../src/tuning.js';

const track = {
  activeTrack: { length: 80 },
  roadAt() {
    return { x: 0, y: 0, width: 10 };
  },
  tangentAt() {
    return { dx: 0, dy: 0 };
  },
};

function stepRace({ bike, race, input, dt }) {
  race.updateClock(dt);
  bike.update(race.canDrive ? input : { accel: false, brake: false, left: false, right: false, boost: false }, dt, {
    hold: race.state === 'countdown' || race.state === 'finished',
  });
  race.recordBike(bike);
}

{
  const bike = new BikePhysics(track);
  const race = new RaceSession(RACE_TUNING);
  stepRace({ bike, race, input: { accel: true }, dt: 1 });

  assert.equal(race.state, 'countdown');
  assert.equal(bike.progress, 0);
  assert.equal(bike.lap, 1);
}

{
  const bike = new BikePhysics(track);
  const race = new RaceSession(RACE_TUNING);

  for (let i = 0; i < 1600; i++) {
    stepRace({
      bike,
      race,
      input: { accel: true, brake: false, left: false, right: false, boost: false },
      dt: 1 / 60,
    });
  }

  assert.equal(race.state, 'finished');
  assert.equal(bike.finished, true);
  assert.equal(bike.lapsCompleted, RACE_TUNING.totalLaps);
  assert.ok(race.finishTime > 0);
  assert.ok(race.bestLapTime > 0);
}

{
  const bike = new BikePhysics(track);
  bike.speed = 100;
  const crash = bike.applyImpact(0.35, 1 / 60);

  assert.equal(crash, false);
  assert.ok(bike.speed < 100);
  assert.ok(bike.speed > 90);
}

{
  const bike = new BikePhysics(track);
  bike.speed = 100;

  assert.equal(bike.applyImpact(0.9, 1 / 60), true);
  assert.equal(bike.crashed, true);
}

console.log('smoke checks passed');
