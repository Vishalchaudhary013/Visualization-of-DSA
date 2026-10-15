import "dotenv/config";
import express from "express";
import apiRoutes from "./routes/index.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());

  // API routes
  app.use("/api", apiRoutes);

  return app;
}
