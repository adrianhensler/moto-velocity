import * as THREE from 'three';

function mesh(geometry, material, scene, cast = true, receive = true) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = cast;
  object.receiveShadow = receive;
  scene.add(object);
  return object;
}

export class SpeedEffects {
  constructor(scene, materials) {
    this.streaks = [];
    this.dust = [];
    this.skidDust = [];

    for (let i = 0; i < 220; i++) {
      const streak = mesh(new THREE.BoxGeometry(0.035, 0.035, 8 + Math.random() * 8), materials.streak, scene, false, false);
      streak.position.set((Math.random() - 0.5) * 34, Math.random() * 12 - 3.5, -Math.random() * 190 - 8);
      this.streaks.push(streak);
    }

    for (let i = 0; i < 140; i++) {
      const puff = mesh(new THREE.BoxGeometry(0.38, 0.22, 0.38), materials.dust, scene, false, false);
      puff.position.set((Math.random() - 0.5) * 16, -1.15 + Math.random() * 1.4, -Math.random() * 140 - 8);
      puff.rotation.set(Math.random(), Math.random(), Math.random());
      this.dust.push(puff);
    }

    for (let i = 0; i < 42; i++) {
      const skid = mesh(new THREE.BoxGeometry(0.55, 0.22, 0.55), materials.dust, scene, false, false);
      skid.position.set((Math.random() - 0.5) * 5, -1.05 + Math.random() * 0.8, -Math.random() * 60 - 8);
      skid.rotation.set(Math.random(), Math.random(), Math.random());
      this.skidDust.push(skid);
    }
  }

  update({ dt, speed, steer, boosting, risk = 0, offRoad = 0, crashed = false }) {
    const travel = speed * 0.82 * dt;
    const speedFx = THREE.MathUtils.smoothstep(speed, 95, boosting ? 160 : 190);
    const dangerFx = THREE.MathUtils.clamp(risk, 0, 1);
    const dustFx = THREE.MathUtils.clamp(THREE.MathUtils.smoothstep(speed, 45, 170) + offRoad * 0.2 + dangerFx * 0.42, 0, 1);

    for (const streak of this.streaks) {
      streak.position.z += travel * (4.4 + speed / 70);
      streak.position.x += steer * 0.018 * speed;
      streak.material.opacity = (speedFx + dangerFx * 0.35) * THREE.MathUtils.clamp(speed / 190, 0, 0.95);
      streak.visible = !crashed && Math.random() < 0.18 + speedFx * 0.62 + dangerFx * 0.2;
      if (streak.position.z > 8) {
        streak.position.set((Math.random() - 0.5) * 38, Math.random() * 12 - 3.8, -210 - Math.random() * 110);
      }
    }

    for (const puff of this.dust) {
      puff.position.z += travel * (2.2 + speed / 120);
      puff.position.x += steer * 0.014 * speed;
      puff.material.opacity = dustFx * (crashed ? 0.75 : 0.52);
      puff.visible = Math.random() < 0.25 + dustFx * 0.75;
      if (puff.position.z > 8) {
        puff.position.set((Math.random() - 0.5) * 18, -1.25 + Math.random() * 1.4, -165 - Math.random() * 90);
      }
    }

    const skidFx = THREE.MathUtils.clamp((risk - 0.38) * 1.85 + offRoad * 0.14 + (crashed ? 0.8 : 0), 0, 1);
    for (const skid of this.skidDust) {
      skid.position.z += travel * (2.8 + speed / 90);
      skid.position.x += steer * 0.05 * speed;
      skid.material.opacity = skidFx * 0.7;
      skid.visible = Math.random() < skidFx;
      if (skid.position.z > 7 || Math.random() < 0.015) {
        const side = Math.sign(steer || (Math.random() - 0.5));
        skid.position.set(side * (1.8 + Math.random() * 2.8), -1.05 + Math.random() * 0.7, -18 - Math.random() * 55);
      }
    }
  }
}
