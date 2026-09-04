"use client";

import { useRef } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AiBrain02Icon,
  Analytics03Icon,
  FlowConnectionIcon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, RISE, STAGGER } from "@/lib/animation";
import { pillars } from "@/lib/content/home";

const pillarIcons: Record<string, IconSvgElement> = {
  "Digital First": FlowConnectionIcon,
  "AI Ready": AiBrain02Icon,
  "Analytics Rich": Analytics03Icon,
  "Industry Focused": Target02Icon,
};

/**
 * §7 - The Four Pillars. Minimal band: semantic icon, title, one line.
 */
export default function Pillars() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-pillar]", {
          autoAlpha: 0,
          y: RISE,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.base,
          scrollTrigger: {
            trigger: sectionRef.current,
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
    <section ref={sectionRef} className="bg-paper py-12 md:py-16">
      <div className="mx-auto grid max-w-content gap-10 px-6 md:grid-cols-4 md:px-10">
        {pillars.items.map((pillar) => {
          const icon = pillarIcons[pillar.title];

          return (
            <div key={pillar.title} data-pillar>
              <HugeiconsIcon
                icon={icon}
                className="h-7 w-7 text-blue"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="mt-4 font-medium text-navy">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {pillar.line}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
