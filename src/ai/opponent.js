import * as THREE from 'three';

function mesh(geometry, material, parent, cast = true, receive = true) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = cast;
  object.receiveShadow = receive;
  parent.add(object);
  return object;
}

function box(size, material, parent) {
  return mesh(new THREE.BoxGeometry(...size), material, parent);
}

function createOpponentBike(materials, colorMat) {
  const group = new THREE.Group();
  const body = box([1.0, 0.35, 1.8], colorMat, group);
  body.position.y = 0.55;
  const rider = box([0.55, 0.75, 0.45], materials.black, group);
  rider.position.set(0, 1.05, 0.25);
  rider.rotation.x = -0.28;
  const wheelGeo = new THREE.TorusGeometry(0.38, 0.08, 8, 18);
  const fw = mesh(wheelGeo, materials.rubber, group);
  const rw = mesh(wheelGeo, materials.rubber, group);
  fw.position.set(0, 0.26, -0.82);
  rw.position.set(0, 0.26, 0.78);
  fw.rotation.y = rw.rotation.y = Math.PI / 2;
  const screen = mesh(new THREE.PlaneGeometry(0.85, 0.45), materials.glass, group, false, false);
  screen.position.set(0, 0.98, -0.88);
  screen.rotation.x = -0.35;
  group.userData.opponent = true;
  return group;
}

export class OpponentManager {
  constructor(scene, materials, trackSystem, getLocalPoint) {
    this.scene = scene;
    this.trackSystem = trackSystem;
    this.getLocalPoint = getLocalPoint;
    this.opponents = [
      { group: createOpponentBike(materials, materials.cyan), progress: 95, lane: -1.5, speed: 112 },
      { group: createOpponentBike(materials, materials.yellow), progress: 170, lane: 1.2, speed: 126 },
      { group: createOpponentBike(materials, materials.orange), progress: 260, lane: 0.2, speed: 118 },
    ];
    this.opponents.forEach(opponent => scene.add(opponent.group));
  }

  update(dt, bike) {
    let collisionSlowdown = 0;
    let collisionSeverity = 0;
    for (const opponent of this.opponents) {
      opponent.progress = (opponent.progress + opponent.speed * 0.17 * dt) % this.trackSystem.activeTrack.length;
      let offset = opponent.progress - bike.progress;
      if (offset < -this.trackSystem.activeTrack.length / 2) offset += this.trackSystem.activeTrack.length;
      if (offset > this.trackSystem.activeTrack.length / 2) offset -= this.trackSystem.activeTrack.length;

      const point = this.getLocalPoint(bike.progress, offset, bike.lateral - opponent.lane, 0.25);
      opponent.group.visible = offset > -25 && offset < 250;
      opponent.group.position.set(point.x, point.y, point.z);
      opponent.group.rotation.x = -Math.atan(this.trackSystem.tangentAt(bike.progress + offset).dy) * 0.45;
      opponent.group.rotation.z = Math.sin((bike.progress + offset) * 0.045) * 0.18;

      const longitudinalHit = Math.max(0, 1 - Math.abs(offset) / 5);
      const lateralHit = Math.max(0, 1 - Math.abs(bike.lateral - opponent.lane) / 1.3);
      const hit = longitudinalHit * lateralHit;
      if (hit > 0) {
        collisionSlowdown += 75 * dt * hit;
        collisionSeverity = Math.max(collisionSeverity, hit);
      }
    }
    return { slowdown: collisionSlowdown, severity: collisionSeverity };
  }
}
