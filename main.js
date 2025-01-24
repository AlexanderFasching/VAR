import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { fetchCountryInfo } from "./fetchCountryInfo.js";

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
  35,
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
light.shadow.mapSize.width = 4096; // Increase width of shadow map
light.shadow.mapSize.height = 4096; // Increase height of shadow map
light.shadow.camera.near = 0.5; // Near clipping plane
light.shadow.camera.far = 50; // Far clipping plane

scene.add(light);

// Position the cameran
camera.position.z = 3.1;

// Target mesh name
// Randomly pick a mesh name from meshToCountry
const meshNames = Object.keys(meshToCountry);
let targetMeshName = meshNames[Math.floor(Math.random() * meshNames.length)];
let targetMesh = null;
let allMeshes = null;
let worldMap = null;
let arrow = null;
let isRotating = true;

const loader = new GLTFLoader();

// Load the glTF model
loader.load(
  "./assets/worldmap/scene.gltf",
  (gltf) => {
    allMeshes = gltf.scene;
    changeCountry();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred:", error);
  }
);

loader.load(
  "./assets/worldmap/scene.gltf",
  (gltf) => {
    worldMap = gltf.scene;
    worldMap.position.set(4, 0, 5);
    worldMap.rotation.y = (-1 * Math.PI) / 2;

    // Traverse and make all child meshes invisible
    worldMap.traverse((child) => {
      if (child.isMesh) {
        child.visible = false; // Set each mesh's visibility to false
      }
    });

    scene.add(worldMap);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred:", error);
  }
);

// Load arrow
loader.load(
  "./assets/jumpboost_arrow/scene.gltf",
  (gltf) => {
    console.log(gltf);
    arrow = gltf.scene;
    arrow.position.set(1, 0, 0.5);
    arrow.rotation.set(Math.PI / 2, 0, Math.PI / -3);
    arrow.scale.set(0.0012, 0.0012, 0.0012);

    // Traverse all the meshes in the arrow model and change their color to blue
    arrow.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(0x0077ff); // Set color to blue (0x0000ff is the hex color code for blue)
        child.material.transparent = true; // Enable transparency
        child.material.opacity = 0.5;
      }
    });

    scene.add(arrow);
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
backPlane.position.set(0, 0, -0.3);
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
  if (isTyping) return;
  if (["w", "a", "s", "d"].includes(event.key.toLowerCase())) {
    keys[event.key.toLowerCase()] = false;
  }
});

// Create a container div for all UI elements
const uiContainer = document.createElement("div");
uiContainer.style.position = "absolute";
uiContainer.style.pointerEvents = "auto"; // Allow interaction with UI
uiContainer.style.zIndex = "10"; // Ensure it's above the canvas
uiContainer.style.fontSize = "16px";
uiContainer.style.color = "#000";
uiContainer.style.padding = "10px";
uiContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
uiContainer.style.borderRadius = "8px";
uiContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
uiContainer.style.display = "flex"; // Use flexbox to stack elements
uiContainer.style.flexDirection = "column"; // Stack elements vertically
uiContainer.style.alignItems = "flex-start"; // Align all elements to the left
document.body.appendChild(uiContainer);

// Create a container for the text field and submit button (horizontal layout)
const inputContainer = document.createElement("div");
inputContainer.style.display = "flex"; // Use flex to place input and button next to each other
inputContainer.style.alignItems = "center"; // Vertically center input and button
uiContainer.appendChild(inputContainer);

// Create the text input field
const textField = document.createElement("input");
textField.type = "text";
textField.placeholder = "Enter Country";
textField.style.width = "200px";
textField.style.marginRight = "10px"; // Space between input and button
inputContainer.appendChild(textField);

// Create a button next to the text input field
const submitBtn = document.createElement("button");
submitBtn.textContent = "Submit";
submitBtn.style.width = "200px";
inputContainer.appendChild(submitBtn);

// Create a button below the other elements
const stopBtn = document.createElement("button");
stopBtn.textContent = "[ -1 ] Align North";
stopBtn.style.width = "200px";
stopBtn.style.marginTop = "10px";
uiContainer.appendChild(stopBtn);

// Container for population and button
const populationContainer = document.createElement("div");
populationContainer.style.display = "flex";
populationContainer.style.alignItems = "center";
populationContainer.style.justifyContent = "flex-start"; // Align everything to the left
uiContainer.appendChild(populationContainer);

// Create the "Show Population" button
const populationBtn = document.createElement("button");
populationBtn.textContent = "[ -1 ] Show Population";
populationBtn.style.width = "200px";
populationBtn.style.marginTop = "10px"; // Optional: Adjust margin as needed
populationContainer.appendChild(populationBtn);

// Create a span to hold the population value
const populationDisplay = document.createElement("span");
populationDisplay.textContent = ""; // Initially empty
populationDisplay.style.marginLeft = "10px"; // Space between the button and the population display
populationContainer.appendChild(populationDisplay);

// Container for country size
const sizeContainer = document.createElement("div");
sizeContainer.style.display = "flex";
sizeContainer.style.alignItems = "center";
sizeContainer.style.justifyContent = "flex-start"; // Align everything to the left
uiContainer.appendChild(sizeContainer);

// Create the "Show Population" button
const sizeBtn = document.createElement("button");
sizeBtn.textContent = "[ -1 ] Show Size";
sizeBtn.style.width = "200px";
sizeBtn.style.marginTop = "10px"; // Optional: Adjust margin as needed
sizeContainer.appendChild(sizeBtn);

// Create a span to hold the population value
const sizeDisplay = document.createElement("span");
sizeDisplay.textContent = ""; // Initially empty
sizeDisplay.style.marginLeft = "10px"; // Space between the button and the population display
sizeContainer.appendChild(sizeDisplay);

// Create Container for Arrow
const arrowContainer = document.createElement("div");
arrowContainer.style.position = "absolute";
arrowContainer.style.pointerEvents = "auto"; // Allow interaction with UI
arrowContainer.style.zIndex = "10"; // Ensure it's above the canvas
arrowContainer.style.fontSize = "16px";
arrowContainer.style.color = "#000";
arrowContainer.style.padding = "10px";
arrowContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
arrowContainer.style.borderRadius = "8px";
arrowContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
arrowContainer.style.display = "flex"; // Use flexbox to stack elements
arrowContainer.style.flexDirection = "column"; // Stack elements vertically
arrowContainer.style.alignItems = "flex-start"; // Align all elements to the left
document.body.appendChild(arrowContainer);

const arrowText = document.createElement("span");
arrowText.textContent = "See all correctly guessed countries on the world map";
arrowText.style.marginLeft = "10px";
arrowContainer.appendChild(arrowText);

// Initialize the counters
let correctGuesses = 0;
let possiblePoints = 10;

// Create a container for the counters
const counterContainer = document.createElement("div");
counterContainer.style.position = "absolute";
counterContainer.style.fontSize = "20px";
counterContainer.style.color = "#000";
counterContainer.style.padding = "10px";
counterContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
counterContainer.style.borderRadius = "8px";
counterContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
counterContainer.style.display = "flex";
counterContainer.style.flexDirection = "column"; // Stack counters vertically
counterContainer.style.alignItems = "center"; // Center the counters horizontally
document.body.appendChild(counterContainer);

// Create a UI element to display the correct guesses counter
const counterDisplay = document.createElement("div");
counterDisplay.textContent = `Correct Guesses: ${correctGuesses}`;
counterContainer.appendChild(counterDisplay);

// Create a UI element to display the incorrect guesses counter
const possiblePointsDisplay = document.createElement("div");
possiblePointsDisplay.textContent = `Remaining Points: ${possiblePoints}`;
counterContainer.appendChild(possiblePointsDisplay);

// Position the UI container based on the target mesh
function updateUIPosition() {
  if (targetMesh) {
    // Convert the targetMesh position to screen coordinates
    const vector = new THREE.Vector3();
    targetMesh.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    // Position the container (adjust offsets if needed)
    uiContainer.style.left = `${x - uiContainer.offsetWidth / 2}px`; // Center horizontally
    uiContainer.style.top = `${y + 170}px`; // Position slightly below the targetMesh
  }
}

function updateCounterPosition() {
  const vector = new THREE.Vector3();
  backPlane.getWorldPosition(vector); // Get the world position of the backPlane
  vector.project(camera); // Project it to screen space

  // Convert to screen coordinates
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  // Adjust the counter's position (e.g., slightly to the right of the backPlane)
  counterContainer.style.left = `${x + 230}px`; // 50px offset to the right
  counterContainer.style.top = `${y + -350}px`; // Vertically aligned
}

function updateArrowTextPosition() {
  if (arrow) {
    const vector = new THREE.Vector3();
    arrow.getWorldPosition(vector); // Get the world position of the backPlane
    vector.project(camera); // Project it to screen space

    // Convert to screen coordinates
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    // Adjust the counter's position (e.g., slightly to the right of the backPlane)
    arrowContainer.style.left = `${x - 80}px`; // 50px offset to the right
    arrowContainer.style.top = `${y + 40}px`; // Vertically aligned
  }
}

// Disable key events while typing
textField.addEventListener("focus", () => {
  isTyping = true; // User is typing
});
textField.addEventListener("blur", () => {
  isTyping = false; // User has stopped typing
});

// Button click logic to check the input
submitBtn.addEventListener("click", () => {
  const enteredText = textField.value.trim(); // Get the entered text and remove extra spaces

  // Check if the entered text matches the country for the selected target mesh
  const correctCountry = meshToCountry[targetMeshName];
  if (enteredText.toLowerCase() === correctCountry.toLowerCase()) {
    console.log("Congratulations, you selected the correct country!");

    correctGuesses++;
    counterDisplay.textContent = `Correct Guesses: ${correctGuesses}`;
    makeVisible(targetMeshName);
    changeCountry();
  } else {
    console.log("Oops! That's not the correct country.");
  }

  // Optionally, clear the text field after checking
  textField.value = "";
});

// Button to stop rotation
stopBtn.addEventListener("click", () => {
  isRotating = false;
  if (targetMesh) {
    targetMesh.rotation.z = 0;
  }
});

// Button to show population
populationBtn.addEventListener("click", async () => {
  const countryInfo = await fetchCountryInfo(meshToCountry[targetMeshName]);

  if (countryInfo) {
    const population = countryInfo.population;
    populationDisplay.textContent = `Population: ${population.toLocaleString()}`;
  }
});

// Button to show size
sizeBtn.addEventListener("click", async () => {
  const countryInfo = await fetchCountryInfo(meshToCountry[targetMeshName]);

  if (countryInfo) {
    const size = countryInfo.area;
    sizeDisplay.textContent = `Area: ${size.toLocaleString()} km²`;
  }
});

function changeCountry() {
  console.log(meshNames);

  if (meshNames.length === 0) {
    console.log("No more countries available!");
    return;
  }

  // Select a random mesh name
  const randomIndex = Math.floor(Math.random() * meshNames.length);
  targetMeshName = meshNames[randomIndex];

  // Remove the selected mesh name from the array
  meshNames.splice(randomIndex, 1);

  allMeshes.traverse((child) => {
    if (child.isMesh) {
      if (child.name === targetMeshName) {
        if (targetMesh) {
          targetMesh.visible = false;
        }
        targetMesh = child;

        // Set material and make visible
        targetMesh.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
        });
        targetMesh.castShadow = true;
        targetMesh.visible = true;

        // Compute bounding box to center the target mesh
        const boundingBox = new THREE.Box3().setFromObject(targetMesh);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        // Adjust position to center the mesh in the scene
        targetMesh.position.sub(center);
        targetMesh.position.set(0, 0.3, 0); // Center on the scene
        scene.add(targetMesh);

        console.log("Target mesh centered:", targetMesh.name);

        isRotating = true;
      } else {
        child.visible = false; // Hide other meshes
      }
    }
  });
}

function makeVisible(meshName) {
  worldMap.traverse((child) => {
    if (child.isMesh) {
      if (child.name === meshName) {
        child.visible = true;
      }
    }
  });
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
  if (targetMesh && isRotating) {
    targetMesh.rotation.z += 0.005; // Rotate around the Y-axis
  }

  // Update the text field position
  updateUIPosition();
  updateCounterPosition();
  updateArrowTextPosition();

  renderer.render(scene, camera);
}
animate();
