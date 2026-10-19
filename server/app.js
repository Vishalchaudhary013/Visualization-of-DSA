import "dotenv/config";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";
import seoRoutes from "./routes/seo.routes.js";
import { removeTrailingSlash } from "./middleware/urls.js";

export function createServer() {
  const app = express();

  // Behind a hosting proxy (Render, Railway...) so rate limits see real IPs
  app.set("trust proxy", 1);

  // Middleware. gzip shrinks the app's JavaScript to about a third
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  // API routes (security headers only here: CSP would block Vite in dev).
  // JSON responses are not pages, so they are kept out of search results.
  app.use(
    "/api",
    (_req, res, next) => {
      res.set("X-Robots-Tag", "noindex");
      next();
    },
    helmet({ contentSecurityPolicy: false }),
    apiRoutes,
  );

  // One URL per page: /patterns/ -> /patterns
  app.use(removeTrailingSlash);
  // /robots.txt, /sitemap.xml
  app.use(seoRoutes);

  // Errors thrown in route handlers (Express 5 forwards rejected promises)
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "This already exists." });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}
