// XML sitemaps (sitemaps.org protocol). One file while the site has at most
// `limit` URLs, otherwise a sitemap index pointing at numbered files.
export const MAX_URLS_PER_SITEMAP = 50_000;

const escapeXml = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const NAMESPACE = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

function urlset(urls) {
  // No <lastmod>: pages change with deploys, and there is no reliable date per page
  const entries = urls.map(
    (url) => `  <url><loc>${escapeXml(url)}</loc></url>`,
  );
  return `${XML_HEADER}\n<urlset ${NAMESPACE}>\n${entries.join("\n")}\n</urlset>\n`;
}

function sitemapIndex(locations) {
  const entries = locations.map(
    (loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`,
  );
  return `${XML_HEADER}\n<sitemapindex ${NAMESPACE}>\n${entries.join("\n")}\n</sitemapindex>\n`;
}

/**
 * -> { main, parts } where `main` is served at /sitemap.xml (a urlset, or a
 * sitemap index when split) and parts[i] at /sitemap-{i + 1}.xml.
 */
export function buildSitemaps(origin, paths, limit = MAX_URLS_PER_SITEMAP) {
  const urls = paths.map((path) => new URL(path, origin).href);
  if (urls.length <= limit) return { main: urlset(urls), parts: [] };
  const parts = [];
  for (let start = 0; start < urls.length; start += limit) {
    parts.push(urlset(urls.slice(start, start + limit)));
  }
  return {
    main: sitemapIndex(parts.map((_, i) => `${origin}/sitemap-${i + 1}.xml`)),
    parts,
  };
}
