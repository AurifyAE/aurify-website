import { SCREEN } from "./screens";

/** One stop on the laptop's journey (spec: Choreography). */
export type Pose = {
  /** Centre, fraction of viewport width from the middle (+ right). */
  x: number;
  /** Centre, fraction of viewport height from the middle (+ up). */
  y: number;
  /** Radians; positive tips the top toward the viewer. */
  rotX: number;
  /** Radians; negative turns the front left, toward left-aligned copy. */
  rotY: number;
  /** Laptop width as a fraction of viewport width. */
  scale: number;
  /** 0 closed … 1 fully open. */
  lid: number;
  /** Index into SCREENS; fractions crossfade. */
  screen: number;
};

/** The object GSAP writes and the render loop reads; `rise` is the load-in offset. */
export type LivePose = Pose & { rise: number };

// Starting values - tuned with the user at each gate. Lifecycle and Problem
// x / y / scale are replaced at runtime by their measured DOM slots; the
// values here are only the fallback if the slot element is missing.
export const STATIONS = {
  hero: { x: 0, y: -0.43, rotX: 0.5, rotY: 0, scale: 0.24, lid: 0, screen: SCREEN.overview },
  lifecycle: { x: 0.27, y: -0.02, rotX: 0.15, rotY: -0.3, scale: 0.24, lid: 1, screen: SCREEN.firstStage },
  opportunity: { x: 0.3, y: 0.18, rotX: 0.1, rotY: -1.2, scale: 0.17, lid: 1, screen: SCREEN.overview },
  problem: { x: 0.3, y: 0, rotX: 0.12, rotY: -0.5, scale: 0.24, lid: 1, screen: SCREEN.fragmented },
  exit: { x: 0.3, y: 0.1, rotX: 0.12, rotY: -0.8, scale: 0.12, lid: 0.5, screen: SCREEN.unified },
} satisfies Record<string, Pose>;

/** Extra yaw per lifecycle stage (~3°): a slow walk around the laptop. */
export const STAGE_YAW = 0.05;

// The open, turned laptop looks wider than the card it replaces and its mass
// shifts toward the copy, so it sits a little smaller and to the right of the slot.
export const LIFECYCLE_SLOT = { dx: 0.03, dy: -0.02, widthFactor: 0.85 };

/** Fully open lid in radians (~105°); negative lifts the lid's front edge. */
export const LID_OPEN = -1.83;

/** Laptop width relative to the Problem section's 256px convergence cluster. */
export const PROBLEM_SLOT_WIDTH = 1.4;
