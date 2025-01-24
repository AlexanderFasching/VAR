import { defineConfig } from "vite";

export default defineConfig({
  base: "/VAR/", // Replace with the name of your GitHub repository
  build: {
    outDir: "dist",
    rollupOptions: {
      external: [], // Ensure no dependencies are treated as external
    },
  },
  resolve: {
    alias: {
      three: "three", // Ensure "three" is properly resolved
    },
  },
  optimizeDeps: {
    include: ["three", "three/examples/jsm/loaders/GLTFLoader"], // Pre-bundle dependencies
  },
});
