"use client";

import { useEffect, useState } from "react";

/**
 * For non-GSAP cases (Framer Motion micro-interactions, conditional rendering).
 * GSAP components should prefer gsap.matchMedia() with MOTION_OK/MOTION_REDUCED.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
