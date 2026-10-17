"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { eInvoicingHero } from "@/lib/content/e-invoicing";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import Button from "@/components/ui/Button";
import GradientMesh from "@/components/ui/GradientMesh";

const { dashboard } = eInvoicingHero;

/**
 * E-Invoicing hero: copy (eyebrow, masked headline with gradient highlight,
 * subline, intro, CTA pair) above a screenshot of the E-Invoice dashboard.
 */
export default function EInvoicingHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-ei-rise]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
          delay: 0.45,
        });
        gsap.from("[data-inv-card]", {
          autoAlpha: 0,
          y: 40,
          duration: DURATION.slow,
          ease: EASE.expo,
          delay: 0.6,
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} className="relative overflow-hidden px-6 pb-24 pt-40 md:px-10">
      <GradientMesh variant="light" />
      {/* The dashboard screenshot is wide (~2.3:1), so it is drawn wider
          than its column and runs off the right edge (the header clips it):
          large enough to read, and the cut edge implies more product. */}
      <div className="relative mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <p data-ei-rise className="text-eyebrow uppercase text-blue">
            {eInvoicingHero.eyebrow}
          </p>
          <AnimatedHeadline
            as="h1"
            text={eInvoicingHero.headline}
            highlight={eInvoicingHero.highlight}
            mode="load"
            delay={0.1}
            className="mt-4 text-title text-navy"
          />
          <p data-ei-rise className="mt-6 max-w-xl text-title-sm font-light text-ink/70">
            {eInvoicingHero.subline}
          </p>
          <p data-ei-rise className="mt-6 max-w-measure text-body text-ink/60">
            {eInvoicingHero.intro}
          </p>
          <div data-ei-rise className="mt-8 flex flex-wrap gap-3">
            <Button href={eInvoicingHero.cta.href}>{eInvoicingHero.cta.label}</Button>
            <Button href={eInvoicingHero.secondary.href} variant="ghost" newTab>
              {eInvoicingHero.secondary.label}
            </Button>
          </div>
        </div>

        <div
          data-inv-card
          className="w-[44rem] max-w-none rounded-2xl border border-ink/10 bg-white/80 p-1.5 shadow-[0_28px_80px_rgb(14_26_57_/_0.12)] backdrop-blur-sm md:p-2 lg:w-[60rem]"
        >
          <Image
            src={dashboard.src}
            alt={dashboard.alt}
            width={dashboard.width}
            height={dashboard.height}
            sizes="(min-width: 1024px) 960px, 704px"
            // Dashboard UI with small type: q75 visibly softens it.
            quality={90}
            priority
            className="h-auto w-full rounded-xl"
          />
        </div>
      </div>
    </header>
  );
}
