"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { closingCta } from "@/lib/content/home";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import GradientMesh from "@/components/ui/GradientMesh";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

const ContactForm = dynamic(() => import("@/components/contact/ContactForm"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Loading demo form"
      className="mt-6 space-y-4 animate-pulse"
    >
      <div className="grid gap-5 min-[520px]:grid-cols-2">
        <div className="h-12 border-b border-navy/20 bg-white/10" />
        <div className="h-12 border-b border-navy/20 bg-white/10" />
      </div>
      <div className="h-12 border-b border-navy/20 bg-white/10" />
      <div className="h-12 rounded-full bg-navy/15" />
    </div>
  ),
});

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
      className="relative flex min-h-[85svh] flex-col items-center justify-center overflow-hidden bg-navy px-6 py-section text-white"
    >
      <GradientMesh variant="dark" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-20">
        <div className="max-w-[38rem] lg:pr-4">
          <AnimatedHeadline
            as="h2"
            text={closingCta.headline}
            mode="scroll"
            className="max-w-[14ch] text-balance text-title text-white"
          />
          <div data-cta-rise className="mt-8 flex max-w-[34rem] items-stretch gap-5">
            <span className="w-0.5 shrink-0 bg-sky" aria-hidden />
            <p className="text-body text-white/70">{closingCta.subline}</p>
          </div>
        </div>

        <div
          data-cta-rise
          className="rounded-2xl border border-white/20 bg-ink/15 p-6 text-white shadow-[0_24px_70px_rgb(7_18_48_/_0.22)] sm:p-8"
        >
          <h3 className="max-w-sm text-title-sm text-white">
            Start with the essentials.
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            No long questionnaire. Share three details and our team will arrange the demo.
          </p>
          <ContactForm
            idPrefix="homepage-demo"
            title={null}
            submitLabel="Book a Demo"
            className="mt-7"
            compact
            short
            appearance="closing"
          />
        </div>
      </div>
    </section>
  );
}
