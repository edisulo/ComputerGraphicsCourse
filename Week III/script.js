import * as THREE from 'three';
import GSAP from 'gsap';

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh)
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.x = 1;
scene.add(camera);


//gsap
GSAP.to(
    mesh.position,{
        duration: 2,
        x:2,
        repeat:-1,
        yoyo:true
    }
)

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(800, 600)
document.getElementById("scene").appendChild(renderer.domElement);

renderer.setAnimationLoop(render)




function render(){


  //  mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera)
}
