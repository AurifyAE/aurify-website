// Pure, dependency-free maths for the travelling ingot. Checked by
// lib/ingot/math.check.mjs (no test runner in this repo).

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * How scattered fragment `index` is (0 docked → 1 scattered) for a global
 * split. As split falls 1 → 0 the pieces dock one per equal step, piece 0
 * first, so each Problem gap line docks exactly one piece.
 */
export function fragmentAmount(split: number, index: number, count: number): number {
  return clamp((split - (count - 1 - index) / count) * count, 0, 1);
}

export type Rect = { left: number; top: number; width: number; height: number };
export type DockName = "hero" | "lifecycle" | "opportunity" | "problem";
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
 * The centre is clamped to the inner 80% of the viewport so the guide stays
 * on screen while its next dock is still scrolling in.
 */
export function rectToWorld(r: Rect, vw: number, vh: number) {
  return {
    x: clamp(r.left + r.width / 2 - vw / 2, -vw * 0.4, vw * 0.4),
    y: clamp(vh / 2 - (r.top + r.height / 2), -vh * 0.4, vh * 0.4),
    scale: r.width,
  };
}

/** Lifecycle: a 2:1 box (length = 2 × band height) centred on the line's head. */
export function lifecycleRect(band: Rect, progress: number): Rect {
  return {
    left: band.left + progress * band.width - band.height,
    top: band.top,
    width: band.height * 2,
    height: band.height,
  };
}

/** The visible dock whose section straddles the viewport's centre line. */
export function pickDock(docks: DockSample[], vh: number): DockSample | null {
  const mid = vh / 2;
  return (
    docks.find(
      (d) => d.section && d.section.top <= mid && d.section.bottom > mid && d.rect.width > 0
    ) ?? null
  );
}

/** `current` shifted by whole turns to lie within π of `target` (no unwinding spins). */
export function shortestAngle(current: number, target: number): number {
  const TAU = Math.PI * 2;
  return target + ((((current - target) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
}
