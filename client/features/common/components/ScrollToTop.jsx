import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top whenever the page (path) changes
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "instant" overrides the global smooth scrolling so the new page opens at the top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
