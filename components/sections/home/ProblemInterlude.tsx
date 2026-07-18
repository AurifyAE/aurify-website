"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/animation";
import { problem } from "@/lib/content/home";

/**
 * §4 — The Problem. Dark ink interlude, the site's second (and last) pin.
 * Under motion, the four gaps + closer are stacked absolutely and cross-fade
 * one at a time as the user scrolls through the pin distance. The static
 * markup is a normal stacked list, so reduced motion and no-JS get a clean
 * readable layout — GSAP restyles to the slide layout only when animating.
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

        lines.forEach((line, i) => {
          tl.to(line, { autoAlpha: 1, y: 0, duration: 1, ease: "none" });
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
    <section ref={sectionRef} className="bg-ink text-white">
      <div className="flex min-h-svh items-center py-24">
        <div className="mx-auto w-full max-w-content px-6 md:px-10">
          <p className="text-eyebrow uppercase text-sky">{problem.eyebrow}</p>
          <p className="mt-3 text-sm text-white/60">{problem.lead}</p>

          <div className="relative mt-16 min-h-[16rem] space-y-12 md:min-h-[14rem]">
            {problem.gaps.map((gap) => (
              <p
                key={gap.keyword}
                data-problem-line
                className="max-w-3xl text-title-sm font-light leading-snug text-white/60"
              >
                <span className="font-normal text-sky">{gap.keyword}</span>
                {gap.text.slice(gap.keyword.length)}
              </p>
            ))}
            <p
              data-problem-line
              className="max-w-3xl text-title font-normal leading-tight text-white"
            >
              {problem.closer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
