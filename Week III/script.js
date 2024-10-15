import * as THREE from 'three';
import GSAP from 'gsap';

const scene = new THREE.Scene();
const geometry = new THREE.SphereGeometry( 0.9, 32, 16 ); 
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 , wireframe:true } ); 
const sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );
scene.add(sphere)
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.x = 0;
scene.add(camera);


//gsap
GSAP.to(
    sphere.position,{
        duration: 2,
        x:0,
        repeat:-1,
        yoyo:true
    }
)

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(800, 600)
document.getElementById("scene").appendChild(renderer.domElement);


let previousTime = 0;


renderer.setAnimationLoop(render)



function render(time){




    const deltaTime = (time - previousTime) / 1000; // Convert time from milliseconds to seconds
    previousTime = time;

    // Rotate the sphere based on delta time
    //sphere.rotation.x += 1 * deltaTime; // Rotate around X-axis
    sphere.rotation.y += 1 * deltaTime; // Rotate around Y-axis

    renderer.render(scene, camera);
  
}
