"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { connectClosing } from "@/lib/content/connect";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import GradientMesh from "@/components/ui/GradientMesh";
import Button from "@/components/ui/Button";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

/**
 * Final navy full-viewport moment, modeled on home's ClosingCta.
 */
export default function ConnectClosingCta() {
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
      className="relative mt-28 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-navy px-6 py-section text-center text-white"
    >
      <GradientMesh variant="dark" />

      <div className="relative flex flex-col items-center">
        <AnimatedHeadline
          as="h2"
          text={connectClosing.headline}
          mode="scroll"
          className="max-w-3xl text-title text-white"
        />
        <p data-cta-rise className="mt-6 max-w-xl text-body text-white/60">
          {connectClosing.subline}
        </p>
        <div data-cta-rise className="mt-10">
          <Button href={connectClosing.cta.href} variant="light">
            {connectClosing.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
