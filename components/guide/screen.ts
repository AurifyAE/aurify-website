/**
 * Splits a fractional screen index into the two textures to show and how far
 * to blend between them, so scrubbing `screen` from 2 to 3 crossfades screen
 * 2 into screen 3. Clamped to the available screens.
 */
export function screenBlend(screen: number, count: number) {
  const s = Math.min(Math.max(screen, 0), count - 1);
  const a = Math.floor(s);
  const b = Math.min(a + 1, count - 1);
  return { a, b, mix: s - a };
}
