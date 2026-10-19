import { sitemapPaths } from "../../shared/seo.js";
import { siteOrigin } from "../config/site.js";
import { buildSitemaps } from "../seo/sitemap.js";

// Pages come from the app's own content, which only changes with a deploy,
// so each origin's sitemap is built once per process and then reused.
const cache = new Map();
const sitemapsFor = (origin) => {
  if (!cache.has(origin))
    cache.set(origin, buildSitemaps(origin, sitemapPaths()));
  return cache.get(origin);
};

const CACHE_HEADER = "public, max-age=3600";

// GET /robots.txt
export const getRobots = (req, res) => {
  const origin = siteOrigin(req);
  res
    .type("text/plain")
    .set("Cache-Control", CACHE_HEADER)
    .send(
      [
        "# Pages, scripts, styles and images are all crawlable. The JSON API",
        "# is not content; pages that must stay out of search results",
        "# (login, profile) carry a noindex meta tag instead of a block here.",
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n"),
    );
};

// GET /sitemap.xml
export const getSitemap = (req, res) => {
  res
    .type("application/xml")
    .set("Cache-Control", CACHE_HEADER)
    .send(sitemapsFor(siteOrigin(req)).main);
};

// GET /sitemap-:part.xml (only exists when the sitemap is split)
export const getSitemapPart = (req, res) => {
  const index = Number(req.params.part) - 1;
  const part = sitemapsFor(siteOrigin(req)).parts[index];
  if (!part) return res.status(404).type("text/plain").send("Not found");
  res.type("application/xml").set("Cache-Control", CACHE_HEADER).send(part);
};
