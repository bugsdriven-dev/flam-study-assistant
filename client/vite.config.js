import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api/* to the Express backend in dev so the frontend never needs
// to know the backend's port/host, and the API key never has a reason to
// exist anywhere in client code.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
