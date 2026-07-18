"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { hero } from "@/lib/content/home";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import GradientMesh from "@/components/ui/GradientMesh";

/**
 * §1 — The Statement. Full-viewport white hero: masked headline stagger on
 * load, ambient gradient mesh, signature line + scroll cue pinned at the
 * bottom (cue fades out over the first 240px of scroll).
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cueWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Subline, CTAs and signature rise in after the headline
        gsap.from("[data-hero-rise]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
          delay: 0.7,
        });
        // Signature + cue fade away as scrolling begins
        gsap.to(cueWrapRef.current, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=240",
            scrub: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-24 text-center"
    >
      <GradientMesh />

      <div className="relative flex flex-col items-center">
        <AnimatedHeadline
          as="h1"
          text={hero.headline}
          highlight={hero.highlight}
          mode="load"
          delay={0.15}
          className="max-w-5xl text-display text-navy"
        />
        <p data-hero-rise className="mt-6 max-w-xl text-body text-ink/60 sm:mt-8">
          {hero.subline}
        </p>
        <div
          data-hero-rise
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
        >
          <Button href={hero.ctas.primary.href}>{hero.ctas.primary.label}</Button>
          <Button href={hero.ctas.secondary.href} variant="ghost">
            {hero.ctas.secondary.label}
          </Button>
        </div>
      </div>

      <div ref={cueWrapRef} className="absolute inset-x-0 bottom-8">
        <div data-hero-rise className="flex flex-col items-center gap-4">
          <p className="text-sm tracking-[0.18em] text-ink/60">{site.signature}</p>
          <span
            aria-hidden
            className="block h-8 w-px origin-top animate-cue bg-gradient-brand"
          />
        </div>
      </div>
    </section>
  );
}
