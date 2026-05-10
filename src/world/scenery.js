import * as THREE from 'three';

function mesh(geometry, material, scene, cast = true, receive = true) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = cast;
  object.receiveShadow = receive;
  scene.add(object);
  return object;
}

function box(size, material, scene) {
  return mesh(new THREE.BoxGeometry(...size), material, scene);
}

export class Scenery {
  constructor(scene, materials, getLocalPoint) {
    this.scene = scene;
    this.materials = materials;
    this.getLocalPoint = getLocalPoint;
    this.trackObjects = [];
    this.createSkyGradient();
    this.createDesert();
    this.createWaterfront();
    this.createTracksideObjects();

    const sunDisk = mesh(new THREE.CircleGeometry(12, 32), new THREE.MeshBasicMaterial({ color: 0xffe08b, transparent: true, opacity: 0.82 }), scene, false, false);
    sunDisk.position.set(-52, 48, -180);
    sunDisk.lookAt(0, 0, 0);
  }

  createSkyGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#5aa8ff');
    gradient.addColorStop(0.45, '#f4b36e');
    gradient.addColorStop(0.72, '#ffd39a');
    gradient.addColorStop(1, '#9b5635');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sky = mesh(new THREE.PlaneGeometry(900, 360), new THREE.MeshBasicMaterial({ map: texture, depthWrite: false, depthTest: true }), this.scene, false, false);
    sky.position.set(0, 72, -560);
    sky.renderOrder = -1000;
  }

  createDesert() {
    for (let i = 0; i < 110; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const h = 5 + Math.random() * 28;
      const mesa = box([5 + Math.random() * 20, h, 8 + Math.random() * 26], Math.random() < 0.35 ? this.materials.mesaDark : this.materials.mesa, this.scene);
      mesa.userData.mesa = true;
      mesa.userData.theme = 'desert';
      mesa.position.set(side * (32 + Math.random() * 75), h / 2 - 8, -Math.random() * 640 - 40);
      mesa.rotation.y = (Math.random() - 0.5) * 0.55;
    }

    for (let i = 0; i < 85; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const rock = mesh(new THREE.DodecahedronGeometry(0.45 + Math.random() * 0.9, 0), Math.random() < 0.5 ? this.materials.mesaDark : this.materials.mesa, this.scene);
      rock.userData.detail = true;
      rock.userData.theme = 'desert';
      rock.position.set(side * (7 + Math.random() * 20), -1.35 + Math.random() * 0.45, -Math.random() * 520 - 20);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    }

    for (let i = 0; i < 55; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const cactus = new THREE.Group();
      const trunk = box([0.28, 1.4 + Math.random() * 1.1, 0.28], this.materials.sand2, cactus);
      trunk.position.y = 0.55;
      const arm = box([0.22, 0.75, 0.22], this.materials.sand2, cactus);
      arm.position.set(0.32, 0.8, 0);
      arm.rotation.z = 0.7;
      cactus.userData.detail = true;
      cactus.userData.theme = 'desert';
      cactus.position.set(side * (10 + Math.random() * 25), -1.25, -Math.random() * 560 - 30);
      this.scene.add(cactus);
    }
  }

  createTracksideObjects() {
    // 1 world unit is treated roughly as 1 meter. These objects are anchored to
    // the road sample instead of drifting as generic scenery, so their scale and
    // motion should read as part of the track.
    for (let i = 0; i < 42; i++) {
      const side = i % 2 ? -1 : 1;
      const group = new THREE.Group();
      const post = box([0.12, 1.15, 0.12], this.materials.white, group);
      const cap = box([0.34, 0.16, 0.08], i % 2 ? this.materials.red : this.materials.yellow, group);
      post.position.y = 0.55;
      cap.position.y = 1.18;
      group.userData.trackObject = { distance: 35 + i * 18, lateral: side * (5.8 + (i % 3) * 0.45), yLift: -0.08 };
      this.scene.add(group);
      this.trackObjects.push(group);
    }

    for (let i = 0; i < 32; i++) {
      const side = i % 2 ? -1 : 1;
      const group = new THREE.Group();
      const board = box([2.2 + (i % 3) * 0.35, 0.85, 0.12], i % 3 === 0 ? this.materials.cyan : (i % 3 === 1 ? this.materials.yellow : this.materials.red), group);
      const legA = box([0.08, 0.75, 0.08], this.materials.black, group);
      const legB = box([0.08, 0.75, 0.08], this.materials.black, group);
      board.position.y = 0.95;
      legA.position.set(-0.75, 0.35, 0);
      legB.position.set(0.75, 0.35, 0);
      group.rotation.y = side * -0.18;
      group.userData.trackObject = { distance: 55 + i * 24, lateral: side * (8.0 + (i % 4) * 0.6), yLift: -0.18 };
      this.scene.add(group);
      this.trackObjects.push(group);
    }

    for (let i = 0; i < 56; i++) {
      const side = i % 2 ? -1 : 1;
      const fence = new THREE.Group();
      const postA = box([0.1, 1.1, 0.1], this.materials.concrete, fence);
      const postB = box([0.1, 1.1, 0.1], this.materials.concrete, fence);
      const rail = box([0.1, 0.1, 2.8], this.materials.white, fence);
      postA.position.set(0, 0.45, -1.2);
      postB.position.set(0, 0.45, 1.2);
      rail.position.set(0, 0.88, 0);
      fence.userData.trackObject = { distance: 28 + i * 13, lateral: side * (7.2 + (i % 3) * 0.35), yLift: -0.2 };
      this.scene.add(fence);
      this.trackObjects.push(fence);
    }

    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? -1 : 1;
      const flag = new THREE.Group();
      const pole = box([0.08, 2.0, 0.08], this.materials.black, flag);
      const cloth = mesh(new THREE.PlaneGeometry(0.75, 0.42), i % 2 ? this.materials.red : this.materials.yellow, flag, false, false);
      cloth.material.side = THREE.DoubleSide;
      pole.position.y = 0.95;
      cloth.position.set(side * 0.32, 1.6, 0);
      cloth.rotation.y = side * 0.35;
      flag.userData.trackObject = { distance: 45 + i * 27, lateral: side * (6.8 + (i % 2) * 0.6), yLift: -0.15 };
      this.scene.add(flag);
      this.trackObjects.push(flag);
    }

    for (let i = 0; i < 3; i++) {
      const arch = new THREE.Group();
      const left = box([0.42, 5.4, 0.42], this.materials.white, arch);
      const right = box([0.42, 5.4, 0.42], this.materials.white, arch);
      const top = box([12.8, 0.8, 0.36], i === 0 ? this.materials.red : this.materials.cyan, arch);
      const stripe = box([11.8, 0.18, 0.39], this.materials.yellow, arch);
      left.position.set(-6.4, 2.55, 0);
      right.position.set(6.4, 2.55, 0);
      top.position.set(0, 5.25, 0);
      stripe.position.set(0, 5.25, -0.21);
      arch.userData.trackObject = { distance: 160 + i * 230, lateral: 0, yLift: -0.05, isArch: true };
      this.scene.add(arch);
      this.trackObjects.push(arch);
    }
  }

  createWaterfront() {
    for (let i = 0; i < 10; i++) {
      const water = mesh(new THREE.PlaneGeometry(90, 90, 1, 1), this.materials.water, this.scene, false, false);
      water.rotation.x = -Math.PI / 2;
      water.position.set(i % 2 ? 42 : -42, -1.72, -i * 70 - 30);
      water.userData.detail = true;
      water.userData.theme = 'waterfront';
    }

    for (let i = 0; i < 70; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const height = 4 + Math.random() * 12;
      const building = box([3 + Math.random() * 5, height, 4 + Math.random() * 8], this.materials.city, this.scene);
      building.userData.detail = true;
      building.userData.theme = 'waterfront';
      building.position.set(side * (20 + Math.random() * 45), height / 2 - 2, -Math.random() * 650 - 35);
      building.rotation.y = (Math.random() - 0.5) * 0.25;
    }

    for (let i = 0; i < 46; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const palm = new THREE.Group();
      const trunk = box([0.22, 2.2 + Math.random() * 1.4, 0.22], this.materials.concrete, palm);
      trunk.position.y = 0.8;
      trunk.rotation.z = (Math.random() - 0.5) * 0.18;
      for (let j = 0; j < 4; j++) {
        const leaf = box([0.18, 0.08, 1.35], this.materials.palm, palm);
        leaf.position.set(0, 2.15, 0);
        leaf.rotation.y = j * Math.PI / 2;
        leaf.rotation.x = 0.8;
      }
      palm.userData.detail = true;
      palm.userData.theme = 'waterfront';
      palm.position.set(side * (8 + Math.random() * 18), -1.15, -Math.random() * 650 - 30);
      this.scene.add(palm);
    }

    for (let i = 0; i < 28; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const boat = box([1.4, 0.38, 3.2], this.materials.white, this.scene);
      boat.userData.detail = true;
      boat.userData.theme = 'waterfront';
      boat.position.set(side * (34 + Math.random() * 24), -1.38, -Math.random() * 620 - 60);
      boat.rotation.y = (Math.random() - 0.5) * 0.5;
    }
  }

  update(dt, speed, progress, lateral, trackLength) {
    this.scene.children.forEach(object => {
      if (object.userData.mesa) {
        object.position.z += (speed * 0.24 + 10) * dt;
        if (object.position.z > 70) object.position.z -= 720;
      }
      if (object.userData.detail) {
        object.position.z += (speed * 0.72 + 28) * dt;
        if (object.position.z > 30) object.position.z -= 680;
      }
    });

    for (const object of this.trackObjects) {
      const spec = object.userData.trackObject;
      const objectDistance = ((spec.distance % trackLength) + trackLength) % trackLength;
      let offset = objectDistance - progress;
      if (offset < -trackLength / 2) offset += trackLength;
      if (offset > trackLength / 2) offset -= trackLength;
      const point = this.getLocalPoint(progress, offset, lateral - spec.lateral, spec.yLift);
      object.position.set(point.x, point.y, point.z);
      object.visible = point.z < -8 && point.z > -520;
    }
  }
}
