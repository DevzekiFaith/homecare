"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the top of the page on every client-side navigation.
 * This prevents the "shrunk view" flash caused by Next.js preserving
 * the previous page's scroll position during route transitions.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Instant scroll — no smooth animation so the new page just starts at top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

