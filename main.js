import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Map countries to mesh names
const meshToCountry = {
  Plane752_Material003_0: "Canada",
  Plane750_Material003_0: "USA",
  Plane550_Material003_0: "France",
  Plane751_Material003_0: "China",
};

// Generate random color
function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);

scene.add(light);

// Position the cameran
camera.position.z = 5;

const loader = new GLTFLoader();

// Load the glTF model
loader.load(
  "assets/worldmap/scene.gltf",
  (gltf) => {
    // Traverse and set material for all meshes
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        console.log("Mesh found:", child.name); // Debug mesh names
        child.material = new THREE.MeshStandardMaterial({
          color: getRandomColor(),
        });
      }
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred:", error);
  }
);

// Raycaster and mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse click event listener
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  console.log("Intersects:", intersects); // Debug intersected objects

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    console.log("Clicked on mesh:", clickedMesh.name);
    // Map mesh name to country
    const country = meshToCountry[clickedMesh.name];
    if (country) {
      console.log(`Clicked on country: ${country}`);
    } else {
      console.log(`No country mapped for mesh: ${clickedMesh.name}`);
    }
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
