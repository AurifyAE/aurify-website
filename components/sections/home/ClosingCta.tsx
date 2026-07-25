"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { closingCta } from "@/lib/content/home";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import GradientMesh from "@/components/ui/GradientMesh";
import Button from "@/components/ui/Button";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

/**
 * §9 - The Road Ahead. Final navy full-viewport moment: the gradient mesh
 * from the hero returns and the loop closes. Footer follows.
 */
export default function ClosingCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useNavbarDarkZone(sectionRef);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-cta-rise]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
          delay: 0.4,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
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
      className="relative flex min-h-[85svh] flex-col items-center justify-center overflow-hidden bg-navy px-6 py-section text-center text-white"
    >
      <GradientMesh variant="dark" />

      <div className="relative flex flex-col items-center">
        <AnimatedHeadline
          as="h2"
          text={closingCta.headline}
          mode="scroll"
          className="max-w-3xl text-title text-white"
        />
        <p data-cta-rise className="mt-6 max-w-xl text-body text-white/60">
          {closingCta.subline}
        </p>
        <div data-cta-rise className="mt-10">
          <Button href={closingCta.cta.href} variant="light">
            {closingCta.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
