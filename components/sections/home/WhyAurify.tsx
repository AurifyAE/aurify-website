"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, RISE, STAGGER } from "@/lib/animation";
import { whyAurify } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * §6 - Why Aurify. Pure-typography editorial list: hairline rules, number,
 * bold claim, one supporting sentence. No cards, no shadows.
 */
export default function WhyAurify() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-why-row]", {
          autoAlpha: 0,
          y: RISE,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.base,
          scrollTrigger: {
            trigger: "[data-why-grid]",
            start: "top 80%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading eyebrow={whyAurify.eyebrow} title={whyAurify.title} />

        <div data-why-grid className="mt-16 grid gap-x-16 md:grid-cols-2">
          {whyAurify.items.map((item, i) => (
            <div
              key={item.claim}
              data-why-row
              className="flex gap-6 border-t border-ink/10 py-8"
            >
              <span className="text-sm font-light text-ink/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-medium text-navy">{item.claim}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  {item.support}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
