import * as THREE from 'three';
const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    wireframe:true
});

const box = new THREE.Mesh(geometry,material);

scene.add(box);

function randomInt(min,max){
    return Math.random() * (max-min +1) + min;
}

for (var i = 0;i<1000;i++){
    const sphereGeometry = new THREE.SphereGeometry(0.01,32,32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color:0x136523,
        wireframe:false
    });

const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphere.position.set(randomInt(-10,10),randomInt(-5,5),randomInt(-5,5));
scene.add(sphere);
}



const sizes = {
    width: 800,
    height: 600
}

const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height);
camera.position.z = 3;
//camera.position.x = 1;
scene.add(camera);

box.rotation.x = Math.PI/4;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(800,600)
document.getElementById('scene').appendChild(renderer.domElement);


renderer.render(scene,camera);


