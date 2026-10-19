import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The frontend lives in client/; Express (server/start.js) runs it in dev
export default defineConfig({
  root: __dirname,
  // Keep Vite's cache in the project's node_modules, not client/node_modules
  cacheDir: path.resolve(__dirname, "../node_modules/.vite"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": __dirname,
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  test: { name: "client" },
  build: {
    outDir: path.resolve(__dirname, "../dist/spa"),
    emptyOutDir: true,
  },
});
