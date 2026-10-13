// Pure, dependency-free maths for the hero ingot. Checked by
// lib/ingot/math.check.mjs (no test runner in this repo).

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type Rect = { left: number; top: number; width: number; height: number };
export type DockName = "hero";
export type DockSample = {
  name: DockName;
  rect: Rect;
  section: { top: number; bottom: number } | null;
};

/** Camera distance at which 1 world unit = 1 CSS px on the z = 0 plane. */
export function cameraDistance(vh: number, fovDeg: number): number {
  return vh / 2 / Math.tan((fovDeg * Math.PI) / 360);
}

/**
 * Dock rect (viewport px) → ingot centre in world px (origin at viewport
 * centre, y up) and scale (the bar is 1 unit long, so scale = width px).
 * The centre is clamped to the inner 80% of the viewport so the ingot stays
 * on screen while the dock scrolls away.
 */
export function rectToWorld(r: Rect, vw: number, vh: number) {
  return {
    x: clamp(r.left + r.width / 2 - vw / 2, -vw * 0.4, vw * 0.4),
    y: clamp(vh / 2 - (r.top + r.height / 2), -vh * 0.4, vh * 0.4),
    scale: r.width,
  };
}

/**
 * Among visible docks whose section straddles the viewport's centre line,
 * the one nearest the viewport centre (a section may hold breakpoint
 * variants - only the visible one has width - or several docks).
 */
export function pickDock(docks: DockSample[], vw: number, vh: number): DockSample | null {
  const midY = vh / 2;
  let best: DockSample | null = null;
  let bestDist = Infinity;
  for (const d of docks) {
    if (!d.section || d.section.top > midY || d.section.bottom <= midY || d.rect.width <= 0) {
      continue;
    }
    const dist = Math.hypot(
      d.rect.left + d.rect.width / 2 - vw / 2,
      d.rect.top + d.rect.height / 2 - midY
    );
    if (dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}
