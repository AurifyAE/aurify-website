import type { Pose } from "./stations.ts";

/** A pose plus the guide layer's opacity. */
export type Frame = Pose & { fade: number };

/** A scroll range [start, end] (page px) and the frame at local progress t ∈ [0, 1]. */
export type Segment = { start: number; end: number; at: (t: number) => Frame };

const KEYS = ["x", "y", "rotX", "rotY", "scale", "lid", "screen", "fade"] as const;

export function lerpFrame(a: Frame, b: Frame, t: number): Frame {
  const out = {} as Frame;
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/**
 * The frame at scroll position `y`, as a pure function of position: inside a
 * segment it follows that segment; before or between segments it holds where
 * the next one starts; past the last it holds the end. Segments are in scroll
 * order, and each starts where the previous one ended.
 */
export function sampleFrame(segments: Segment[], y: number): Frame {
  for (const s of segments) {
    if (y < s.end) return s.at(Math.min(Math.max((y - s.start) / (s.end - s.start || 1), 0), 1));
  }
  return segments[segments.length - 1].at(1);
}
