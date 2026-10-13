import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LIFECYCLE_STAGE_SCROLL, PROBLEM_LINE_SCROLL } from "@/lib/animation";
import { lifecycle, problem } from "@/lib/content/home";
import { SCREEN } from "./screens";
import { lerpFrame, sampleFrame, type Frame, type Segment } from "./segments";
import { slotFromBox } from "./slot";
import { LIFECYCLE_SLOT, PROBLEM_SLOT, STAGE_YAW, STATIONS, type LivePose, type Pose } from "./stations";

type Slot = { x: number; y: number; scale: number };

const section = (name: string) => document.querySelector<HTMLElement>(`[data-guide="${name}"]`);

/** The stage card's slot while its panel is in view; offsets ignore the track's transform. */
function cardSlot(): Slot {
  const card = document.querySelector<HTMLElement>('[data-guide-slot="lifecycle"]');
  if (!card) return STATIONS.lifecycle;
  const slot = slotFromBox(
    { left: card.offsetLeft, top: card.offsetTop, width: card.offsetWidth, height: card.offsetHeight },
    window.innerWidth,
    window.innerHeight,
    LIFECYCLE_SLOT.widthFactor
  );
  return { ...slot, x: slot.x + LIFECYCLE_SLOT.dx, y: slot.y + LIFECYCLE_SLOT.dy };
}

/** The convergence cluster's slot while the Problem section is pinned at the top. */
function clusterSlot(): Slot {
  const el = document.querySelector<HTMLElement>('[data-guide-slot="problem"]');
  const sec = section("problem");
  if (!el || !sec) return STATIONS.problem;
  const r = el.getBoundingClientRect();
  const s = sec.getBoundingClientRect();
  const slot = slotFromBox(
    { left: r.left, top: r.top - s.top, width: r.width, height: r.height },
    window.innerWidth,
    window.innerHeight,
    PROBLEM_SLOT.widthFactor
  );
  return { ...slot, x: slot.x + PROBLEM_SLOT.dx, y: slot.y + PROBLEM_SLOT.dy };
}

const frame = (p: Pose, fade = 1): Frame => ({ ...p, fade });

/** A ScrollTrigger used only to measure a scroll range; GSAP handles the pin spacing. */
const range = (trigger: Element | null, start: string, end: string | (() => string)) =>
  ScrollTrigger.create({ trigger, start, end, invalidateOnRefresh: true, refreshPriority: -1 });

const LAST_STAGE = lifecycle.stages.length - 1;

// Mirrors ProblemInterlude's timeline: every line fades in (1) and holds
// (0.6); every line but the closer then fades out (1).
const LINES = problem.gaps.length + 1;
const PIN_LENGTH = () => LINES * window.innerHeight * PROBLEM_LINE_SCROLL;
const PIN_TIME = LINES * 1.6 + (LINES - 1);
const CLOSER_AT = (LINES - 1) * 2.6;
/** Scroll after the Problem pin over which the laptop exits, in viewport heights. */
const EXIT_SCROLL = 0.5;
const EXIT_TIME = (PIN_TIME * EXIT_SCROLL) / (LINES * PROBLEM_LINE_SCROLL);

/**
 * Desktop journey, Hero → end of Problem. One master trigger scrubs a
 * smoothed scroll position and the pose is a pure function of it
 * (sampleFrame), so there is a single writer: separate tweens per segment
 * raced each other on big jumps (Home key, anchors, scroll restore) and
 * could leave the wrong segment's pose on screen.
 */
export function buildJourney(pose: LivePose, fade: HTMLElement, render: () => void) {
  let card = cardSlot();
  let cluster = clusterSlot();

  const stage = (i: number) =>
    frame({
      ...STATIONS.lifecycle,
      ...card,
      rotY: STATIONS.lifecycle.rotY + i * STAGE_YAW,
      screen: STATIONS.lifecycle.screen + i,
    });
  const atProblem = (rotY: number, screen: number) => frame({ ...STATIONS.problem, ...cluster, rotY, screen });

  const hero = range(section("hero"), "top top", "bottom top");
  const stages = range(section("lifecycle"), "top top", () => "+=" + LAST_STAGE * window.innerHeight * LIFECYCLE_STAGE_SCROLL);
  const opportunity = range(section("opportunity"), "top bottom", "top 20%");
  const toProblem = range(section("problem"), "top bottom", "top top");
  const finale = range(section("problem"), "top top", () => "+=" + (PIN_LENGTH() + window.innerHeight * EXIT_SCROLL));

  const finaleAt = (t: number) => {
    const time = t * (PIN_TIME + EXIT_TIME);
    // Slow drift across the pin; the screen resolves with the closer line
    const rotY = STATIONS.problem.rotY + 0.15 * Math.min(time / PIN_TIME, 1);
    const screen = SCREEN.fragmented + Math.min(Math.max(time - CLOSER_AT, 0), 1) * (SCREEN.unified - SCREEN.fragmented);
    const held = atProblem(rotY, screen);
    // Pin released: shrink and fade out over the next half screen
    return time <= PIN_TIME ? held : lerpFrame(held, frame(STATIONS.exit, 0), (time - PIN_TIME) / EXIT_TIME);
  };

  const segments = (): Segment[] => [
    { start: hero.start, end: hero.end, at: (t) => lerpFrame(frame(STATIONS.hero), stage(0), t) },
    {
      start: stages.start,
      end: stages.end,
      at: (t) => {
        const s = t * LAST_STAGE;
        const i = Math.min(Math.floor(s), LAST_STAGE - 1);
        return lerpFrame(stage(i), stage(i + 1), s - i);
      },
    },
    { start: opportunity.start, end: opportunity.end, at: (t) => lerpFrame(stage(LAST_STAGE), frame(STATIONS.opportunity), t) },
    {
      start: toProblem.start,
      end: toProblem.end,
      at: (t) => lerpFrame(frame(STATIONS.opportunity), atProblem(STATIONS.problem.rotY, SCREEN.fragmented), t),
    },
    { start: finale.start, end: finale.end, at: finaleAt },
  ];

  let segs = segments();
  const scroll = { y: 0 };
  const apply = () => {
    const { fade: alpha, ...p } = sampleFrame(segs, scroll.y);
    Object.assign(pose, p);
    gsap.set(fade, { autoAlpha: alpha });
    render();
  };

  gsap.fromTo(
    scroll,
    { y: () => hero.start },
    {
      y: () => finale.end,
      ease: "none",
      onUpdate: apply,
      scrollTrigger: {
        start: () => hero.start,
        end: () => finale.end,
        scrub: 0.6, // same smoothing as the LifecycleStrip track, so they stay in step
        invalidateOnRefresh: true,
        refreshPriority: -2, // after the ranges it reads
        onRefresh: () => {
          card = cardSlot();
          cluster = clusterSlot();
          segs = segments();
          apply();
        },
      },
    }
  );
}
