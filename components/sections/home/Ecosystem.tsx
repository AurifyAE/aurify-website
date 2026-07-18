"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { ecosystem } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";
import { ProductIcon, ArrowRightIcon, type ProductIconName } from "@/components/icons";

/**
 * §5 — The Ecosystem. Deep navy moment: four glass product cards converge
 * from the edges toward the center on entry — one connected ecosystem.
 * The IQ card carries a slow teal pulse (it powers the others).
 */
export default function Ecosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-eco-card]", {
          autoAlpha: 0,
          x: (i) => (i % 2 === 0 ? -64 : 64),
          y: (i) => (i < 2 ? -40 : 40),
          duration: DURATION.slow,
          ease: EASE.expo,
          stagger: STAGGER.tight,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 75%",
            once: true,
          },
        });
        gsap.from("[data-eco-closing]", {
          autoAlpha: 0,
          duration: DURATION.base,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "bottom 80%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="overflow-hidden bg-navy py-section text-white">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          tone="dark"
          eyebrow={ecosystem.eyebrow}
          title={ecosystem.title}
          body={ecosystem.body}
        />

        <div ref={gridRef} className="mt-16 grid gap-6 md:grid-cols-2">
          {ecosystem.products.map((product) => (
            <Link
              key={product.slug}
              data-eco-card
              href={`/products/${product.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors duration-300 hover:border-white/25"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 ${
                  "pulse" in product && product.pulse ? "animate-iq-pulse" : ""
                }`}
              >
                <ProductIcon
                  name={product.icon as ProductIconName}
                  className="h-6 w-6 text-sky"
                />
              </span>
              <div className="mt-6 flex items-baseline gap-3">
                <h3 className="text-title-sm text-white">{product.name}</h3>
                <span className="text-eyebrow uppercase text-white/60">
                  {product.category}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {product.blurb}
              </p>
              <ArrowRightIcon className="mt-6 h-5 w-5 text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </div>

        <p
          data-eco-closing
          className="mt-16 text-center text-sm tracking-[0.18em] text-white/60"
        >
          {ecosystem.closing}
        </p>
      </div>
    </section>
  );
}
