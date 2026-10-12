"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/animation";
import { problem } from "@/lib/content/home";
import { ingotState } from "@/lib/ingot/ingotState";

/**
 * §4 - The Problem. Dark ink interlude, the site's second (and last) pin.
 * Under motion, the four gaps + closer are stacked absolutely and cross-fade
 * one at a time as the user scrolls through the pin distance. The static
 * markup is a normal stacked list, so reduced motion and no-JS get a clean
 * readable layout - GSAP restyles to the slide layout only when animating.
 *
 * The travelling ingot (IngotStage) rides the same scrub: it fractures as
 * the pin starts, docks one piece per gap line via `ingotState.split`, and
 * the closer line sweeps a glint across the whole bar.
 */
export default function ProblemInterlude() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>(
          "[data-problem-line]",
          sectionRef.current
        );
        if (!lines.length) return;

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

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + lines.length * window.innerHeight * 0.7,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // The ingot arrives whole and fractures as the pin takes hold…
        tl.fromTo(ingotState, { split: 0 }, { split: 1, duration: 0.6, ease: "none" });

        lines.forEach((line, i) => {
          tl.to(line, { autoAlpha: 1, y: 0, duration: 1, ease: "none" });
          if (i < lines.length - 1) {
            // …then each gap line docks one piece (1 → 0.75 → … → 0).
            tl.to(
              ingotState,
              { split: 1 - (i + 1) / (lines.length - 1), duration: 1, ease: "none" },
              "<"
            );
          } else {
            // Closer line: the bar is whole - one glint across the stamp.
            tl.to(ingotState, { glint: 1, duration: 1, ease: "none" }, "<");
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
    <section ref={sectionRef} className="bg-mist text-navy">
      <div className="flex min-h-svh items-center py-24">
        <div className="mx-auto w-full max-w-content px-6 md:px-10">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto] md:gap-20">
            <div>
              {/* Mobile dock - the ingot returns small and whole above the copy. */}
              <div
                data-ingot-dock="problem"
                aria-hidden
                className="pointer-events-none mb-8 h-12 w-24 md:hidden"
              />
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

            {/* Dock for the travelling ingot (IngotStage): it fractures
                and reassembles here in step with the gap lines. The box is
                the whole burst area (pose fill) - the grid gap keeps the
                scattered pieces clear of the copy at every width. */}
            <div
              data-ingot-dock="problem"
              aria-hidden
              className="pointer-events-none hidden h-[min(20vmin,12rem)] w-[min(40vmin,22rem)] shrink-0 md:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
