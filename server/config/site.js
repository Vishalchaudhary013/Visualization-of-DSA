// The public origin used in canonical URLs, social tags, the sitemap and
// robots.txt. Set SITE_URL in production (e.g. https://algo.example.com).
const isProduction = process.env.NODE_ENV === "production";
let warned = false;

function configuredOrigin() {
  const value = process.env.SITE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error();
    return url.origin; // drops any path or trailing slash
  } catch {
    throw new Error(`SITE_URL must be an absolute http(s) URL, got "${value}"`);
  }
}

const CONFIGURED = configuredOrigin();
const SAFE_HOST = /^[a-z0-9.-]+(:\d{1,5})?$/i;

/**
 * SITE_URL when set. Otherwise the origin of the request (fine in development;
 * production logs a warning because canonical URLs then follow the Host header).
 */
export function siteOrigin(req) {
  if (CONFIGURED) return CONFIGURED;
  if (isProduction && !warned) {
    warned = true;
    console.warn(
      "SITE_URL is not set: canonical URLs, the sitemap and robots.txt use the request's host. Set SITE_URL to the production URL.",
    );
  }
  const host = req.get("host");
  return SAFE_HOST.test(host ?? "")
    ? `${req.protocol}://${host}`
    : "http://localhost";
}
