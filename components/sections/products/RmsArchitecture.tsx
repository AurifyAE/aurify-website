"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK } from "@/lib/animation";
import type { Product } from "@/lib/content/products";
import SectionHeading from "@/components/ui/SectionHeading";

interface RmsArchitectureProps {
  architecture: NonNullable<Product["architecture"]>;
}

/**
 * RMS three-layer architecture diagram. On entry, the Unified Risk Data
 * Layer base settles first, then the layers stack onto it bottom-up —
 * Financial Risk Core, Control & Systemic, Intelligence on top.
 */
export default function RmsArchitecture({ architecture }: RmsArchitectureProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const layers = gsap.utils.toArray<HTMLElement>(
          "[data-arch-layer]",
          stackRef.current
        );
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stackRef.current,
            start: "top 75%",
            once: true,
          },
        });
        tl.from(baseRef.current, {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.fast,
          ease: EASE.out,
        });
        // DOM renders top-down (Intelligence first); animate bottom-up
        [...layers].reverse().forEach((layer) => {
          tl.from(
            layer,
            { autoAlpha: 0, y: 40, duration: DURATION.fast, ease: EASE.out },
            "-=0.2"
          );
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Visual stack: Intelligence on top, Financial Risk Core on the base
  const topDown = [...architecture.layers].reverse();

  return (
    <section ref={sectionRef} className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <SectionHeading eyebrow="Architecture" title={architecture.title} />

      <div ref={stackRef} className="mx-auto mt-14 max-w-3xl">
        <div className="space-y-3">
          {topDown.map((layer, idx) => (
            <div
              key={layer.name}
              data-arch-layer
              className="rounded-xl border border-ink/10 bg-white p-6 md:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-navy">{layer.name}</h3>
                <span className="text-xs uppercase tracking-[0.12em] text-ink/60">
                  Layer {architecture.layers.length - idx}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {layer.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {layer.modules.map((mod) => (
                  <span
                    key={mod}
                    className="rounded-full bg-paper px-3 py-1 text-xs text-ink/60"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div
            ref={baseRef}
            className="rounded-xl bg-navy p-5 text-center text-sm font-medium text-white"
          >
            {architecture.base}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink/60">{architecture.note}</p>
      </div>
    </section>
  );
}
