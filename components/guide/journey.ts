import { gsap } from "@/lib/gsap";
import { LIFECYCLE_STAGE_SCROLL } from "@/lib/animation";
import { lifecycle } from "@/lib/content/home";
import { slotFromBox } from "./slot";
import { LIFECYCLE_SLOT, STAGE_YAW, STATIONS, type LivePose, type Pose } from "./stations";

type PoseVars = { [K in keyof Pose]?: number | (() => number) };

const section = (name: string) => document.querySelector<HTMLElement>(`[data-guide="${name}"]`);

const TRIGGER_DEFAULTS = { scrub: 0.6, invalidateOnRefresh: true, refreshPriority: -1 } as const;

/**
 * Scrubs `pose` from one station to the next over a scroll range. Always
 * fromTo: a plain `to` would re-record its start from wherever the pose is
 * on refresh (resize, reload mid-page) and replay the wrong path.
 */
function scrub(pose: LivePose, from: PoseVars, to: PoseVars, trigger: ScrollTrigger.Vars, render: () => void) {
  return gsap.fromTo(pose, from, {
    ...to,
    ease: "none",
    immediateRender: false,
    onUpdate: render,
    scrollTrigger: { ...TRIGGER_DEFAULTS, ...trigger },
  });
}

/** The stage card's slot while its panel is in view; offsets ignore the track's transform. */
function cardSlot() {
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

/** Pose at lifecycle stage `i` (0-based). */
const stage = (i: number): PoseVars => ({
  ...STATIONS.lifecycle,
  x: () => cardSlot().x,
  y: () => cardSlot().y,
  scale: () => cardSlot().scale,
  rotY: STATIONS.lifecycle.rotY + i * STAGE_YAW,
  screen: STATIONS.lifecycle.screen + i,
});

const LAST_STAGE = lifecycle.stages.length - 1;

function heroToLifecycle(pose: LivePose, render: () => void) {
  // Lid opens and the laptop travels into the card slot as the hero leaves
  scrub(pose, STATIONS.hero, stage(0), { trigger: section("hero"), start: "top top", end: "bottom top" }, render);
}

function lifecycleStages(pose: LivePose, render: () => void) {
  // Same range as LifecycleStrip's pin, split into one segment per stage so
  // its stage snap lands the laptop exactly on a station.
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: render,
    scrollTrigger: {
      ...TRIGGER_DEFAULTS,
      trigger: section("lifecycle"),
      start: "top top",
      end: () => "+=" + LAST_STAGE * window.innerHeight * LIFECYCLE_STAGE_SCROLL,
    },
  });
  for (let i = 0; i < LAST_STAGE; i++) {
    tl.fromTo(pose, stage(i), { ...stage(i + 1), immediateRender: false });
  }
}

/** Desktop journey: every scroll segment from Hero to the end of Problem. */
export function buildJourney(pose: LivePose, render: () => void) {
  heroToLifecycle(pose, render);
  lifecycleStages(pose, render);
}
