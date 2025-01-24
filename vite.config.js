import { defineConfig } from "vite";

export default defineConfig({
  base: "/VAR/", // Replace with your GitHub repository name
  build: {
    rollupOptions: {
      external: [], // Ensure no dependencies are treated as external
    },
  },
  resolve: {
    alias: {
      three: "three", // This ensures "three" is resolved properly
    },
  },
});
