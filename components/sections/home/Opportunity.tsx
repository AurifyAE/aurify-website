"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { opportunity } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";
import CountUp from "@/components/ui/CountUp";

/**
 * §3 — The Opportunity. Three stat cards: staggered rise with the big
 * figures emerging from an overflow mask; numeric values count up on entry.
 */
export default function Opportunity() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            once: true,
          },
        });
        tl.from("[data-stat]", {
          autoAlpha: 0,
          y: 32,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
        }).from(
          "[data-stat-num]",
          {
            yPercent: 100,
            duration: DURATION.base,
            ease: EASE.expo,
            stagger: STAGGER.loose,
          },
          0.15
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          eyebrow={opportunity.eyebrow}
          title={opportunity.title}
          body={opportunity.body}
        />

        <div ref={gridRef} className="mt-16 grid gap-10 md:grid-cols-3">
          {opportunity.stats.map((stat) => (
            <div key={stat.label} data-stat className="border-t border-ink/10 pt-6">
              <div className="overflow-hidden">
                <p data-stat-num className="text-title text-navy">
                  {stat.value !== null ? (
                    <CountUp
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  ) : (
                    stat.display
                  )}
                </p>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
