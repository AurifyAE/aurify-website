"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";

interface ProductHeroProps {
  name: string;
  category: string;
  role: string;
  highlight: string;
  intro: string;
}

function splitHighlight(text: string, highlight: string) {
  const i = text.indexOf(highlight);
  if (i === -1) return { before: text, match: "", after: "" };
  return {
    before: text.slice(0, i),
    match: highlight,
    after: text.slice(i + highlight.length),
  };
}

/**
 * Product template hero: category eyebrow, masked product name, role line
 * with the gradient keyword, positioning paragraph.
 */
export default function ProductHero({
  name,
  category,
  role,
  highlight,
  intro,
}: ProductHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const roleParts = splitHighlight(role, highlight);

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
          delay: 0.5,
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
          {category}
        </p>
        <AnimatedHeadline
          as="h1"
          text={name}
          mode="load"
          delay={0.1}
          className="mt-4 text-display text-navy"
        />
        <p
          data-ph-rise
          className="mt-6 max-w-3xl text-title-sm font-light text-ink/70"
        >
          {roleParts.before}
          <span className="text-gradient">{roleParts.match}</span>
          {roleParts.after}
        </p>
        <p data-ph-rise className="mt-6 max-w-measure text-body text-ink/60">
          {intro}
        </p>
      </div>
    </header>
  );
}
