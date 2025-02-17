import * as THREE from "/node_modules/three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Bone,
  BoxGeometry,
  Color,
  MeshPhongMaterial,
  SkinnedMesh,
  Skeleton,
  Vector3,
} from "three";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).href;

// ----- SETTINGS & GEOMETRY SETUP -----

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const easingFactor = 0.5; // Controls the speed of the easing
const easingFactorFold = 0.3; // Controls the speed of the easing
const insideCurveStrength = 0.18; // Controls the strength of the curve
const outsideCurveStrength = 0.05; // Controls the strength of the curve
const turningCurveStrength = 0.09; // Controls the strength of the curve

// Create page geometry with skin attributes.
function createPageGeometry() {
  const geometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
  );
  geometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndexes, 4)
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4)
  );

  geometry.computeVertexNormals();
  return geometry;
}

const pageGeometry = createPageGeometry();

// ----- HELPER FUNCTIONS -----
function dampAngle(current, target, lambda, dt) {
  let diff = target - current;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest path
  return current + diff * (1 - Math.exp(-lambda * dt));
}

async function loadPdfPageTexture(pdfDoc, pageNum, scale = 1.5) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  await page.render(renderContext).promise;
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

// ----- PAGE CLASS -----
class Page {
  constructor(number, pdfDoc, frontPageNum, backPageNum, totalPages) {
    this.number = number;
    this.totalPages = totalPages;
    this.turnedAt = performance.now();
    this.opened = false; // will be set by Book.update()
    this.bookClosed = true; // will be set by Book.update()
    this.group = new THREE.Group();

    Promise.all([
      loadPdfPageTexture(pdfDoc, frontPageNum, 1.5),
      loadPdfPageTexture(pdfDoc, backPageNum, 1.5),
    ]).then(([frontTexture, backTexture]) => {
      this.frontTexture = frontTexture;
      this.backTexture = backTexture;

      const loader = new THREE.TextureLoader();
      this.coverRoughness = loader.load("/assets/pics/page1-back.jpg");

      const whiteColor = new Color("white");
      const emissiveColor = new Color("orange");
      const pageMaterials = [
        new MeshPhongMaterial({ color: whiteColor }),
        new MeshPhongMaterial({ color: "#111" }),
        new MeshPhongMaterial({ color: whiteColor }),
        new MeshPhongMaterial({ color: whiteColor }),
      ];

      const frontMaterial = new MeshPhongMaterial({
        color: whiteColor,
        map: this.frontTexture,
        roughnessMap: number === 0 ? this.coverRoughness : null,
        roughness: number === 0 ? undefined : 0.1,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      });
      const backMaterial = new MeshPhongMaterial({
        color: whiteColor,
        map: this.backTexture,
        roughnessMap: number === totalPages - 1 ? this.coverRoughness : null,
        roughness: number === totalPages - 1 ? undefined : 0.1,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      });

      const materials = [...pageMaterials, frontMaterial, backMaterial];

      const bones = [];
      for (let i = 0; i <= PAGE_SEGMENTS; i++) {
        const bone = new Bone();
        bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
        bones.push(bone);
        if (i > 0) {
          bones[i - 1].add(bone);
        }
      }
      const skeleton = new Skeleton(bones);

      this.mesh = new SkinnedMesh(pageGeometry, materials);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.frustumCulled = false;
      this.mesh.add(bones[0]);
      this.mesh.bind(skeleton);

      this.bones = bones;

      this.group.add(this.mesh);
    });
  }

  update(delta, delayedPage, currentPage) {
    if (!this.bones) return;
    if (this.openedChanged) {
      this.turnedAt = performance.now();
      this.openedChanged = false;
    }
    const elapsed = Math.min(400, performance.now() - this.turnedAt);
    let turningTime = Math.sin((elapsed / 400) * Math.PI) * 2;
    let targetRotation = this.opened ? -Math.PI / 2 : Math.PI / 2;
    if (!this.bookClosed) {
      targetRotation += THREE.MathUtils.degToRad(this.number * 0.8);
    }
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];
      const insideIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin((i * Math.PI) / this.bones.length) * turningTime;
      let rotationY =
        insideCurveStrength * insideIntensity * targetRotation -
        outsideCurveStrength * outsideIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotation = THREE.MathUtils.degToRad(
        Math.sign(targetRotation) * 2
      );
      if (this.bookClosed) {
        if (i === 0) {
          rotationY = targetRotation;
          foldRotation = 0;
        } else {
          rotationY = 0;
          foldRotation = 0;
        }
      }
      bone.rotation.y = dampAngle(
        bone.rotation.y,
        rotationY,
        easingFactor,
        delta
      );
      const foldIntensity =
        i > 8
          ? Math.sin((i * Math.PI) / this.bones.length - 0.5) * turningTime
          : 0;
      bone.rotation.x = dampAngle(
        bone.rotation.x,
        foldRotation * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  }
}

// ----- BOOK CLASS -----

// Book class creates multiple Page instances and controls the current page state.
class Book {
  constructor(pagesData, pdfDoc) {
    this.group = new THREE.Group();
    this.pages = [];
    this.currentPage = 0; // target page (set on click, for example)
    this.delayedPage = 0; // gradually moves toward currentPage

    // Page instance for each page using PDF page numbers.
    pagesData.forEach((data, index) => {
      const page = new Page(
        index,
        pdfDoc,
        data.front, // PDF page number for the front
        data.back, // PDF page number for the back
        pagesData.length
      );
      // Position pages slightly in Z so they don’t completely overlap.
      if (page.mesh) {
        page.mesh.position.z =
          -index * PAGE_DEPTH + this.delayedPage * PAGE_DEPTH;
      }
      this.pages.push(page);
      this.group.add(page.group);
    });
  }

  // Call this every frame.
  update(delta) {
    if (this.delayedPage !== this.currentPage) {
      this.delayedPage += this.currentPage > this.delayedPage ? 1 : -1;
    }
    const bookClosed =
      this.delayedPage === 0 || this.delayedPage === this.pages.length;
    this.pages.forEach((page, index) => {
      const wasOpened = page.opened;
      page.opened = this.delayedPage > index;
      if (page.opened !== wasOpened) {
        page.openedChanged = true;
      }
      page.bookClosed = bookClosed;
      page.update(delta, this.delayedPage, this.currentPage);
    });
  }
}

// ----- THREE.JS SCENE SETUP -----

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

//------------------------------------------------------

function disposeBook(book) {
  book.group.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
  });
}

function loadPDF(pdfURL) {
  pdfjsLib.getDocument(pdfURL).promise.then((pdfDoc) => {
    const pagesData = [];
    for (let i = 1; i <= pdfDoc.numPages; i += 2) {
      pagesData.push({
        front: i,
        back: i + 1 <= pdfDoc.numPages ? i + 1 : i,
      });
    }

    // If a book is already loaded, remove and dispose it.
    if (window.currentBook) {
      scene.remove(window.currentBook.group);
      disposeBook(window.currentBook);
      window.currentBook = null;
    }

    window.currentBook = new Book(pagesData, pdfDoc);

    window.currentBook.group.rotation.y = -Math.PI / 2;
    scene.add(window.currentBook.group);
  });
}

// File input event listener for uploading a PDF.
const fileInput = document.getElementById("pdf-upload");
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return; // No file selected.
  const fileURL = URL.createObjectURL(file);
  loadPDF(fileURL);
});

// Optionally, load a default PDF if no file is chosen.
const defaultPdfUrl = "/assets/mypdf/projectmanagement.pdf";
loadPDF(defaultPdfUrl);

// Lighting.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;

// Increase the shadow map resolution.
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

// Optionally, adjust the shadow bias to reduce self-shadowing artifacts.
directionalLight.shadow.bias = -0.0005;

scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

const background = new THREE.TextureLoader().load("/assets/pics/space2.jpg");
background.encoding = THREE.sRGBEncoding;
scene.background = background;
scene.backgroundIntensity = 0.25;

// ----- ANIMATION LOOP -----
let lastTime = performance.now();
function animate() {
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;
  if (window.currentBook) window.currentBook.update(delta);
  // book.update(delta);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ----- EVENT HANDLING -----
document.getElementById("next").addEventListener("click", function () {
  if (window.currentBook) {
    if (window.currentBook.currentPage < window.currentBook.pages.length) {
      window.currentBook.currentPage++;
    } else {
      window.currentBook.currentPage = 0;
    }
  }
});

document.getElementById("prev").addEventListener("click", function () {
  if (window.currentBook) {
    if (window.currentBook.currentPage > 0) {
      window.currentBook.currentPage--;
    } else {
      window.currentBook.currentPage = window.currentBook.pages.length;
    }
  }
});
