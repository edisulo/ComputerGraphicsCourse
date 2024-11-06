import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#campus') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//const controls = new THREE.OrbitControls(camera, renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(10, 10, 15); 
controls.update();


const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 });
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

const grass = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), grassMaterial);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

const road = new THREE.Mesh(new THREE.PlaneGeometry(4, 20), roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.x = 0;
road.position.y = 0.001;
road.rotation.z = Math.PI / 2; 
road.position.z = 3;



const road2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 20), roadMaterial);
road2.rotation.x = -Math.PI / 2;
road2.position.x = 0;
road2.position.y = 0.001;



scene.add(road,road2);

const buildingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const buildingMaterial2 = new THREE.MeshBasicMaterial({ color: 0x3497BB});



const building1 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), buildingMaterial);
building1.position.set(-6, 1, -3);
building1.rotation.z = Math.PI / 2; 
scene.add(building1);

const building2 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), buildingMaterial);
building2.position.set(6, 3, 6); 
scene.add(building2);

const building3 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), buildingMaterial2);
building3.position.set(6, 3, -3); 
scene.add(building3);

// Adding a sphere 
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), sphereMaterial);
sphere.position.set(0, 0.5, -8);
scene.add(sphere);


// gsap.to(sphere.position, {
//   z: 7,
//   duration: 4,
//   repeat: -1,
//   yoyo: true,
//   ease: "power1.inOut"
// });

// Trying to move the sphere along the road in a cross movement
gsap.timeline({ repeat: -1 })
  .to(sphere.position, { z: 4, duration: 3, ease: "power1.inOut" }) // Move right
  .to(sphere.position, { x: 6, duration: 2, ease: "power1.inOut" }) // Move up
  .to(sphere.position, { x: -6, duration: 2, ease: "power1.inOut" }) // Move left
 // .to(sphere.position, { z: -5, duration: 2, ease: "power1.inOut" }); // Move down




// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
