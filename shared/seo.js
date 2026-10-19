// Central SEO: one place that knows, for every URL of the app, its title,
// description, canonical URL, robots directive, breadcrumbs and structured
// data. Everything is derived from the same content the pages render
// (shared/algorithms.js, dataStructures.js, patterns.js, problems.js).
//
// Used by the server, to put the tags in the initial HTML (crawlers and link
// previews), by the browser, to update them on client-side navigation, and
// by the sitemap. Pure functions: no DOM or Node APIs.
import {
  ALGORITHMS,
  ALGORITHM_CATEGORIES,
  DIFFICULTIES,
} from "./algorithms.js";
import { DATA_STRUCTURES } from "./dataStructures.js";
import { PATTERNS, PATTERN_GROUPS, PATTERN_LIST } from "./patterns.js";
import { PROBLEMS, PROBLEM_DIFFICULTIES } from "./problems.js";

export const SITE_NAME = "Algorithm Visualizer";
export const SOCIAL_IMAGE = {
  path: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Algorithm Visualizer: watch sorting, graph and data structure algorithms run step by step",
};
const DEFAULT_ALGORITHM = "bubble-sort";
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

const INDEX = "index, follow, max-image-preview:large";
const NOINDEX = "noindex, follow";

/**
 * Fits a description in `max` characters. Given a list of sentences, keeps as
 * many whole sentences as fit; text that still doesn't fit is cut at a word.
 */
export function truncate(text, max = MAX_DESCRIPTION) {
  if (Array.isArray(text)) {
    let kept = text[0];
    for (const sentence of text.slice(1)) {
      if (`${kept} ${sentence}`.length > max) break;
      kept = `${kept} ${sentence}`;
    }
    return truncate(kept, max);
  }
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  // Keep the last word when the cut falls right after it
  const words =
    clean[max - 1] === " " ? cut : cut.slice(0, cut.lastIndexOf(" "));
  return `${words.replace(/[\s,;:.–-]+$/, "")}…`;
}

/**
 * "Page | Algorithm Visualizer". `title` can be a list of candidates from most
 * to least descriptive: the first that fits is used, the brand only if it fits.
 */
export function fullTitle(title) {
  const candidates = [title].flat();
  const fitting =
    candidates.find((candidate) => candidate.length <= MAX_TITLE) ??
    candidates.at(-1);
  const branded = `${fitting} | ${SITE_NAME}`;
  return branded.length <= MAX_TITLE ? branded : fitting;
}

const ALGORITHM_LIST = Object.values(ALGORITHMS);
const STRUCTURE_LIST = Object.values(DATA_STRUCTURES);
const algorithmPath = (id) => `/visualizer?algo=${id}`;
const structurePath = (id) => `/data-structures/${id}`;
const patternPath = (id, problemId) =>
  problemId && problemId !== PATTERNS[id].problems[0]
    ? `/patterns/${id}?problem=${problemId}`
    : `/patterns/${id}`;

const HOME_CRUMB = { name: "Home", path: "/" };

function learningResource(page, extra = {}) {
  return {
    "@type": "LearningResource",
    name: page.heading,
    description: page.description,
    url: page.canonicalPath,
    learningResourceType: "Interactive visualization",
    inLanguage: "en",
    isAccessibleForFree: true,
    ...extra,
  };
}

function itemList(name, items) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.path,
    })),
  };
}

function home() {
  return {
    title: "Algorithm Visualizer: Learn DSA by Watching It Run",
    heading: "See how algorithms really work",
    description:
      "Interactive, step-by-step visualizations of sorting, searching and graph algorithms, data structures and interview patterns, with live code and explanations.",
    canonicalPath: "/",
    links: [
      { name: "Data structures", path: "/data-structures" },
      { name: "Patterns roadmap", path: "/patterns" },
      { name: "Compare algorithms", path: "/compare" },
      ...ALGORITHM_LIST.map((a) => ({
        name: a.name,
        path: algorithmPath(a.id),
      })),
    ],
    jsonLd: [{ "@type": "WebSite", name: SITE_NAME, url: "/" }],
  };
}

function algorithmPage(params) {
  const requested = params.get("algo");
  const id = ALGORITHMS[requested] ? requested : DEFAULT_ALGORITHM;
  const algorithm = ALGORITHMS[id];
  const { average } = algorithm.complexity.time;
  const page = {
    title: `${algorithm.name} Visualization, Step by Step`,
    heading: algorithm.name,
    description: truncate([
      algorithm.description,
      `Average time ${average}, space ${algorithm.complexity.space}.`,
      "Watch it run step by step on your own input.",
    ]),
    // ?arr=, ?target=… are the user's input: the algorithm is the page
    canonicalPath: algorithmPath(id),
    breadcrumbs: [
      HOME_CRUMB,
      { name: algorithm.name, path: algorithmPath(id) },
    ],
    links: ALGORITHM_LIST.filter(
      (a) => a.category === algorithm.category && a.id !== id,
    ).map((a) => ({ name: a.name, path: algorithmPath(a.id) })),
  };
  page.jsonLd = [
    learningResource(page, {
      educationalLevel: DIFFICULTIES[algorithm.difficulty],
      about: {
        "@type": "Thing",
        name: ALGORITHM_CATEGORIES[algorithm.category],
      },
      keywords: algorithm.tags.join(", "),
    }),
  ];
  return page;
}

function comparePage() {
  return {
    title: "Compare Sorting and Searching Algorithms Side by Side",
    heading: "Compare algorithms",
    description:
      "Run two sorting or searching algorithms on exactly the same input, side by side, and see which one does less work, or race all of them at once.",
    canonicalPath: "/compare",
    breadcrumbs: [HOME_CRUMB, { name: "Compare algorithms", path: "/compare" }],
  };
}

function structuresIndex() {
  const items = STRUCTURE_LIST.map((s) => ({
    name: s.name,
    path: structurePath(s.id),
  }));
  return {
    title: "Data Structures, Visualized Step by Step",
    heading: "Data structures",
    description: truncate([
      "Push, pop, insert and delete yourself, and watch each operation run step by step with its pseudocode.",
      `Covers the ${STRUCTURE_LIST.map((s) => s.name.toLowerCase()).join(", ")}.`,
    ]),
    canonicalPath: "/data-structures",
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Data structures", path: "/data-structures" },
    ],
    links: items,
    jsonLd: [
      {
        "@type": "CollectionPage",
        name: "Data structures",
        url: "/data-structures",
        mainEntity: itemList("Data structures", items),
      },
    ],
  };
}

function structurePage(id) {
  const structure = DATA_STRUCTURES[id];
  if (!structure) return null;
  const operations = Object.values(structure.operations)
    .map((op) => `${op.label} ${op.complexity}`)
    .join(", ");
  const page = {
    title: `${structure.name}: Interactive Visualization`,
    heading: structure.name,
    description: truncate([
      structure.description,
      `Try every operation yourself, step by step: ${operations}.`,
    ]),
    canonicalPath: structurePath(id),
    breadcrumbs: [
      HOME_CRUMB,
      { name: "Data structures", path: "/data-structures" },
      { name: structure.name, path: structurePath(id) },
    ],
    links: STRUCTURE_LIST.filter((s) => s.id !== id).map((s) => ({
      name: s.name,
      path: structurePath(s.id),
    })),
  };
  page.jsonLd = [
    learningResource(page, {
      educationalLevel: DIFFICULTIES[structure.difficulty],
      keywords: structure.tags.join(", "),
    }),
  ];
  return page;
}

function patternsIndex() {
  const items = PATTERN_LIST.map((p) => ({
    name: p.name,
    path: patternPath(p.id),
  }));
  return {
    title: `${PATTERN_LIST.length} DSA Patterns: Coding Interview Roadmap`,
    heading: `${PATTERN_LIST.length} patterns behind most interview problems`,
    description: truncate([
      `A roadmap of ${PATTERN_LIST.length} problem-solving patterns in learning order, from hashing and two pointers to graphs and dynamic programming.`,
      "Templates and LeetCode-style problems you can run.",
    ]),
    canonicalPath: "/patterns",
    breadcrumbs: [HOME_CRUMB, { name: "Patterns", path: "/patterns" }],
    links: items,
    jsonLd: [
      {
        "@type": "CollectionPage",
        name: "Patterns roadmap",
        url: "/patterns",
        mainEntity: itemList("Problem-solving patterns", items),
      },
    ],
  };
}

function patternPage(id, params) {
  const pattern = PATTERNS[id];
  if (!pattern) return null;
  const requested = params.get("problem");
  const problemId = pattern.problems.includes(requested)
    ? requested
    : pattern.problems[0];
  const problem = PROBLEMS[problemId];
  const group = PATTERN_GROUPS.find((g) => g.id === pattern.group);
  const crumbs = [
    HOME_CRUMB,
    { name: "Patterns", path: "/patterns" },
    { name: pattern.name, path: patternPath(id) },
  ];
  const showsOtherProblem = problem && problemId !== pattern.problems[0];
  if (showsOtherProblem)
    crumbs.push({ name: problem.title, path: patternPath(id, problemId) });

  const page = {
    title: problem
      ? [
          // "Binary Search: Binary Search Pattern" would repeat itself
          ...(problem.title === pattern.name
            ? []
            : [`${problem.title}: ${pattern.name} Pattern`]),
          `${problem.title}, Visualized`,
          problem.title,
        ]
      : [`${pattern.name} Pattern: When to Use It`, `${pattern.name} Pattern`],
    heading: pattern.name,
    description: truncate(
      problem
        ? [
            `${problem.title}${problem.leetcode ? ` (LeetCode ${problem.leetcode})` : ""} solved with the ${pattern.name} pattern, step by step on your own input.`,
            "Code in JavaScript, Python, Java and C++.",
            pattern.summary,
          ]
        : [
            pattern.summary,
            "When to use it, a code template and LeetCode problems to practice.",
          ],
    ),
    canonicalPath: patternPath(id, problemId),
    breadcrumbs: crumbs,
    links: [
      ...pattern.problems
        .filter((p) => p !== problemId)
        .map((p) => ({ name: PROBLEMS[p].title, path: patternPath(id, p) })),
      ...pattern.visualizers.map((v) => ({ name: v.label, path: v.to })),
    ],
  };
  page.jsonLd = [
    learningResource(page, {
      name: problem ? `${problem.title}: ${pattern.name}` : pattern.name,
      learningResourceType: problem ? "Interactive visualization" : "Lesson",
      about: { "@type": "Thing", name: group.name },
      ...(problem && {
        educationalLevel: PROBLEM_DIFFICULTIES[problem.difficulty],
      }),
    }),
  ];
  return page;
}

const privatePage = (title, heading, description, canonicalPath) => ({
  title,
  heading,
  description,
  canonicalPath,
  robots: NOINDEX,
});

function notFound() {
  return {
    status: 404,
    title: "Page not found",
    heading: "Page not found",
    description:
      "We couldn't find the page you're looking for. It might have been moved or doesn't exist.",
    canonicalPath: null,
    robots: "noindex",
    links: [
      { name: "Home", path: "/" },
      { name: "Data structures", path: "/data-structures" },
      { name: "Patterns roadmap", path: "/patterns" },
    ],
  };
}

function resolvePage(pathname, params) {
  if (pathname === "/") return home();
  if (pathname === "/visualizer") return algorithmPage(params);
  if (pathname === "/compare") return comparePage();
  if (pathname === "/data-structures") return structuresIndex();
  if (pathname === "/patterns") return patternsIndex();
  if (pathname === "/login")
    return privatePage(
      "Log in",
      "Welcome back",
      "Log in to see your saved runs and history.",
      "/login",
    );
  if (pathname === "/register")
    return privatePage(
      "Create an account",
      "Create your account",
      "Save every algorithm you run, with your inputs, and pick up where you left off.",
      "/register",
    );
  if (pathname === "/profile")
    return privatePage(
      "Your profile",
      "Your profile",
      "Your saved runs and account settings.",
      "/profile",
    );
  const structure = /^\/data-structures\/([a-z-]+)$/.exec(pathname);
  if (structure) return structurePage(structure[1]);
  const pattern = /^\/patterns\/([a-z-]+)$/.exec(pathname);
  if (pattern) return patternPage(pattern[1], params);
  return null;
}

/**
 * Everything the head needs for a URL. `search` is the query string, with or
 * without "?". Unknown routes and ids resolve to the 404 page (status 404).
 */
export function resolveSeo(pathname, search = "") {
  const params = new URLSearchParams(search);
  const page = resolvePage(pathname, params) ?? notFound();
  return {
    status: 200,
    robots: INDEX,
    breadcrumbs: [],
    links: [],
    jsonLd: [],
    ...page,
    title: fullTitle(page.title),
  };
}

const absolute = (origin, path) => new URL(path, origin).href;

function structuredData(seo, origin) {
  const graph = seo.jsonLd.map((item) => resolveUrls(item, origin));
  if (seo.breadcrumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: seo.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absolute(origin, crumb.path),
      })),
    });
  }
  return graph.length
    ? { "@context": "https://schema.org", "@graph": graph }
    : null;
}

// "url" fields hold site paths in the page data; JSON-LD needs absolute URLs
function resolveUrls(value, origin) {
  if (Array.isArray(value)) return value.map((v) => resolveUrls(v, origin));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        key === "url" && typeof v === "string"
          ? absolute(origin, v)
          : resolveUrls(v, origin),
      ]),
    );
  }
  return value;
}

/**
 * The head tags for a resolved page, as plain descriptors
 * ({ tag, attrs, text? }) so the server can serialize them and the browser
 * can create elements. `origin` is the production origin, e.g.
 * "https://example.com".
 */
export function seoTags(seo, origin) {
  const canonical = seo.canonicalPath && absolute(origin, seo.canonicalPath);
  const image = absolute(origin, SOCIAL_IMAGE.path);
  const meta = (key, value, attr = "name") => ({
    tag: "meta",
    attrs: { [attr]: key, content: String(value) },
  });
  const tags = [
    { tag: "title", attrs: {}, text: seo.title },
    meta("description", seo.description),
    meta("robots", seo.robots),
  ];
  if (canonical)
    tags.push({ tag: "link", attrs: { rel: "canonical", href: canonical } });
  tags.push(
    meta("og:site_name", SITE_NAME, "property"),
    meta("og:locale", "en_US", "property"),
    meta("og:type", "website", "property"),
    meta("og:title", seo.title, "property"),
    meta("og:description", seo.description, "property"),
    ...(canonical ? [meta("og:url", canonical, "property")] : []),
    meta("og:image", image, "property"),
    meta("og:image:width", SOCIAL_IMAGE.width, "property"),
    meta("og:image:height", SOCIAL_IMAGE.height, "property"),
    meta("og:image:alt", SOCIAL_IMAGE.alt, "property"),
    meta("twitter:card", "summary_large_image"),
    meta("twitter:title", seo.title),
    meta("twitter:description", seo.description),
    meta("twitter:image", image),
    meta("twitter:image:alt", SOCIAL_IMAGE.alt),
  );
  const data = structuredData(seo, origin);
  if (data) {
    tags.push({
      tag: "script",
      attrs: { type: "application/ld+json" },
      text: JSON.stringify(data),
    });
  }
  return tags;
}

/** Canonical, indexable paths for the sitemap. */
export function sitemapPaths() {
  return [
    "/",
    ...ALGORITHM_LIST.map((a) => algorithmPath(a.id)),
    "/compare",
    "/data-structures",
    ...STRUCTURE_LIST.map((s) => structurePath(s.id)),
    "/patterns",
    ...PATTERN_LIST.flatMap((p) => [
      patternPath(p.id),
      ...p.problems.slice(1).map((problemId) => patternPath(p.id, problemId)),
    ]),
  ];
}
