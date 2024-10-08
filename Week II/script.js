import * as THREE from 'three';
const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    wireframe:true
});

const box = new THREE.Mesh(geometry,material);





