/**
 * Shared animation vocabulary - keeps every section moving with one voice.
 */
export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
} as const;

export const DURATION = {
  fast: 0.5,
  base: 0.8,
  slow: 1.2,
} as const;

export const STAGGER = {
  tight: 0.06,
  base: 0.1,
  loose: 0.16,
} as const;

/** Default reveal offset (px) for fade-up entrances */
export const RISE = 40;

/** gsap.matchMedia() condition strings */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

/** Scroll per lifecycle stage, in viewport heights (LifecycleStrip pin + guide). */
export const LIFECYCLE_STAGE_SCROLL = 0.6;

/** Scroll per Problem line, in viewport heights (ProblemInterlude pin + guide). */
export const PROBLEM_LINE_SCROLL = 0.7;
