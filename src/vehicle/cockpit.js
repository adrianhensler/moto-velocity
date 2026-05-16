import * as THREE from 'three';

function mesh(geometry, material, parent, cast = false, receive = false) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = cast;
  object.receiveShadow = receive;
  parent.add(object);
  return object;
}

function box(size, material, parent) {
  return mesh(new THREE.BoxGeometry(...size), material, parent);
}

export class Cockpit {
  constructor(camera, materials) {
    this.group = new THREE.Group();
    camera.add(this.group);
    this.group.position.set(0, -1.08, -2.55);

    const fairingShape = new THREE.Shape();
    fairingShape.moveTo(-1.55, -0.18);
    fairingShape.quadraticCurveTo(-1.1, 0.38, 0, 0.46);
    fairingShape.quadraticCurveTo(1.1, 0.38, 1.55, -0.18);
    fairingShape.quadraticCurveTo(0.72, -0.46, 0, -0.42);
    fairingShape.quadraticCurveTo(-0.72, -0.46, -1.55, -0.18);

    const fairing = mesh(new THREE.ExtrudeGeometry(fairingShape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), materials.red, this.group);
    fairing.position.set(0, -0.18, 0.28);
    fairing.rotation.x = 0.18;
    fairing.rotation.y = Math.PI;

    const nose = mesh(new THREE.CapsuleGeometry(0.42, 1.0, 5, 12), materials.orange, this.group);
    nose.position.set(0, -0.16, -0.4);
    nose.rotation.x = Math.PI / 2 + 0.12;
    nose.scale.set(1.15, 0.55, 1);

    const centerStripe = box([0.12, 0.035, 1.35], materials.white, this.group);
    centerStripe.position.set(0, 0.07, -0.3);
    centerStripe.rotation.x = 0.18;
    const leftPanel = box([0.08, 0.035, 1.05], materials.black, this.group);
    const rightPanel = box([0.08, 0.035, 1.05], materials.black, this.group);
    leftPanel.position.set(-0.58, -0.02, -0.18);
    rightPanel.position.set(0.58, -0.02, -0.18);
    leftPanel.rotation.z = -0.18;
    rightPanel.rotation.z = 0.18;
    leftPanel.rotation.x = rightPanel.rotation.x = 0.18;

    box([1.45, 0.22, 0.38], materials.black, this.group).position.set(0, 0.12, -0.18);
    const tank = mesh(new THREE.CapsuleGeometry(0.5, 1.4, 5, 14), materials.red, this.group);
    tank.position.set(0, -0.56, 0.86);
    tank.rotation.x = Math.PI / 2;
    tank.scale.set(1.2, 0.72, 0.62);
    const seat = box([1.05, 0.22, 1.15], materials.black, this.group);
    seat.position.set(0, -0.72, 1.65);
    seat.rotation.x = -0.08;

    const frameL = box([0.12, 0.12, 1.55], materials.black, this.group);
    const frameR = box([0.12, 0.12, 1.55], materials.black, this.group);
    frameL.position.set(-0.62, -0.58, 0.9);
    frameR.position.set(0.62, -0.58, 0.9);
    frameL.rotation.x = frameR.rotation.x = 0.18;

    const wheel = mesh(new THREE.TorusGeometry(0.46, 0.095, 8, 22), materials.rubber, this.group);
    wheel.position.set(0, -0.83, -1.05);
    wheel.rotation.y = Math.PI / 2;

    const brakeDisc = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.035, 18), materials.white, this.group);
    brakeDisc.position.copy(wheel.position);
    brakeDisc.rotation.z = Math.PI / 2;
    brakeDisc.scale.set(1, 0.35, 1);

    const bootL = box([0.34, 0.18, 0.58], materials.black, this.group);
    const bootR = box([0.34, 0.18, 0.58], materials.black, this.group);
    bootL.position.set(-0.92, -0.79, 0.75);
    bootR.position.set(0.92, -0.79, 0.75);
    bootL.rotation.y = -0.22;
    bootR.rotation.y = 0.22;

    this.handlebar = box([2.75, 0.11, 0.13], materials.black, this.group);
    this.handlebar.position.set(0, 0.28, -0.58);
    const lg = box([0.72, 0.17, 0.17], materials.rubber, this.group);
    const rg = box([0.72, 0.17, 0.17], materials.rubber, this.group);
    lg.position.set(-1.55, 0.28, -0.58);
    rg.position.set(1.55, 0.28, -0.58);
    lg.rotation.z = 0.14;
    rg.rotation.z = -0.14;

    const mirrorL = box([0.4, 0.2, 0.08], materials.cyan, this.group);
    const mirrorR = box([0.4, 0.2, 0.08], materials.cyan, this.group);
    mirrorL.position.set(-1.92, 0.53, -0.78);
    mirrorR.position.set(1.92, 0.53, -0.78);
    mirrorL.rotation.z = 0.22;
    mirrorR.rotation.z = -0.22;

    this.gauge = box([0.62, 0.09, 0.31], materials.cyan, this.group);
    this.gauge.position.set(0, 0.32, -0.31);
    const gaugeFrame = box([0.82, 0.055, 0.43], materials.black, this.group);
    gaugeFrame.position.set(0, 0.305, -0.31);
    const ledL = box([0.12, 0.045, 0.08], materials.yellow, this.group);
    const ledR = box([0.12, 0.045, 0.08], materials.red, this.group);
    ledL.position.set(-0.46, 0.36, -0.3);
    ledR.position.set(0.46, 0.36, -0.3);
    const leverL = box([0.06, 0.055, 0.78], materials.black, this.group);
    const leverR = box([0.06, 0.055, 0.78], materials.black, this.group);
    leverL.position.set(-1.18, 0.16, -0.72);
    leverR.position.set(1.18, 0.16, -0.72);
    leverL.rotation.y = -0.45;
    leverR.rotation.y = 0.45;

    const wsShape = new THREE.Shape();
    wsShape.moveTo(-1.34, -0.12);
    wsShape.bezierCurveTo(-1.2, 0.48, -0.72, 1.02, 0, 1.18);
    wsShape.bezierCurveTo(0.72, 1.02, 1.2, 0.48, 1.34, -0.12);
    wsShape.quadraticCurveTo(0.68, -0.28, 0, -0.24);
    wsShape.quadraticCurveTo(-0.68, -0.28, -1.34, -0.12);
    const windscreenMaterial = materials.glass.clone();
    windscreenMaterial.opacity = 0.1;
    this.windscreen = mesh(new THREE.ShapeGeometry(wsShape, 32), windscreenMaterial, this.group, false, false);
    this.windscreen.position.set(0, 0.34, -1.05);
    this.windscreen.rotation.x = -0.2;
    const lowerFrame = box([1.7, 0.055, 0.07], materials.black, this.group);
    lowerFrame.position.set(0, 0.28, -1.0);
    lowerFrame.rotation.x = -0.2;
  }

  update({ steer, shake, speed, time }) {
    this.group.rotation.z = -steer * 0.58 + Math.sin(time * 13) * shake;
    this.group.rotation.x = -Math.abs(steer) * 0.045 + Math.sin(time * 17) * shake * 0.28;
    this.handlebar.rotation.z = -steer * 0.18;
    this.windscreen.material.opacity = Math.min(0.22, 0.09 + speed / 1800);
    this.gauge.scale.x = 0.75 + speed / 210;
  }
}
