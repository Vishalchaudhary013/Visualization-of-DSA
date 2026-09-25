import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use("/api", apiRoutes);

  return app;
}
