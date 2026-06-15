/**
 * three-handler.js — Three.js scene for the Contacts page
 * Loads GLTF model with elegant TorusKnot fallback
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_PATH = `${import.meta.env.BASE_URL}models/cosmetologist.gltf`;

/** Clinic palette mapped to Three.js materials */
const PALETTE = {
  rose: 0xe8c5c8,
  roseDark: 0xd4a5a9,
  beige: 0xfdfbf7,
  charcoal: 0x2c2c2c,
};

let scene, camera, renderer, controls, animationId;
let activeMesh = null;

/**
 * Entry point — only runs when the Three.js container exists (Contacts page)
 */
export function initThreeScene() {
  const container = document.getElementById('three-container');
  if (!container) return;

  const loadingEl = container.querySelector('.three-loading');

  setupScene(container);
  setupLights();
  setupControls(container);
  loadModel(loadingEl);

  window.addEventListener('resize', onResize);
  animate();
}

/* --------------------------------------------------------------------------
   Scene, Camera & Renderer
   -------------------------------------------------------------------------- */
function setupScene(container) {
  scene = new THREE.Scene();

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  container.appendChild(renderer.domElement);
}

function setupLights() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xfff5f0, 1.2);
  directional.position.set(5, 8, 5);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 30;
  directional.shadow.radius = 4;
  scene.add(directional);

  const fill = new THREE.DirectionalLight(PALETTE.rose, 0.4);
  fill.position.set(-4, 2, -3);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(4, 64),
    new THREE.MeshStandardMaterial({
      color: PALETTE.beige,
      transparent: true,
      opacity: 0.3,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.8;
  ground.receiveShadow = true;
  scene.add(ground);
}

function setupControls(container) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI / 1.8;
  controls.target.set(0, 0.5, 0);
}

/* --------------------------------------------------------------------------
   Model Loading with Fallback
   -------------------------------------------------------------------------- */
function loadModel(loadingEl) {
  const loader = new GLTFLoader();

  loader.load(
    MODEL_PATH,
    (gltf) => {
      const model = gltf.scene;
      centerAndScale(model, 2);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      addToScene(model);
      hideLoading(loadingEl);
    },
    undefined,
    () => {
      console.info('GLTF model not found — rendering fallback geometry.');
      const fallback = createFallbackMesh();
      addToScene(fallback);
      hideLoading(loadingEl);
    }
  );
}

function centerAndScale(object, maxSize) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxSize / maxDim;

  object.position.sub(center.multiplyScalar(scale));
  object.scale.setScalar(scale);
  object.position.y += 0.5;
}

function createFallbackMesh() {
  const geometry = new THREE.TorusKnotGeometry(0.7, 0.22, 200, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: PALETTE.rose,
    metalness: 0.3,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    emissive: PALETTE.roseDark,
    emissiveIntensity: 0.08,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.y = 0.3;
  return mesh;
}

function addToScene(object) {
  if (activeMesh) scene.remove(activeMesh);
  activeMesh = object;
  scene.add(object);
}

function hideLoading(loadingEl) {
  if (loadingEl) {
    loadingEl.classList.add('hidden');
    setTimeout(() => loadingEl.remove(), 600);
  }
}

/* --------------------------------------------------------------------------
   Animation Loop & Resize
   -------------------------------------------------------------------------- */
function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();

  if (activeMesh && activeMesh.geometry?.type === 'TorusKnotGeometry') {
    activeMesh.rotation.y += 0.005;
    activeMesh.rotation.x = Math.sin(Date.now() * 0.0008) * 0.15;
  }

  renderer.render(scene, camera);
}

function onResize() {
  const container = document.getElementById('three-container');
  if (!container || !camera || !renderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/** Cleanup helper for SPA-like navigation (if needed later) */
export function disposeThreeScene() {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  controls?.dispose();
  renderer?.dispose();
}
