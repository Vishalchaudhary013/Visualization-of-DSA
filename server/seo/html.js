import { resolveSeo, seoTags } from "../../shared/seo.js";
import { siteOrigin } from "../config/site.js";

const escapeHtml = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// JSON inside <script> must not be able to close the tag
const escapeScript = (text) => text.replaceAll("<", "\\u003c");

/** Serializes the tag descriptors from shared/seo.js; data-seo lets the client replace them. */
export function renderTags(tags) {
  return tags
    .map(({ tag, attrs, text }) => {
      const attributes = Object.entries({ ...attrs, "data-seo": "" })
        .map(([name, value]) =>
          value === "" ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`,
        )
        .join("");
      if (tag === "meta" || tag === "link") return `<${tag}${attributes} />`;
      const body = tag === "script" ? escapeScript(text) : escapeHtml(text);
      return `<${tag}${attributes}>${body}</${tag}>`;
    })
    .join("\n    ");
}

const NAV = [
  { name: "Home", path: "/" },
  { name: "Algorithms", path: "/visualizer" },
  { name: "Compare", path: "/compare" },
  { name: "Data structures", path: "/data-structures" },
  { name: "Patterns", path: "/patterns" },
];

// Inline styles: the app's stylesheet resets headings and lists
const linkList = (label, links) =>
  `<nav aria-label="${escapeHtml(label)}"><ul style="display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin:.75rem 0">${links
    .map(
      (link) =>
        `<li><a href="${escapeHtml(link.path)}" style="text-decoration:underline">${escapeHtml(link.name)}</a></li>`,
    )
    .join("")}</ul></nav>`;

/**
 * The page's heading, description and links for clients that don't run
 * JavaScript. React replaces nothing here: <noscript> is ignored when JS runs.
 */
export function renderFallback(seo) {
  const parts = [linkList("Main", NAV)];
  if (seo.breadcrumbs.length > 1)
    parts.push(linkList("Breadcrumb", seo.breadcrumbs));
  parts.push(
    `<h1 style="font-size:2rem;font-weight:700;margin:1rem 0 .5rem">${escapeHtml(seo.heading)}</h1>`,
    `<p>${escapeHtml(seo.description)}</p>`,
  );
  if (seo.links.length) parts.push(linkList("Related pages", seo.links));
  parts.push(
    "<p>Turn on JavaScript to use the interactive visualizations.</p>",
  );
  return `<noscript><main style="max-width:48rem;margin:0 auto;padding:1.5rem">${parts.join("")}</main></noscript>`;
}

const HEAD_MARKER = "<!-- seo:head -->";

/** index.html with the page's SEO tags and no-JS fallback filled in. */
export function renderPage(template, seo, origin) {
  const head = renderTags(seoTags(seo, origin));
  const withHead = template.includes(HEAD_MARKER)
    ? template.replace(HEAD_MARKER, head)
    : template.replace("</head>", `    ${head}\n  </head>`);
  return withHead.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n    ${renderFallback(seo)}`,
  );
}

/** Responds to a page request with the right status, robots header and tags. */
export function sendPage(req, res, template) {
  const query = req.originalUrl.split("?")[1] ?? "";
  const seo = resolveSeo(req.path, query);
  res.status(seo.status).set("Cache-Control", "no-cache");
  if (seo.robots.includes("noindex")) res.set("X-Robots-Tag", seo.robots);
  res.type("html").send(renderPage(template, seo, siteOrigin(req)));
}
