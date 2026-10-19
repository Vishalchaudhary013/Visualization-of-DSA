import fs from "fs/promises";
import path from "path";
import express from "express";
import { createServer } from "./app.js";
import { connectDb } from "./config/db.js";

const isDev = process.argv.includes("--dev");
const port = process.env.PORT || 8080;
const root = path.resolve(import.meta.dirname, "..");
const clientRoot = path.join(root, "client");

await connectDb();
const app = createServer();

// app.listen returns the underlying server, which Vite reuses for hot reload
const server = app.listen(port, () => {
  console.log(
    `Server running at http://localhost:${port} (${isDev ? "development" : "production"})`,
  );
});

if (isDev) {
  // Development: Vite serves the React app with hot reload through Express
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    configFile: path.join(clientRoot, "vite.config.js"),
    // Hot reload shares the Express port instead of opening a second one
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
  });
  app.use(vite.middlewares);
  // Handle React Router - serve the transformed index.html for all non-API routes
  app.get("/{*splat}", async (req, res, next) => {
    try {
      const template = await fs.readFile(
        path.join(clientRoot, "index.html"),
        "utf8",
      );
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.type("html").send(html);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });
} else {
  // Production: serve the built SPA from dist/spa
  const distPath = path.join(root, "dist/spa");
  app.use(express.static(distPath));
  // Handle React Router - serve index.html for all non-API routes
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
