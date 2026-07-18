"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { ProductModule } from "@/lib/content/products";

interface ModuleExplorerProps {
  modules: ProductModule[];
}

/**
 * Apple "tech specs" module explorer. Desktop: module names on the left in
 * natural document flow, a sticky detail panel on the right; the module
 * crossing the viewport center becomes active. Activation toggles data
 * attributes directly on the DOM (a handful of updates at row boundaries —
 * never per frame, never React state); the panel cross-fade is pure CSS.
 * Mobile: the list renders each summary inline — no stickiness.
 */
export default function ModuleExplorer({ modules }: ModuleExplorerProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Width-only condition: the swap is content visibility, not motion,
      // so it must keep working under prefers-reduced-motion.
      mm.add("(min-width: 768px)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(
          "[data-mod-row]",
          sectionRef.current
        );
        const details = gsap.utils.toArray<HTMLElement>(
          "[data-mod-detail]",
          sectionRef.current
        );

        const setActive = (idx: number) => {
          rows.forEach((row, i) => {
            row.dataset.active = String(i === idx);
          });
          details.forEach((detail, i) => {
            detail.dataset.active = String(i === idx);
          });
        };
        setActive(0);

        rows.forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
              if (self.isActive) setActive(i);
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">Modules</h2>

      <div className="mt-10 items-start md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        {/* Module list — summaries inline on mobile only */}
        <ul>
          {modules.map((mod, i) => (
            <li
              key={mod.name}
              data-mod-row
              data-active={i === 0 ? "true" : "false"}
              className="group border-t border-ink/10 py-5"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-light text-ink/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-medium text-ink/60 transition-colors duration-300 group-data-[active=true]:text-navy md:text-lg">
                  {mod.name}
                </h3>
              </div>
              <p className="mt-2 pl-9 text-sm leading-relaxed text-ink/60 md:hidden">
                {mod.summary}
              </p>
            </li>
          ))}
        </ul>

        {/* Sticky detail panel — desktop only */}
        <div className="hidden md:sticky md:top-28 md:block">
          <div className="relative min-h-[24rem] overflow-hidden rounded-2xl bg-paper">
            {modules.map((mod, i) => (
              <div
                key={mod.name}
                data-mod-detail
                data-active={i === 0 ? "true" : "false"}
                className="pointer-events-none absolute inset-0 translate-y-3 p-10 opacity-0 transition-all duration-500 ease-out-expo data-[active=true]:pointer-events-auto data-[active=true]:translate-y-0 data-[active=true]:opacity-100"
              >
                <span className="text-eyebrow uppercase text-ink/60">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(modules.length).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-title-sm text-navy">{mod.name}</h3>
                <p className="mt-4 max-w-md text-body text-ink/60">{mod.summary}</p>
                <span
                  className="mt-8 block h-0.5 w-10 bg-gradient-brand"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
