import { defineConfig } from "vite";

export default defineConfig({
  base: "/VAR/", // Replace <REPOSITORY_NAME> with your GitHub repo name
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"], // Ensure `three` is bundled separately
        },
      },
    },
  },
  optimizeDeps: {
    include: ["three", "three/examples/jsm/loaders/GLTFLoader.js"], // Pre-bundle dependencies
  },
});
