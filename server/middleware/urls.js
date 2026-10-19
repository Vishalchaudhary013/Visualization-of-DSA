/**
 * 301-redirects "/patterns/" to "/patterns" (keeping the query) so every page
 * has a single URL. Leading slashes are collapsed so "//evil.example/" can
 * never become a redirect to another site.
 */
export function removeTrailingSlash(req, res, next) {
  const { path } = req;
  if (
    (req.method !== "GET" && req.method !== "HEAD") ||
    path.length <= 1 ||
    !path.endsWith("/")
  ) {
    return next();
  }
  const clean = `/${path.replace(/^\/+|\/+$/g, "")}`;
  const queryStart = req.originalUrl.indexOf("?");
  const search = queryStart === -1 ? "" : req.originalUrl.slice(queryStart);
  res.redirect(301, `${clean}${search}`);
}
