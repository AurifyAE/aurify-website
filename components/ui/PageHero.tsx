"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";

interface PageHeroProps {
  eyebrow: string;
  headline: string;
  highlight?: string;
  subline?: string;
}

/**
 * Interior-page hero (about / services / contact): eyebrow, masked headline
 * with optional gradient highlight, subline rising in behind it.
 */
export default function PageHero({
  eyebrow,
  headline,
  highlight,
  subline,
}: PageHeroProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-ph-rise]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
          delay: 0.45,
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} className="px-6 pt-40 md:px-10">
      <div className="mx-auto max-w-content">
        <p data-ph-rise className="text-eyebrow uppercase text-blue">
          {eyebrow}
        </p>
        <AnimatedHeadline
          as="h1"
          text={headline}
          highlight={highlight}
          mode="load"
          delay={0.1}
          className="mt-4 max-w-4xl text-title text-navy"
        />
        {subline && (
          <p data-ph-rise className="mt-6 max-w-measure text-body text-ink/60">
            {subline}
          </p>
        )}
      </div>
    </header>
  );
}
