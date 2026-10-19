import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveSeo, seoTags } from "@shared/seo";

// The server writes the first page's tags with the production origin
// (SITE_URL); keep using that origin for the canonical URLs of later pages.
const ORIGIN = (() => {
  const canonical = document.querySelector('link[rel="canonical"]');
  try {
    return canonical ? new URL(canonical.href).origin : window.location.origin;
  } catch {
    return window.location.origin;
  }
})();

/** Replaces the SEO tags (marked data-seo) in <head> with the given ones. */
function applyTags(tags) {
  for (const element of document.head.querySelectorAll("[data-seo]")) {
    element.remove();
  }
  const fragment = document.createDocumentFragment();
  for (const { tag, attrs, text } of tags) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs))
      element.setAttribute(name, value);
    element.setAttribute("data-seo", "");
    if (text !== undefined) element.textContent = text;
    fragment.append(element);
  }
  document.head.append(fragment);
}

/**
 * Keeps the title, description, canonical URL, social tags and structured
 * data in sync with the current route (shared/seo.js decides them).
 */
export function SeoManager() {
  const { pathname, search } = useLocation();
  const seo = resolveSeo(pathname, search);
  const key = JSON.stringify(seoTags(seo, ORIGIN));

  useEffect(() => {
    applyTags(JSON.parse(key));
  }, [key]);

  return null;
}
