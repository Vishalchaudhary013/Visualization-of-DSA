import { defineConfig } from "vitest/config";

// `npm test` runs both projects: client (Vite config, jsdom-free unit tests)
// and server (Node, Express + MongoDB integration tests).
export default defineConfig({
  test: {
    projects: [
      "client/vite.config.js",
      {
        test: {
          name: "server",
          root: "./server",
          environment: "node",
          include: ["**/*.test.js"],
          // Starting an in-memory MongoDB can take a while the first time
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
