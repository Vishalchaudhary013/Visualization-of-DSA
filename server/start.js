import fs from "fs/promises";
import path from "path";
import express from "express";
import { createServer } from "./app.js";
import { connectDb } from "./config/db.js";
import { sendPage } from "./seo/html.js";

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
  // Handle React Router - serve the transformed index.html (with the page's
  // SEO tags and status) for all non-API routes
  app.get("/{*splat}", async (req, res, next) => {
    try {
      const template = await fs.readFile(
        path.join(clientRoot, "index.html"),
        "utf8",
      );
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      sendPage(req, res, html);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });
} else {
  // Production: serve the built SPA from dist/spa
  const distPath = path.join(root, "dist/spa");
  const template = await fs.readFile(path.join(distPath, "index.html"), "utf8");
  app.use(
    express.static(distPath, {
      // index.html is always rendered with the page's SEO tags (below)
      index: false,
      redirect: false,
      setHeaders(res, filePath) {
        // Vite fingerprints everything in assets/, so it never changes
        res.set(
          "Cache-Control",
          filePath.includes(`${path.sep}assets${path.sep}`)
            ? "public, max-age=31536000, immutable"
            : "public, max-age=86400",
        );
      },
    }),
  );
  // Missing files (e.g. /logo.png) are a plain 404, not the app
  app.get(/\.[a-z0-9]+$/i, (_req, res) => {
    res.status(404).type("text/plain").send("Not found");
  });
  // Handle React Router - every other route gets index.html with its SEO tags
  app.get("/{*splat}", (req, res) => sendPage(req, res, template));
}
