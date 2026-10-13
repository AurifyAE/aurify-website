"use client";

import { Component, Suspense, useCallback, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, MOTION_OK, MOTION_REDUCED } from "@/lib/animation";
import { buildJourney } from "./journey";
import Laptop, { Studio } from "./Laptop";
import { STATIONS, type LivePose } from "./stations";

/** No WebGL or a failed model load renders nothing: the page stays as it is. */
class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The scroll guide: one laptop on a fixed layer in front of the home page.
 * GSAP writes `pose`, the R3F loop reads it; frameloop="demand" means the GPU
 * only renders when a tween calls `invalidate`.
 */
export default function GuideCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null); // load-in fade
  const fadeRef = useRef<HTMLDivElement>(null); // scroll-driven fades
  const invalidateRef = useRef<() => void>(() => {});
  const pose = useRef<LivePose>({ ...STATIONS.hero, rise: 0 }).current;
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    // Dev-only hooks for verifying and tuning poses from the console
    Object.assign(window, { __guidePose: pose, __guideRender: () => invalidateRef.current() });
  }

  useGSAP(
    () => {
      if (!ready) return;
      const render = () => invalidateRef.current();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const html = document.documentElement;
        html.classList.add("guide-on");
        gsap.fromTo(wrapRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: EASE.out });
        gsap.fromTo(pose, { rise: 0.08 }, { rise: 0, duration: 1.2, ease: EASE.out, onUpdate: render });
        // guide-on changes section styling that other triggers measure
        ScrollTrigger.refresh();
        return () => html.classList.remove("guide-on");
      });

      mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        buildJourney(pose, render);
        ScrollTrigger.refresh();
      });

      mm.add(MOTION_REDUCED, () => {
        Object.assign(pose, STATIONS.hero, { lid: 1, rise: 0 });
        gsap.set(wrapRef.current, { autoAlpha: 1 });
        render();
      });

      return () => mm.revert();
    },
    { dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none invisible fixed inset-0 z-30">
      <div ref={fadeRef} className="h-full w-full">
        <Fallback>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ fov: 30, position: [0, 0, 10] }}
            gl={{ alpha: true, antialias: true }}
            // R3F sets pointer-events: auto on its wrapper; the page underneath must stay clickable
            style={{ pointerEvents: "none" }}
            onCreated={(state) => {
              invalidateRef.current = () => state.invalidate();
            }}
          >
            <Studio />
            <Suspense fallback={null}>
              <Laptop pose={pose} onReady={onReady} />
            </Suspense>
          </Canvas>
        </Fallback>
      </div>
    </div>
  );
}
