import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2a35e);
  scene.fog = new THREE.FogExp2(0xf2a35e, 0.009);
  return scene;
}

export function createCamera(scene) {
  const camera = new THREE.PerspectiveCamera(82, window.innerWidth / window.innerHeight, 0.1, 720);
  camera.position.set(0, 2.35, 0);
  scene.add(camera);
  return camera;
}

export function addLighting(scene) {
  const sun = new THREE.DirectionalLight(0xffedbd, 3.4);
  sun.position.set(-14, 22, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  sun.shadow.bias = -0.00008;
  sun.shadow.normalBias = 0.06;
  scene.add(new THREE.HemisphereLight(0xffe6b5, 0x7b341c, 1.35), sun);
}

export function wireResize(renderer, camera) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
