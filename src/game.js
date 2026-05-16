import { createMaterials } from './materials.js';
import { createRenderer, createScene, createCamera, addLighting, wireResize } from './renderer.js';
import { InputController } from './input.js';
import { TrackSystem } from './tracks/trackSystem.js';
import { RoadRibbon } from './world/roadRibbon.js';
import { Scenery } from './world/scenery.js';
import { Cockpit } from './vehicle/cockpit.js';
import { BikePhysics } from './vehicle/bikePhysics.js';
import { OpponentManager } from './ai/opponent.js';
import { SpeedEffects } from './effects/speedEffects.js';
import { GameAudio } from './effects/audio.js';
import { Hud } from './ui/hud.js';
import { RaceSession } from './raceSession.js';
import { RACE_TUNING } from './tuning.js';

export class Game {
  constructor(canvas) {
    this.renderer = createRenderer(canvas);
    this.scene = createScene();
    this.camera = createCamera(this.scene);
    addLighting(this.scene);
    wireResize(this.renderer, this.camera);

    this.materials = createMaterials();
    this.input = new InputController();
    this.hud = new Hud();
    this.trackSystem = new TrackSystem(this.scene, this.materials, document.getElementById('trackName'));
    this.bike = new BikePhysics(this.trackSystem);

    this.getLocalPoint = (progress, offset, lateral = 0, extraY = 0) => {
      const base = this.trackSystem.roadAt(progress);
      const point = this.trackSystem.roadAt(progress + offset);
      return {
        x: point.x - base.x - lateral,
        y: point.y - base.y + extraY,
        z: -offset,
        width: point.width,
      };
    };

    this.road = new RoadRibbon(this.scene, this.materials, this.getLocalPoint);
    this.cockpit = new Cockpit(this.camera, this.materials);
    this.scenery = new Scenery(this.scene, this.materials, this.getLocalPoint);
    this.opponents = new OpponentManager(this.scene, this.materials, this.trackSystem, this.getLocalPoint);
    this.speedEffects = new SpeedEffects(this.scene, this.materials);
    this.audio = new GameAudio();
    this.race = new RaceSession(RACE_TUNING);

    this.trackSystem.setTrack(0);
    this.restartRace();
    this.lastTime = undefined;
    this.lastRenderAt = 0;
    this.running = false;
    this.time = 0;
  }

  start() {
    this.running = true;
    const tick = now => {
      this.lastRenderAt = performance.now();
      this.animate(now);
      if (this.running) requestAnimationFrame(tick);
    };

    this.animate(performance.now());
    requestAnimationFrame(tick);
    window.setInterval(() => {
      const now = performance.now();
      if (this.running && now - this.lastRenderAt > 120) {
        this.lastRenderAt = now;
        this.animate(now);
      }
    }, 1000 / 30);
  }

  setTrack(index) {
    this.trackSystem.setTrack(index);
    this.restartRace();
  }

  restartRace() {
    this.bike.resetForTrack();
    this.opponents.reset();
    this.race.reset();
  }

  animate(now) {
    const dt = Math.min(0.033, (now - (this.lastTime || now)) / 1000);
    this.lastTime = now;
    this.time += dt;

    const trackSwitch = this.input.consumeTrackSwitch();
    if (trackSwitch !== null) this.setTrack(trackSwitch);
    if (this.input.consumeRestart()) this.restartRace();

    const input = this.input.snapshot();
    this.race.updateClock(dt);
    const driveInput = this.race.canDrive ? input : { ...input, accel: false, brake: this.race.state === 'finished', boost: false };
    const physics = this.bike.update(driveInput, dt, { hold: this.race.state === 'countdown' });
    const collision = this.opponents.update(dt, this.bike, { active: this.race.canDrive });
    const impactCrash = this.race.canDrive && this.bike.applyImpact(collision.severity, dt);
    if (physics.crashedNow || impactCrash) this.audio.crash();
    this.race.recordBike(this.bike);

    this.road.update(this.bike.progress, this.bike.lateral, this.trackSystem.activeTrack.length);
    this.scenery.update(dt, this.bike.speed, this.bike.progress, this.bike.lateral, this.trackSystem.activeTrack.length);
    this.updateCamera({ dt, slope: physics.slope, boosting: physics.boosting });
    this.cockpit.update({ steer: this.bike.steer, shake: this.shake + this.bike.risk * 0.05, speed: this.bike.speed, time: this.time });
    this.speedEffects.update({ dt, speed: this.bike.speed, steer: this.bike.steer, boosting: physics.boosting, risk: this.bike.risk, offRoad: this.bike.offRoad, crashed: this.bike.crashed });
    this.audio.update({ speed: this.bike.speed, risk: this.bike.risk, boosting: physics.boosting, crashed: this.bike.crashed });
    this.hud.update({
      speed: this.bike.speed,
      boost: this.bike.boost,
      lap: this.bike.lap,
      elevation: this.trackSystem.roadAt(this.bike.progress).y,
      risk: this.bike.risk,
      crashed: this.bike.crashed,
      crashFlash: this.bike.crashFlash,
      race: this.race.snapshot(this.opponents.positionFor(this.bike)),
    });

    this.renderer.render(this.scene, this.camera);
  }

  updateCamera({ dt, slope, boosting }) {
    this.shake = this.bike.speed / 180 * (0.035 + Math.abs(Math.sin(this.time * 21)) * 0.034) + (boosting ? 0.055 : 0) + this.bike.risk * 0.08 + this.bike.crashFlash * 0.45;
    this.camera.position.x = Math.sin(this.time * 41) * this.shake;
    this.camera.position.y = 2.35 + Math.cos(this.time * 31) * this.shake;
    this.camera.position.z = 0;
    this.camera.rotation.x = -0.055 - slope * 0.36 - this.bike.speed * 0.00025 + Math.sin(this.time * 23) * this.shake * 0.12;
    this.camera.rotation.y = -this.bike.steer * 0.05;
    this.camera.rotation.z = -this.bike.steer * 0.10 + Math.sin(this.time * 29) * this.shake * 0.16 + this.bike.crashFlash * Math.sin(this.time * 55) * 0.28;
    this.camera.fov += ((boosting ? 104 : 82 + this.bike.speed * 0.075) - this.camera.fov) * 4 * dt;
    this.camera.updateProjectionMatrix();
  }
}
