"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { eInvoicingFlow } from "@/lib/content/e-invoicing";
import SectionHeading from "@/components/ui/SectionHeading";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

/**
 * Transact → Record as a navy band. On desktop a bead line runs through the
 * five numbered nodes (the same dashed-bead device as the ecosystem
 * visuals), drawing in left to right as the steps land; on mobile the steps
 * stack along a vertical rail.
 */
export default function ConnectedInvoiceFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useNavbarDarkZone(sectionRef);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: trackRef.current, start: "top 75%", once: true },
        });
        tl.from("[data-flow-rail]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: DURATION.slow * 1.5,
          ease: EASE.inOut,
        }).from(
          "[data-flow-step]",
          {
            autoAlpha: 0,
            y: 32,
            duration: DURATION.base,
            ease: EASE.out,
            stagger: STAGGER.loose,
          },
          0.1
        );
        gsap.from("[data-flow-closing]", {
          autoAlpha: 0,
          y: 16,
          duration: DURATION.base,
          scrollTrigger: { trigger: "[data-flow-closing]", start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="invoice-flow"
      className="relative scroll-mt-20 overflow-hidden bg-navy py-section text-white"
    >
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          tone="dark"
          eyebrow={eInvoicingFlow.eyebrow}
          title={eInvoicingFlow.title}
        />

        <div ref={trackRef} className="relative mt-16">
          {/* Desktop rail through the node centres */}
          <div aria-hidden className="pointer-events-none absolute left-6 right-6 top-6 hidden md:block">
            <svg data-flow-rail className="h-0.5 w-full" viewBox="0 0 100 2" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100" y2="1" strokeWidth={2} strokeDasharray="2 6" vectorEffect="non-scaling-stroke" className="stroke-sky/30" />
              <line
                x1="0"
                y1="1"
                x2="100"
                y2="1"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="1 17"
                vectorEffect="non-scaling-stroke"
                className="animate-bead-flow stroke-sky motion-reduce:hidden"
              />
            </svg>
          </div>
          {/* Mobile rail */}
          <div aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-white/10 md:hidden" />

          <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6">
            {eInvoicingFlow.steps.map((item, i) => (
              <li data-flow-step key={item.step} className="relative flex gap-6 md:flex-col md:gap-0">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-navy text-sm font-medium text-sky">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-white/5" />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="md:mt-6">
                  <h3 className="text-title-sm text-white">{item.step}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p
          data-flow-closing
          className="mt-20 border-t border-white/10 pt-10 text-title-sm font-light text-white"
        >
          {eInvoicingFlow.closing}
        </p>
      </div>
    </section>
  );
}
