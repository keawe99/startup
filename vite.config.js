import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000", // Change this to your backend port
    },
  },
});
