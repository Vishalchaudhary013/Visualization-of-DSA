import { describe, expect, it } from "vitest";
import {
  SITE_NAME,
  fullTitle,
  resolveSeo,
  seoTags,
  sitemapPaths,
  truncate,
} from "@shared/seo";
import { ALGORITHMS } from "@shared/algorithms";
import { DATA_STRUCTURES } from "@shared/dataStructures";
import { PATTERN_LIST } from "@shared/patterns";
import { ALGORITHM_RUNNERS } from "@/features/visualizer/algorithms";

const ORIGIN = "https://algo.example.com";
const resolve = (url) => {
  const [path, query = ""] = url.split("?");
  return resolveSeo(path, query);
};
const PATHS = sitemapPaths();

describe("indexable pages (the sitemap)", () => {
  it("covers every algorithm, data structure and pattern once", () => {
    expect(new Set(PATHS).size).toBe(PATHS.length);
    for (const id of Object.keys(ALGORITHMS)) {
      expect(PATHS).toContain(`/visualizer?algo=${id}`);
      // Only algorithms the visualizer can run get a page
      expect(ALGORITHM_RUNNERS[id]).toBeDefined();
    }
    for (const id of Object.keys(DATA_STRUCTURES))
      expect(PATHS).toContain(`/data-structures/${id}`);
    for (const { id } of PATTERN_LIST)
      expect(PATHS).toContain(`/patterns/${id}`);
  });

  it("leaves out private pages", () => {
    for (const path of ["/login", "/register", "/profile", "/visualizer"])
      expect(PATHS).not.toContain(path);
  });

  it.each(PATHS)("%s is a 200, indexable and its own canonical", (url) => {
    const seo = resolve(url);
    expect(seo.status).toBe(200);
    expect(seo.robots).toMatch(/^index, follow/);
    expect(seo.canonicalPath).toBe(url);
    expect(seo.heading.length).toBeGreaterThan(0);
  });

  it("gives every page a unique title and description of a sensible length", () => {
    const pages = PATHS.map(resolve);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
    for (const { title, description } of pages) {
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(70);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  it("builds titles and descriptions from the page's content", () => {
    expect(resolve("/visualizer?algo=quick-sort").title).toMatch(/^Quick Sort/);
    expect(resolve("/visualizer?algo=quick-sort").description).toContain(
      ALGORITHMS["quick-sort"].description,
    );
    expect(resolve("/data-structures/trie").description).toContain(
      DATA_STRUCTURES.trie.description,
    );
    expect(resolve("/patterns/hashing").title).toMatch(/^Two Sum/);
    expect(
      resolve("/patterns/dynamic-programming?problem=edit-distance").title,
    ).toMatch(/^Edit Distance/);
  });
});

describe("canonical URLs and indexing", () => {
  it("drops the user's input from the canonical URL", () => {
    expect(
      resolve("/visualizer?algo=quick-sort&arr=5,2,8&target=2").canonicalPath,
    ).toBe("/visualizer?algo=quick-sort");
    expect(
      resolve("/patterns/hashing?problem=two-sum&nums=[1,2]&target=3")
        .canonicalPath,
    ).toBe("/patterns/hashing");
  });

  it("points the default or an unknown algorithm at the page it shows", () => {
    expect(resolve("/visualizer").canonicalPath).toBe(
      "/visualizer?algo=bubble-sort",
    );
    expect(resolve("/visualizer?algo=nope").canonicalPath).toBe(
      "/visualizer?algo=bubble-sort",
    );
  });

  it("keeps a pattern's other problems as their own pages", () => {
    expect(
      resolve("/patterns/dynamic-programming?problem=knapsack").canonicalPath,
    ).toBe("/patterns/dynamic-programming");
    expect(
      resolve("/patterns/dynamic-programming?problem=nope").canonicalPath,
    ).toBe("/patterns/dynamic-programming");
  });

  it.each(["/login", "/register", "/profile"])(
    "%s is noindex but still followable",
    (path) => {
      const seo = resolve(path);
      expect(seo.status).toBe(200);
      expect(seo.robots).toBe("noindex, follow");
    },
  );

  it.each([
    "/nope",
    "/data-structures/nope",
    "/patterns/nope",
    "/patterns/a/b",
  ])("%s is a 404 with noindex and no canonical", (path) => {
    const seo = resolve(path);
    expect(seo.status).toBe(404);
    expect(seo.robots).toBe("noindex");
    expect(seo.canonicalPath).toBeNull();
  });
});

describe("head tags", () => {
  const tags = seoTags(resolve("/data-structures/heap"), ORIGIN);
  const attr = (key) =>
    tags.find((tag) => tag.attrs.name === key || tag.attrs.property === key)
      ?.attrs.content;

  it("has title, description, robots, canonical, Open Graph and Twitter tags", () => {
    expect(tags[0]).toMatchObject({ tag: "title" });
    expect(attr("description")).toBeTruthy();
    expect(attr("robots")).toMatch(/^index/);
    expect(tags.find((t) => t.attrs.rel === "canonical").attrs.href).toBe(
      `${ORIGIN}/data-structures/heap`,
    );
    expect(attr("og:url")).toBe(`${ORIGIN}/data-structures/heap`);
    expect(attr("og:image")).toBe(`${ORIGIN}/og-image.jpg`);
    expect(attr("og:site_name")).toBe(SITE_NAME);
    expect(attr("twitter:card")).toBe("summary_large_image");
    expect(attr("twitter:image")).toBe(`${ORIGIN}/og-image.jpg`);
  });

  it("has valid JSON-LD with absolute URLs and breadcrumbs matching the page", () => {
    const script = tags.find((t) => t.tag === "script");
    const data = JSON.parse(script.text);
    expect(data["@context"]).toBe("https://schema.org");
    const types = data["@graph"].map((item) => item["@type"]);
    expect(types).toEqual(["LearningResource", "BreadcrumbList"]);
    const crumbs = data["@graph"][1].itemListElement;
    expect(crumbs.map((c) => c.name)).toEqual([
      "Home",
      "Data structures",
      "Binary Heap",
    ]);
    expect(crumbs.every((c) => c.item.startsWith(`${ORIGIN}/`))).toBe(true);
    expect(data["@graph"][0].url).toBe(`${ORIGIN}/data-structures/heap`);
    // No invented ratings, reviews or prices
    expect(script.text).not.toMatch(/rating|review|price|offers/i);
  });

  it("only uses the given origin, never localhost", () => {
    for (const url of PATHS) {
      const text = JSON.stringify(seoTags(resolve(url), ORIGIN));
      expect(text).not.toContain("localhost");
      expect(text).not.toMatch(/"(href|content|url|item)":"\//);
    }
  });

  it("has a WebSite entity on the home page only", () => {
    const home = JSON.parse(
      seoTags(resolve("/"), ORIGIN).find((t) => t.tag === "script").text,
    );
    expect(home["@graph"][0]).toMatchObject({
      "@type": "WebSite",
      url: `${ORIGIN}/`,
    });
  });
});

describe("text helpers", () => {
  it("keeps whole sentences that fit", () => {
    expect(truncate(["One.", "Two.", "x".repeat(200)])).toBe("One. Two.");
    expect(truncate("word ".repeat(50), 20)).toBe("word word word word…");
  });

  it("adds the brand only when the title stays short", () => {
    expect(fullTitle("Stack")).toBe(`Stack | ${SITE_NAME}`);
    expect(fullTitle(["x".repeat(70), "Short"])).toBe(`Short | ${SITE_NAME}`);
  });
});
