import * as THREE from 'three';

const scene = new THREE.Scene();
const light = new THREE.DirectionalLight(0xffffff,1);

light.position.set(5,5,5);


const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 ); 
const boxMaterial = new THREE.MeshPhongMaterial( { color:0x0000FF ,shininess:100 } ); 
const box = new THREE.Mesh( boxGeometry, boxMaterial );
 

const sphereGeometry = new THREE.SphereGeometry( 1, 32, 16 ); 
const sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 , shininess:50 } ); 
const sphere = new THREE.Mesh( sphereGeometry , sphereMaterial );
 

const cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 1 ); 
const cylinderMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00 , shininess:50 } ); 
const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
 

const sizes = {
    width: 800,
    height: 600
}


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
camera.position.x = 0;

scene.add(camera);
scene.add(light);
scene.add(box);
scene.add(sphere);
scene.add(cylinder);

box.position.x = 3;
sphere.position.x = -3;
cylinder.position.x = 1;


const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(800,600)
document.getElementById("scene").appendChild(renderer.domElement);
renderer.setAnimationLoop(render)

let time = 0;
function render(){
    time += 0.01;  // Increment time for smoother animations

    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    
    sphere.position.x = -3 + Math.sin(time) * 2;
    cylinder.rotation.x += 0.02;

    renderer.render(scene, camera);
}
