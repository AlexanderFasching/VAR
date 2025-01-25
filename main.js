import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { fetchCountryInfo } from "./fetchCountryInfo.js";

// Map countries to mesh names
const meshToCountry = {
  Plane752_Material003_0: "Canada",
  Plane750_Material003_0: "USA",
  Plane550_Material003_0: "France",
  Plane751_Material003_0: "China",
  Plane379_Material003_0: "Mexico",
  Plane641_Material003_0: "Colombia",
  Plane641_Material003_0: "Venezuela",
  Plane639_Material003_0: "Guyana",
  Plane638_Material003_0: "Suriname",
  Plane638_Material003_0: "French Guiana",
  Plane644_Material003_0: "Brazil",
  Plane642_Material003_0: "Ecuador",
  Plane643_Material003_0: "Peru",
  Plane635_Material003_0: "Bolivia",
  Plane632_Material003_0: "Chile",
  Plane636_Material003_0: "Paraguay",
  Plane634_Material003_0: "Argentina",
  Plane633_Material003_0: "Uruguay",
  Plane551_Material003_0: "Spain",
  Plane552_Material003_0: "Portugal",
  Plane739_Material003_0: "United Kingdom",
  Plane755_Material003_0: "Belgium",
  Plane548_Material003_0: "Netherlands",
  Plane549_Material003_0: "Germany",
  Plane525_Material003_0: "Austria",
  Plane523_Material003_0: "Italy",
  Plane519_Material003_0: "Norway",
  Plane518_Material003_0: "Sweden",
  Plane517_Material003_0: "Finland",
};

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
//camera.rotation.set(0, Math.PI, 0);

// Target mesh name
// Randomly pick a mesh name from meshToCountry
const meshNames = Object.keys(meshToCountry);
let targetMeshName = meshNames[Math.floor(Math.random() * meshNames.length)];
let targetMesh = null;
let allMeshes = null;
let worldMap = null;
let isRotating = true;
let tempMap = null;

const loader = new GLTFLoader();

// Load the glTF model
loader.load(
  "assets/worldmap/scene.gltf",
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
  "assets/worldmap/scene.gltf",
  (gltf) => {
    worldMap = gltf.scene;
    worldMap.position.set(2.3, 0, -5);
    //worldMap.rotation.y = (-1 * Math.PI) / 2;

    // Traverse and make all child meshes invisible
    worldMap.traverse((child) => {
      if (child.isMesh) {
        child.visible = false; // Set each mesh's visibility to false
        child.castShadow = true;
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
// Helper function to generate random colors
function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

/*
// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Add a stronger point light at a different position
const pointLight = new THREE.PointLight(0xffffff, 1.5, 200);
pointLight.position.set(10, 10, 10); // Position it away from the origin
scene.add(pointLight);

// Optional: Visualize the light position
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLightHelper);

loader.load(
  "assets/worldmap/scene.gltf",
  (gltf) => {
    tempMap = gltf.scene;
    tempMap.position.set(0, 0, 3.8);
    tempMap.rotation.set(0, Math.PI, 0);

    // Iterate through all children and assign random colors
    tempMap.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: getRandomColor(), // Assign a random color
        });
      }
    });

    scene.add(tempMap);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred:", error);
  }
);
*/

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

// Create backgroung plane
const mapPlaneGeometry = new THREE.PlaneGeometry(2.5, 1.3);
const mapPlaneMaterial = new THREE.MeshStandardMaterial({
  color: 0x0077ff,
  transparent: true,
  opacity: 0.8,
});
const mapPlane = new THREE.Mesh(mapPlaneGeometry, mapPlaneMaterial);
mapPlane.position.set(2.4, -0.06, -5.1);
mapPlane.receiveShadow = true;
scene.add(mapPlane);

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
    // Map mesh name to country
    const country = meshToCountry[clickedMesh.name];
    if (country) {
      console.log(`Clicked on country: ${country}`);
    } else {
      console.log(`No country mapped for mesh: ${clickedMesh.name}`);
    }

    const mapPlaneIntersect = intersects.find(
      (intersection) => intersection.object === mapPlane
    );
    if (mapPlaneIntersect && focus !== mapPlane) {
      targetPosition.set(2.4, 0, -1.5); // Change to desired camera position
      focus = mapPlane;
      isAnimating = true;
      fadeIn(mapContainer);
    }
  } else {
    if (focus === mapPlane) {
      targetPosition.set(0, 0, 3.1);
      focus = backPlane;
      isAnimating = true;

      fadeOut(mapContainer);
    }
  }
});

function fadeIn(container) {
  container.style.display = "flex"; // Make it visible
  setTimeout(() => {
    container.style.opacity = "1"; // Fade in
    container.style.pointerEvents = "auto"; // Enable interaction
  }, 10);
}

function fadeOut(container) {
  container.style.opacity = "0";
  container.style.pointerEvents = "none"; // Disable interaction
  setTimeout(() => {
    container.style.display = "none"; // Hide completely after fade-out
  }, 500);
}

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

// Container for capital
const capitalContainer = document.createElement("div");
capitalContainer.style.display = "flex";
capitalContainer.style.alignItems = "center";
capitalContainer.style.justifyContent = "flex-start"; // Align everything to the left
uiContainer.appendChild(capitalContainer);

// Create the "Show Population" button
const capitalBtn = document.createElement("button");
capitalBtn.textContent = "[ -3 ] Show Capital";
capitalBtn.style.width = "200px";
capitalBtn.style.marginTop = "10px"; // Optional: Adjust margin as needed
capitalContainer.appendChild(capitalBtn);

// Create a span to hold the population value
const capitalDisplay = document.createElement("span");
capitalDisplay.textContent = ""; // Initially empty
capitalDisplay.style.marginLeft = "10px"; // Space between the button and the population display
capitalContainer.appendChild(capitalDisplay);

// Container for give up button
const giveupContainer = document.createElement("div");
giveupContainer.style.display = "flex";
giveupContainer.style.alignItems = "center";
giveupContainer.style.justifyContent = "flex-start"; // Align everything to the left
uiContainer.appendChild(giveupContainer);

const giveupBtn = document.createElement("button");
giveupBtn.textContent = "Give Up";
giveupBtn.style.width = "200px";
giveupBtn.style.marginTop = "10px";
giveupContainer.appendChild(giveupBtn);

// Initialize the counters
let correctGuesses = 0;
let incorrectGuesses = 0;
let score = 0;
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
counterDisplay.textContent = `Correct Countries: ${correctGuesses}`;
counterContainer.appendChild(counterDisplay);

// Create a UI element to display the remaining points you can get
const possiblePointsDisplay = document.createElement("div");
possiblePointsDisplay.textContent = `Remaining Points: ${possiblePoints}`;
counterContainer.appendChild(possiblePointsDisplay);

// Create a container for the score
const scoreContainer = document.createElement("div");
scoreContainer.style.position = "absolute";
scoreContainer.style.fontSize = "20px";
scoreContainer.style.color = "#000";
scoreContainer.style.padding = "10px";
scoreContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
scoreContainer.style.borderRadius = "8px";
scoreContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
scoreContainer.style.display = "flex";
scoreContainer.style.flexDirection = "column"; // Stack counters vertically
scoreContainer.style.alignItems = "center"; // Center the counters horizontally
document.body.appendChild(scoreContainer);

// Create a UI element to display the score
const scoreDisplay = document.createElement("div");
scoreDisplay.textContent = `Score: ${score}`;
scoreContainer.appendChild(scoreDisplay);

// Create a container for the map view
const mapContainer = document.createElement("div");
mapContainer.style.position = "absolute";
mapContainer.style.fontSize = "20px";
mapContainer.style.color = "#000";
mapContainer.style.padding = "10px";
mapContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
mapContainer.style.borderRadius = "8px";
mapContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
mapContainer.style.opacity = "0"; // Start with fully transparent
mapContainer.style.transition = "opacity 0.5s ease-in-out"; // Smooth fade effect
mapContainer.style.pointerEvents = "none"; // Prevent interaction when hidden
mapContainer.style.display = "none";
mapContainer.style.flexDirection = "column"; // Stack counters vertically
mapContainer.style.alignItems = "center"; // Center the counters horizontally
document.body.appendChild(mapContainer);

// Create a UI element to display the correct guesses counter
const mapCounterDisplay = document.createElement("div");
mapCounterDisplay.textContent = `Correct Countries: ${correctGuesses}`;
mapContainer.appendChild(mapCounterDisplay);

// Create a UI element to display the incorrect guesses counter
const mapIncorrectDisplay = document.createElement("div");
mapIncorrectDisplay.textContent = `Incorrect Countries: ${incorrectGuesses}`;
mapContainer.appendChild(mapIncorrectDisplay);

// Create a UI element to display the remaining countries
const mapRemainingDisplay = document.createElement("div");
mapRemainingDisplay.textContent = `Remaining Countries: ${meshNames.length}`;
mapContainer.appendChild(mapRemainingDisplay);

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
  counterContainer.style.left = `${x + 140}px`;
  counterContainer.style.top = `${y - 350}px`;

  scoreContainer.style.left = `${x - 230}px`;
  scoreContainer.style.top = `${y - 350}px`;
}

function updateMapContainerPosition() {
  const vector = new THREE.Vector3();
  mapPlane.getWorldPosition(vector); // Get the world position of the backPlane
  vector.project(camera); // Project it to screen space

  // Convert to screen coordinates
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  // Adjust the counter's position (e.g., slightly to the right of the backPlane)
  mapContainer.style.left = `${x - 100}px`;
  mapContainer.style.top = `${y - 230}px`;
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
  if (enteredText) {
    if (enteredText.toLowerCase() === correctCountry.toLowerCase()) {
      console.log("Congratulations, you selected the correct country!");

      correctGuesses++;
      score += possiblePoints;

      makeVisible(targetMeshName, true);
      changeCountry();
    } else {
      console.log("Oops! That's not the correct country.");

      possiblePoints--;
      if (possiblePoints <= 0) {
        console.log("out of points...");
        incorrectGuesses++;
        makeVisible(targetMeshName, false);
        changeCountry();
      }
    }
    updateCounters();

    // Optionally, clear the text field after checking
    textField.value = "";
  }
});

// Button to stop rotation
stopBtn.addEventListener("click", () => {
  if (isRotating) {
    possiblePoints--;

    if (possiblePoints <= 0) {
      console.log("out of points...");
      makeVisible(targetMeshName, false);
      changeCountry();
    }
  }
  isRotating = false;
  if (targetMesh) {
    targetMesh.rotation.z = 0;
  }
  updateCounters();
});

// Button to show population
populationBtn.addEventListener("click", async () => {
  if (!populationDisplay.textContent) {
    const countryInfo = await fetchCountryInfo(meshToCountry[targetMeshName]);
    if (countryInfo) {
      const population = countryInfo.population;
      populationDisplay.textContent = `Population: ${population.toLocaleString()}`;

      possiblePoints--;
      updateCounters();
      if (possiblePoints <= 0) {
        console.log("out of points...");
        makeVisible(targetMeshName, false);
        changeCountry();
      }
    }
  }
});

// Button to show size
sizeBtn.addEventListener("click", async () => {
  if (!sizeDisplay.textContent) {
    const countryInfo = await fetchCountryInfo(meshToCountry[targetMeshName]);
    if (countryInfo) {
      const size = countryInfo.area;
      sizeDisplay.textContent = `Area: ${size.toLocaleString()} km²`;

      possiblePoints--;
      updateCounters();
      if (possiblePoints <= 0) {
        console.log("out of points...");
        makeVisible(targetMeshName, false);
        changeCountry();
      }
    }
  }
});

// Button to show capital
capitalBtn.addEventListener("click", async () => {
  if (!capitalDisplay.textContent) {
    const countryInfo = await fetchCountryInfo(meshToCountry[targetMeshName]);

    if (countryInfo) {
      const capital = countryInfo.capital;
      capitalDisplay.textContent = `Capital: ${capital.toLocaleString()}`;

      possiblePoints -= 3;
      updateCounters();
      if (possiblePoints <= 0) {
        console.log("out of points...");
        makeVisible(targetMeshName, false);
        changeCountry();
      }
    }
  }
});

// Button for giving up
giveupBtn.addEventListener("click", () => {
  incorrectGuesses++;
  makeVisible(targetMeshName, false);
  changeCountry();
  updateCounters();
});

function changeCountry() {
  // reset country infos
  populationDisplay.textContent = "";
  sizeDisplay.textContent = "";
  capitalDisplay.textContent = "";
  possiblePoints = 10;
  possiblePointsDisplay.textContent = `Remaining Points: ${possiblePoints}`;

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

        // Normalize the mesh size
        normalizeMeshSize(targetMesh, 0.44);

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
  updateCounters();
}

function makeVisible(meshName, correct) {
  worldMap.traverse((child) => {
    if (child.isMesh) {
      if (child.name === meshName) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
        });
        if (!correct) {
          child.material.color.set(0xff0000);
        }
        child.visible = true;
      }
    }
  });
}

function updateCounters() {
  counterDisplay.textContent = `Correct Guesses: ${correctGuesses}`;
  scoreDisplay.textContent = `Score: ${score}`;
  possiblePointsDisplay.textContent = `Remaining Points: ${possiblePoints}`;
  mapCounterDisplay.textContent = `Correct: ${correctGuesses}`;
  mapIncorrectDisplay.textContent = `Incorrect: ${incorrectGuesses}`;
  mapRemainingDisplay.textContent = `Reamaining: ${meshNames.length + 1}`;
}

// Move to world map
let isAnimating = false;
let targetPosition = new THREE.Vector3();
let focus = mapPlane.position;

function animateCamera() {
  if (isAnimating) {
    // Interpolate camera position toward the target position
    camera.position.lerp(targetPosition, 0.05); // Adjust 0.05 for speed (closer to 1 is faster)

    // Stop the animation when the camera is close to the target position
    if (camera.position.distanceTo(targetPosition) < 0.1) {
      isAnimating = false; // Stop the animation
    }
  }
}

function normalizeMeshSize(mesh, targetSize = 1) {
  const boundingBox = new THREE.Box3().setFromObject(mesh); // Compute bounding box
  const size = new THREE.Vector3();
  boundingBox.getSize(size); // Get the size of the bounding box

  const maxDimension = Math.max(size.x, size.y, size.z); // Find the largest dimension
  const scale = targetSize / maxDimension; // Compute scale factor

  mesh.scale.set(scale, scale, scale); // Apply scale

  // Recenter the mesh
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  mesh.position.sub(center.multiplyScalar(scale)); // Adjust position to center the mesh
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
  updateMapContainerPosition();
  animateCamera();

  renderer.render(scene, camera);
}
animate();
