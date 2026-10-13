"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK, PROBLEM_LINE_SCROLL } from "@/lib/animation";
import { problem } from "@/lib/content/home";

// Convergence visual: four fragments, one per "gap" line, docked in a tidy
// cluster by default (the no-JS / reduced-motion resting state). Under
// motion they start scattered and each snaps into place as its matching
// line becomes active, so the visual literally resolves in step with the
// copy - by the closer line every fragment is docked and the ring around
// them has drawn in.
const FRAGMENTS = [
  { dx: -30, dy: -30, scatterX: -72, scatterY: -56, rotate: -18, color: "bg-sky" },
  { dx: 30, dy: -30, scatterX: 66, scatterY: -60, rotate: 20, color: "bg-blue" },
  { dx: -30, dy: 30, scatterX: -62, scatterY: 58, rotate: 16, color: "bg-teal" },
  { dx: 30, dy: 30, scatterX: 70, scatterY: 52, rotate: -20, color: "bg-navy" },
] as const;

/**
 * §4 - The Problem. Dark ink interlude, the site's second (and last) pin.
 * Under motion, the four gaps + closer are stacked absolutely and cross-fade
 * one at a time as the user scrolls through the pin distance. The static
 * markup is a normal stacked list, so reduced motion and no-JS get a clean
 * readable layout - GSAP restyles to the slide layout only when animating.
 *
 * The convergence visual (desktop only) rides the same scrub timeline: each
 * fragment travels from its scattered start to its docked (CSS-declared,
 * x/y 0) position exactly when its line fades in.
 */
export default function ProblemInterlude() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>(
          "[data-problem-line]",
          sectionRef.current
        );
        if (!lines.length) return;

        const fragments = gsap.utils.toArray<HTMLElement>(
          "[data-problem-fragment]",
          sectionRef.current
        );

        // With the guide laptop parked over the cluster, fragments start
        // further out so they're seen flying in behind its screen. Function
        // values, so the refresh the guide fires after adding guide-on
        // re-reads it.
        const spread = () =>
          document.documentElement.classList.contains("guide-on") ? 3.5 : 1;

        // Restack the flowing list into overlapping slides
        gsap.set(lines, {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          margin: 0,
          autoAlpha: 0,
          y: 32,
        });

        // Hide the ring - it starts from its visible CSS position, so this is
        // purely additive. The fragments' scattered start is set by their
        // fromTo below.
        if (ringRef.current) {
          gsap.set(ringRef.current, { scale: 0.6, autoAlpha: 0 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + lines.length * window.innerHeight * PROBLEM_LINE_SCROLL,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        lines.forEach((line, i) => {
          tl.to(line, { autoAlpha: 1, y: 0, duration: 1, ease: "none" });
          const frag = fragments[i];
          const f = FRAGMENTS[i];
          if (frag && f) {
            // fromTo renders its scattered start immediately - the same state
            // a gsap.set used to apply up front
            tl.fromTo(
              frag,
              {
                x: () => f.scatterX * spread(),
                y: () => f.scatterY * spread(),
                rotate: f.rotate,
                scale: 0.8,
                opacity: 0.4,
              },
              { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1, ease: "none" },
              "<"
            );
          } else if (ringRef.current) {
            // Closer line - the last fragment has just docked, so draw the
            // resolved ring around the cluster in step with it.
            tl.to(ringRef.current, { scale: 1, autoAlpha: 1, duration: 1, ease: "none" }, "<");
          }
          tl.to({}, { duration: 0.6 }); // hold
          if (i < lines.length - 1) {
            tl.to(line, { autoAlpha: 0, y: -32, duration: 1, ease: "none" });
          }
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} data-guide="problem" className="bg-mist text-navy">
      <div className="flex min-h-svh items-center py-24">
        <div className="mx-auto w-full max-w-content px-6 md:px-10">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-20">
            <div>
              <p className="text-eyebrow uppercase text-blue">{problem.eyebrow}</p>
              <p className="mt-3 text-sm text-ink/60">{problem.lead}</p>

              <div className="relative mt-16 min-h-[16rem] space-y-12 md:min-h-[14rem]">
                {problem.gaps.map((gap) => (
                  <p
                    key={gap.keyword}
                    data-problem-line
                    className="max-w-3xl text-title-sm font-light leading-snug text-ink/60"
                  >
                    <span className="font-normal text-blue">{gap.keyword}</span>
                    {gap.text.slice(gap.keyword.length)}
                  </p>
                ))}
                <p
                  data-problem-line
                  className="max-w-3xl text-title font-normal leading-tight text-navy"
                >
                  {problem.closer}
                </p>
              </div>
            </div>

            {/* Convergence visual - four fragments (one per gap) docked in
                a tidy cluster, ringed once resolved. Decorative; hidden
                below md where there's no room for it beside the text. */}
            <div
              aria-hidden
              data-guide-slot="problem"
              className="relative hidden h-64 w-64 shrink-0 md:block"
            >
              <div
                ref={ringRef}
                className="absolute rounded-full border border-blue/25 [.guide-on_&]:hidden"
                style={{ width: 172, height: 172, top: "50%", left: "50%", marginTop: -86, marginLeft: -86 }}
              />
              {FRAGMENTS.map((f, i) => (
                <div
                  key={i}
                  data-problem-fragment
                  className={`absolute h-9 w-9 rounded-lg ${f.color}`}
                  style={{
                    top: `calc(50% + ${f.dy}px)`,
                    left: `calc(50% + ${f.dx}px)`,
                    marginTop: -18,
                    marginLeft: -18,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
