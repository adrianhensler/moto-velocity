import * as THREE from 'three';

export function createMaterials() {
  const toon = color => new THREE.MeshToonMaterial({ color });

  return {
    road: new THREE.MeshLambertMaterial({
      color: 0x7e4229,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
    roadEdge: toon(0x5e2d1f),
    sand: toon(0xd88b45),
    sand2: toon(0xefb15e),
    mesa: toon(0x9e482c),
    mesaDark: toon(0x64251d),
    black: toon(0x0e0908),
    rubber: toon(0x151013),
    red: toon(0xe94231),
    orange: toon(0xff842b),
    yellow: new THREE.MeshBasicMaterial({
      color: 0xffdf5a,
      side: THREE.DoubleSide,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
    cyan: toon(0x7df2ff),
    white: new THREE.MeshBasicMaterial({
      color: 0xfff1d0,
      side: THREE.DoubleSide,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
    streak: new THREE.MeshBasicMaterial({ color: 0xfff5cf, transparent: true, opacity: 0.8, depthWrite: false }),
    dust: new THREE.MeshBasicMaterial({ color: 0xffce91, transparent: true, opacity: 0.45, depthWrite: false }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xa2efff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    water: new THREE.MeshBasicMaterial({ color: 0x1a78aa, transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
    tireMark: new THREE.MeshBasicMaterial({ color: 0x211713, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }),
    shoulderPatch: new THREE.MeshBasicMaterial({ color: 0x9f6339, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
    dustSheet: new THREE.MeshBasicMaterial({ color: 0xf0c07f, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
    palm: toon(0x2f9b5b),
    concrete: toon(0xb8a58f),
    city: toon(0xd7b98c),
  };
}
