/**
 * Shared values section timelines write and IngotStage reads each frame.
 * Sections never touch three.js objects - this keeps the 3D on exactly the
 * same scrub as the copy it accompanies.
 */
export const ingotState = {
  /** Hero is showing a full-bleed poster slide - hide the ingot. */
  heroHidden: false,
  /** LifecycleStrip scrub progress, 0..1. */
  lifecycle: 0,
  /** Stage-to-stage moves in the strip (stages - 1); half a turn each. */
  lifecycleSteps: 1,
  /** ProblemInterlude: 0 whole bar → 1 fully scattered. */
  split: 0,
  /** ProblemInterlude closer: specular sweep across the stamp, 0..1. */
  glint: 0,
};
