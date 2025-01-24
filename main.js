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
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
// Enable Shadows
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Light
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(2, 1.2, 7.5);
light.castShadow = true;
light.shadow.mapSize.width = 2048; // Increase width of shadow map
light.shadow.mapSize.height = 2048; // Increase height of shadow map
light.shadow.camera.near = 0.5; // Near clipping plane
light.shadow.camera.far = 50; // Far clipping plane

scene.add(light);

// Position the cameran
camera.position.z = 5;

// Target mesh name
// Randomly pick a mesh name from meshToCountry
const meshNames = Object.keys(meshToCountry);
const targetMeshName = meshNames[Math.floor(Math.random() * meshNames.length)];
let targetMesh = null;

const loader = new GLTFLoader();

// Load the glTF model
loader.load(
  "assets/worldmap/scene.gltf",
  (gltf) => {
    // Traverse and set material for all meshes
    /*
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        console.log("Mesh found:", child.name); // Debug mesh names
        child.material = new THREE.MeshStandardMaterial({
          color: getRandomColor(),
        });
      }
    });
    
    scene.add(gltf.scene);
    */

    // Traverse the model to find the target mesh
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name === targetMeshName) {
          targetMesh = child;
          targetMesh.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
          });
          targetMesh.castShadow = true;
        } else {
          child.visible = false; // Hide other meshes
        }
      }
    });

    if (targetMesh) {
      console.log("Found target mesh:", targetMesh.name);
      targetMesh.position.set(0, 0.5, -1);
      scene.add(targetMesh); // Add the target mesh to the scene
    } else {
      console.error("Target mesh not found!");
    }
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred:", error);
  }
);

// Create backgroung plane
const backPlaneGeometry = new THREE.PlaneGeometry(1, 2);
const backPlaneMaterial = new THREE.MeshStandardMaterial({
  color: 0x0077ff,
  transparent: true,
  opacity: 0.8,
});
const backPlane = new THREE.Mesh(backPlaneGeometry, backPlaneMaterial);
backPlane.position.set(0, 0, -1.2);
backPlane.receiveShadow = true;
scene.add(backPlane);

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

// Camera Movement
// Track pressed keys
const keys = { w: false, a: false, s: false, d: false };
const rotationSpeed = 0.01; // Adjust rotation speed as needed
let isTyping = false;

// Keydown event listener
window.addEventListener("keydown", (event) => {
  if (isTyping) return; // Ignore key events while typing
  if (["w", "a", "s", "d"].includes(event.key.toLowerCase())) {
    keys[event.key.toLowerCase()] = true;
  }
});

// Keyup event listener
window.addEventListener("keyup", (event) => {
  if (isTyping) return; // Ignore key events while typing
  if (["w", "a", "s", "d"].includes(event.key.toLowerCase())) {
    keys[event.key.toLowerCase()] = false;
  }
});

// Text field
// Create an HTML text input field
const textField = document.createElement("input");
textField.type = "text";
textField.placeholder = "Enter text here...";
textField.style.position = "absolute";
textField.style.width = "200px";
textField.style.padding = "5px";
textField.style.fontSize = "14px";
textField.style.zIndex = "10"; // Ensure it overlays the canvas
document.body.appendChild(textField);

// Disable key events while typing
textField.addEventListener("focus", () => {
  isTyping = true; // User is typing
});
textField.addEventListener("blur", () => {
  isTyping = false; // User has stopped typing
});

// Function to update the position of the text field
function updateTextFieldPosition() {
  if (targetMesh) {
    // Convert the targetMesh position to screen coordinates
    const vector = new THREE.Vector3();
    targetMesh.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    // Position the text field below the targetMesh
    textField.style.left = `${x - textField.offsetWidth / 2}px`; // Center horizontally
    textField.style.top = `${y + 20}px`; // Adjust vertical position
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Adjust camera rotation based on keys
  if (keys.w) camera.rotation.x += rotationSpeed; // Look up
  if (keys.s) camera.rotation.x -= rotationSpeed; // Look down
  if (keys.a) camera.rotation.y += rotationSpeed; // Look left
  if (keys.d) camera.rotation.y -= rotationSpeed; // Look right

  // Clamp the camera's vertical rotation to prevent flipping
  camera.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, camera.rotation.x)
  );

  // Rotate the mesh if it exists
  if (targetMesh) {
    targetMesh.rotation.z += 0.005; // Rotate around the Y-axis
  }

  // Update the text field position
  updateTextFieldPosition();

  renderer.render(scene, camera);
}
animate();
