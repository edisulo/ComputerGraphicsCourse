import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// First create the scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

// Set the size for renderer and appendChild
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Enable Shadows in the renderer first
renderer.shadowMap.enabled = true;

camera.position.set(10, 10, 30);
const controls = new OrbitControls(camera, renderer.domElement);

// Plane Geometry
const planeGeometry = new THREE.PlaneGeometry(15, 15);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // this makes it horizontal
scene.add(plane);

// Sphere
const sphereGeometry = new THREE.BoxGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(3, 3, 3);
scene.add(sphere);

//Torus
const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
const torusMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(3, 1, 0);
scene.add(torus);

// Box or Cube
const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffff32 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(1, 1, 1);
scene.add(box);

 box.castShadow = true;
 box.receiveShadow = true;

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.8);
spotLight.position.set(-5, 10, 5);
spotLight.castShadow = true;
// Optional: adjust the angle/penumbra to see a soft edge
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.2;
scene.add(spotLight);

window.addEventListener("keydown", onkeydown);
window.addEventListener("keydown", onkeytoggle);

function onkeydown(event) {
  console.log("Key pressed:", event.key);
}

function onkeytoggle(event) {
  console.log("Toggle key pressed:", event.key);
}
// Animation Function
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
