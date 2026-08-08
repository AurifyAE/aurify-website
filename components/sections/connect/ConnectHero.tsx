"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { connectHero } from "@/lib/content/connect";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import Button from "@/components/ui/Button";

/**
 * Aurify Connect hero: two-part eyebrow (module + platform badge), masked
 * "Connect" headline, tagline, intro paragraph, and the Book a Demo / Request
 * a Demo CTA pair. Modeled on ProductHero, with an added button row.
 */
export default function ConnectHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-ch-rise]", {
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
        <p data-ch-rise className="text-eyebrow uppercase text-blue">
          {connectHero.eyebrow}
        </p>
        <AnimatedHeadline
          as="h1"
          text={connectHero.title}
          mode="load"
          delay={0.1}
          className="mt-4 text-display text-navy"
        />
        <p data-ch-rise className="mt-6 max-w-3xl text-title-sm font-light text-ink/70">
          {connectHero.subtitle}
        </p>
        <p data-ch-rise className="mt-6 max-w-measure text-body text-ink/60">
          {connectHero.intro}
        </p>
        <div data-ch-rise className="mt-8">
          <Button href={connectHero.cta.href}>{connectHero.cta.label}</Button>
        </div>
      </div>
    </header>
  );
}
