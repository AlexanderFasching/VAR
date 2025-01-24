import { defineConfig } from "vite";

export default defineConfig({
  base: "/VAR/",
  optimizeDeps: {
    include: ["three"], // Force Vite to pre-bundle 'three'
  },
});
