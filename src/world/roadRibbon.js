import * as THREE from 'three';

const ROAD_SEGMENTS = 260;
const ROAD_STEP = 2.0;
const ROAD_START = -44;

function makeRibbon(scene, cols, material) {
  const verts = new Float32Array(ROAD_SEGMENTS * cols * 3);
  const indices = [];
  for (let i = 0; i < ROAD_SEGMENTS - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  // Dynamic road ribbons are large, shallow surfaces; receiving shadows here
  // produced shadow-map acne/moiré while moving at speed.
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add(mesh);
  mesh.userData.verts = verts;
  return mesh;
}

export class RoadRibbon {
  constructor(scene, materials, getLocalPoint) {
    this.getLocalPoint = getLocalPoint;
    this.leftBank = makeRibbon(scene, 2, materials.sand2);
    this.rightBank = makeRibbon(scene, 2, materials.sand2);
    this.leftSand = makeRibbon(scene, 2, materials.sand);
    this.rightSand = makeRibbon(scene, 2, materials.sand);
    this.road = makeRibbon(scene, 2, materials.road);
    this.leftTireMarks = this.createSparseTireMarks(scene, materials, -1.35);
    this.rightTireMarks = this.createSparseTireMarks(scene, materials, 1.35);
    this.center = makeRibbon(scene, 2, materials.yellow);
    this.leftEdge = makeRibbon(scene, 2, materials.white);
    this.rightEdge = makeRibbon(scene, 2, materials.white);
    this.flecks = this.createRoadFlecks(scene, materials);
    this.shoulderPatches = this.createShoulderPatches(scene, materials);
  }

  createRoadFlecks(scene, materials) {
    const flecks = [];
    const geometry = new THREE.BoxGeometry(1, 0.018, 1);
    for (let i = 0; i < 70; i++) {
      const fleck = new THREE.Mesh(geometry, materials.roadEdge);
      fleck.castShadow = false;
      fleck.receiveShadow = false;
      fleck.userData.distance = Math.random() * 1400;
      fleck.userData.lane = (Math.random() - 0.5) * 7.2;
      fleck.userData.length = 0.35 + Math.random() * 1.6;
      fleck.userData.width = 0.03 + Math.random() * 0.08;
      fleck.scale.set(fleck.userData.width, 1, fleck.userData.length);
      scene.add(fleck);
      flecks.push(fleck);
    }
    return flecks;
  }

  createSparseTireMarks(scene, materials, lane) {
    const marks = [];
    const geometry = new THREE.BoxGeometry(0.18, 0.018, 1);
    for (let i = 0; i < 55; i++) {
      const mark = new THREE.Mesh(geometry, materials.tireMark);
      mark.castShadow = false;
      mark.receiveShadow = false;
      mark.userData.distance = Math.random() * 1400;
      mark.userData.lane = lane + (Math.random() - 0.5) * 0.35;
      mark.scale.set(1, 1, 2.0 + Math.random() * 5.5);
      scene.add(mark);
      marks.push(mark);
    }
    return marks;
  }

  createShoulderPatches(scene, materials) {
    const patches = [];
    const geometry = new THREE.BoxGeometry(1, 0.02, 1);
    for (let i = 0; i < 80; i++) {
      const patch = new THREE.Mesh(geometry, materials.shoulderPatch);
      patch.castShadow = false;
      patch.receiveShadow = false;
      patch.userData.distance = Math.random() * 1400;
      patch.userData.side = Math.random() < 0.5 ? -1 : 1;
      patch.userData.extra = 0.8 + Math.random() * 5.5;
      patch.scale.set(0.7 + Math.random() * 2.3, 1, 2.5 + Math.random() * 9);
      scene.add(patch);
      patches.push(patch);
    }
    return patches;
  }

  update(progress, lateral, trackLength) {
    this.updateSlopedRibbon(this.leftBank, [w => -w / 2 - 28, w => -w / 2 - 12], [1.25, -0.22], progress, lateral);
    this.updateSlopedRibbon(this.rightBank, [w => w / 2 + 12, w => w / 2 + 28], [-0.22, 1.25], progress, lateral);
    this.updateRibbon(this.leftSand, 2, [w => -w / 2 - 12, w => -w / 2 - 0.35], progress, lateral, -0.16);
    this.updateRibbon(this.rightSand, 2, [w => w / 2 + 0.35, w => w / 2 + 12], progress, lateral, -0.16);
    this.updateRibbon(this.road, 2, [w => -w / 2, w => w / 2], progress, lateral, 0.055);
    this.updateSparseTireMarks(this.leftTireMarks, progress, lateral, trackLength);
    this.updateSparseTireMarks(this.rightTireMarks, progress, lateral, trackLength);
    this.updateMarker(this.center, () => -0.08, () => 0.08, progress, lateral, 0.135);
    this.updateMarker(this.leftEdge, w => -w / 2 + 0.32, w => -w / 2 + 0.48, progress, lateral, 0.14);
    this.updateMarker(this.rightEdge, w => w / 2 - 0.48, w => w / 2 - 0.32, progress, lateral, 0.14);
    this.updateFlecks(progress, lateral, trackLength);
    this.updateShoulderPatches(progress, lateral, trackLength);
  }

  updateRibbon(ribbon, cols, halfWidths, progress, lateral, yLift = 0) {
    const verts = ribbon.userData.verts;
    let k = 0;
    for (let i = 0; i < ROAD_SEGMENTS; i++) {
      const off = ROAD_START + i * ROAD_STEP;
      const p = this.getLocalPoint(progress, off, lateral, yLift);
      for (let j = 0; j < cols; j++) {
        const hw = typeof halfWidths[j] === 'function' ? halfWidths[j](p.width) : halfWidths[j];
        verts[k++] = p.x + hw;
        verts[k++] = p.y;
        verts[k++] = p.z;
      }
    }
    ribbon.geometry.attributes.position.needsUpdate = true;
    ribbon.geometry.computeVertexNormals();
  }

  updateSlopedRibbon(ribbon, halfWidths, yLifts, progress, lateral) {
    const verts = ribbon.userData.verts;
    let k = 0;
    for (let i = 0; i < ROAD_SEGMENTS; i++) {
      const off = ROAD_START + i * ROAD_STEP;
      const base = this.getLocalPoint(progress, off, lateral, 0);
      for (let j = 0; j < 2; j++) {
        const hw = halfWidths[j](base.width);
        verts[k++] = base.x + hw;
        verts[k++] = base.y + yLifts[j];
        verts[k++] = base.z;
      }
    }
    ribbon.geometry.attributes.position.needsUpdate = true;
    ribbon.geometry.computeVertexNormals();
  }

  updateMarker(ribbon, left, right, progress, lateral, yLift) {
    const verts = ribbon.userData.verts;
    let k = 0;
    for (let i = 0; i < ROAD_SEGMENTS; i++) {
      const off = ROAD_START + i * ROAD_STEP;
      const p = this.getLocalPoint(progress, off, lateral, yLift);
      verts[k++] = p.x + left(p.width); verts[k++] = p.y; verts[k++] = p.z;
      verts[k++] = p.x + right(p.width); verts[k++] = p.y; verts[k++] = p.z;
    }
    ribbon.geometry.attributes.position.needsUpdate = true;
    ribbon.geometry.computeVertexNormals();
  }

  absoluteOffset(distance, progress, trackLength) {
    const objectDistance = ((distance % trackLength) + trackLength) % trackLength;
    let offset = objectDistance - progress;
    if (offset < -trackLength / 2) offset += trackLength;
    if (offset > trackLength / 2) offset -= trackLength;
    return offset;
  }

  updateFlecks(progress, lateral, trackLength) {
    for (const fleck of this.flecks) {
      const offset = this.absoluteOffset(fleck.userData.distance, progress, trackLength);
      const p = this.getLocalPoint(progress, offset, lateral, 0.19);
      fleck.position.set(p.x + fleck.userData.lane, p.y, p.z);
      fleck.visible = Math.abs(fleck.userData.lane) < p.width * 0.42 && p.z < 24 && p.z > -470;
    }
  }

  updateSparseTireMarks(marks, progress, lateral, trackLength) {
    for (const mark of marks) {
      const offset = this.absoluteOffset(mark.userData.distance, progress, trackLength);
      const p = this.getLocalPoint(progress, offset, lateral, 0.18);
      mark.position.set(p.x + mark.userData.lane, p.y, p.z);
      mark.visible = Math.abs(mark.userData.lane) < p.width * 0.42 && p.z < 24 && p.z > -470;
    }
  }

  updateShoulderPatches(progress, lateral, trackLength) {
    for (const patch of this.shoulderPatches) {
      const offset = this.absoluteOffset(patch.userData.distance, progress, trackLength);
      const center = this.getLocalPoint(progress, offset, lateral, 0.01);
      const patchLateral = patch.userData.side * (center.width / 2 + patch.userData.extra);
      const p = this.getLocalPoint(progress, offset, lateral - patchLateral, 0.045);
      patch.position.set(p.x, p.y, p.z);
      patch.visible = p.z < 20 && p.z > -470;
    }
  }
}
