import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { sitemapPaths } from "../../shared/seo.js";

const SITE = "https://algo.example.com";
const TEMPLATE = `<!doctype html><html lang="en"><head><meta charset="UTF-8" />
<!-- seo:head --></head><body><div id="root"></div></body></html>`;

let app;
let buildSitemaps;
beforeAll(async () => {
  // site.js reads SITE_URL when it is first imported
  vi.stubEnv("SITE_URL", `${SITE}/`);
  const { createServer } = await import("../app.js");
  const { sendPage } = await import("../seo/html.js");
  ({ buildSitemaps } = await import("../seo/sitemap.js"));
  app = createServer();
  // Stands in for start.js, which uses the built (or Vite) index.html
  app.get("/{*splat}", (req, res) => sendPage(req, res, TEMPLATE));
});

const between = (text, start, end) =>
  [...text.matchAll(new RegExp(`${start}(.*?)${end}`, "g"))].map((m) => m[1]);

describe("robots.txt", () => {
  it("allows pages, blocks only the JSON API and declares the sitemap", async () => {
    const res = await request(app).get("/robots.txt").expect(200);
    expect(res.headers["content-type"]).toMatch(/^text\/plain/);
    const lines = res.text.split("\n").filter((l) => l && !l.startsWith("#"));
    expect(lines).toEqual([
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      `Sitemap: ${SITE}/sitemap.xml`,
    ]);
  });
});

describe("sitemap.xml", () => {
  it("lists every canonical page with absolute production URLs", async () => {
    const res = await request(app).get("/sitemap.xml").expect(200);
    expect(res.headers["content-type"]).toMatch(/^application\/xml/);
    expect(res.text.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(res.text).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    const locs = between(res.text, "<loc>", "</loc>");
    expect(locs).toEqual(sitemapPaths().map((path) => `${SITE}${path}`));
    expect(res.text).not.toContain("localhost");
    // Pages that are noindex or private are not listed
    expect(locs.some((loc) => /login|register|profile/.test(loc))).toBe(false);
  });

  it("only lists URLs that answer 200 with themselves as canonical", async () => {
    for (const path of sitemapPaths()) {
      const res = await request(app).get(path).expect(200);
      const [canonical] = between(
        res.text,
        '<link rel="canonical" href="',
        '"',
      );
      expect(canonical.replaceAll("&amp;", "&")).toBe(`${SITE}${path}`);
      expect(res.text).toContain('content="index, follow');
    }
  });

  it("splits into a sitemap index when there are too many URLs, escaping XML", () => {
    const { main, parts } = buildSitemaps(SITE, ["/a?x=1&y=2", "/b", "/c"], 2);
    expect(main).toContain("<sitemapindex");
    expect(between(main, "<loc>", "</loc>")).toEqual([
      `${SITE}/sitemap-1.xml`,
      `${SITE}/sitemap-2.xml`,
    ]);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain(`<loc>${SITE}/a?x=1&amp;y=2</loc>`);
    expect(parts[1]).toContain(`<loc>${SITE}/c</loc>`);
  });

  it("has no numbered parts while it fits in one file", async () => {
    await request(app).get("/sitemap-1.xml").expect(404);
  });
});

describe("pages", () => {
  it("puts the page's own tags in the initial HTML", async () => {
    const res = await request(app)
      .get("/visualizer?algo=dfs&v=4&edges=0-1")
      .expect(200);
    expect(res.headers["cache-control"]).toBe("no-cache");
    expect(res.text).toMatch(
      /<title data-seo>Depth-First Search[^<]*<\/title>/,
    );
    expect(res.text).toContain(
      `<link rel="canonical" href="${SITE}/visualizer?algo=dfs" data-seo />`,
    );
    expect(res.text).toContain(
      `<meta property="og:image" content="${SITE}/og-image.jpg"`,
    );
    expect(res.text).toContain('<script type="application/ld+json" data-seo>');
    expect(res.text).not.toContain("<!-- seo:head -->");
    // No-JS fallback with the heading and internal links
    expect(res.text).toContain("<noscript>");
    expect(res.text).toMatch(/<h1[^>]*>Depth-First Search<\/h1>/);
    expect(res.text).toContain('<a href="/visualizer?algo=bfs"');
  });

  it("escapes text in tags", async () => {
    // "Linked List (Reverse & Merge)"
    const res = await request(app).get("/patterns/linked-list").expect(200);
    expect(res.text).toContain(
      "<title data-seo>Linked List (Reverse &amp; Merge)",
    );
    expect(res.text).toContain(
      '<meta property="og:title" content="Linked List (Reverse &amp; Merge)',
    );
    // Outside JSON-LD (where a raw "&" is valid JSON), "&" is always escaped
    const html = res.text.replace(/<script[^>]*>.*?<\/script>/gs, "");
    expect(html).not.toMatch(/ & /);
  });

  it("answers unknown routes and ids with a real 404", async () => {
    for (const path of ["/nope", "/patterns/nope", "/data-structures/nope"]) {
      const res = await request(app).get(path).expect(404);
      expect(res.headers["x-robots-tag"]).toBe("noindex");
      expect(res.text).toContain(
        '<meta name="robots" content="noindex" data-seo />',
      );
      expect(res.text).not.toContain('rel="canonical"');
    }
  });

  it("sends noindex for login, register and profile", async () => {
    for (const path of ["/login", "/register", "/profile"]) {
      const res = await request(app).get(path).expect(200);
      expect(res.headers["x-robots-tag"]).toBe("noindex, follow");
    }
  });

  it("marks API responses noindex", async () => {
    const res = await request(app).get("/api/ping").expect(200);
    expect(res.headers["x-robots-tag"]).toBe("noindex");
  });
});

describe("one URL per page", () => {
  it("redirects a trailing slash, keeping the query", async () => {
    const res = await request(app).get("/patterns/?problem=x").expect(301);
    expect(res.headers.location).toBe("/patterns?problem=x");
  });

  it("never redirects to another site", async () => {
    const res = await request(app).get("//evil.example/").expect(301);
    expect(res.headers.location).toBe("/evil.example");
  });
});
