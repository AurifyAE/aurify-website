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
