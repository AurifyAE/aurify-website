"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { eInvoicingHero } from "@/lib/content/e-invoicing";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";
import Button from "@/components/ui/Button";
import GradientMesh from "@/components/ui/GradientMesh";

const { sample } = eInvoicingHero;

/**
 * Hero visual: a structured, metal-aware invoice record rather than a
 * picture of a PDF - the page's whole argument in one card. Fields fill in
 * row by row on load, then the validation stamp and linked records land.
 */
function InvoiceRecord() {
  return (
    <div
      data-inv-card
      className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-[0_28px_80px_rgb(14_26_57_/_0.12)] backdrop-blur-sm md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow uppercase text-ink/60">{sample.label}</p>
          <p className="mt-2 font-medium text-navy">{sample.number}</p>
        </div>
        <span className="rounded-full border border-blue/20 bg-blue/5 px-3 py-1 text-xs font-medium text-blue">
          {sample.format}
        </span>
      </div>

      <dl className="mt-6 divide-y divide-ink/5 border-y border-ink/10">
        {sample.lines.map((line) => (
          <div
            data-inv-line
            key={line.label}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <dt className="text-ink/60">{line.label}</dt>
            <dd className="font-medium text-navy">{line.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <HugeiconsIcon
          icon={Link01Icon}
          className="h-4 w-4 text-ink/40"
          strokeWidth={1.8}
          aria-hidden
        />
        {sample.linked.map((record) => (
          <span
            data-inv-link
            key={record}
            className="rounded-full bg-mist px-3 py-1 text-xs text-ink/70"
          >
            {record}
          </span>
        ))}
      </div>

      <div
        data-inv-stamp
        className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-full bg-teal px-3.5 py-1.5 text-xs font-medium text-white shadow-lg md:-right-5"
      >
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="h-4 w-4"
          strokeWidth={2}
          aria-hidden
        />
        {sample.status}
      </div>
    </div>
  );
}

/**
 * E-Invoicing hero: copy column (eyebrow, masked headline with gradient
 * highlight, subline, intro, CTA pair) beside the invoice-record visual.
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
        gsap
          .timeline({ delay: 0.6 })
          .from("[data-inv-card]", {
            autoAlpha: 0,
            y: 40,
            duration: DURATION.slow,
            ease: EASE.expo,
          })
          .from(
            "[data-inv-line]",
            { autoAlpha: 0, x: -12, duration: DURATION.fast, ease: EASE.out, stagger: STAGGER.base },
            "-=0.7"
          )
          .from(
            "[data-inv-link]",
            { autoAlpha: 0, y: 8, duration: DURATION.fast, ease: EASE.out, stagger: STAGGER.tight },
            "-=0.2"
          )
          .from(
            "[data-inv-stamp]",
            { autoAlpha: 0, scale: 0.6, duration: DURATION.fast, ease: "back.out(2)" },
            "-=0.1"
          );
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} className="relative overflow-hidden px-6 pb-24 pt-40 md:px-10">
      <GradientMesh variant="light" />
      <div className="relative mx-auto grid max-w-content items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
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
            <Button href={eInvoicingHero.secondary.href} variant="ghost">
              {eInvoicingHero.secondary.label}
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <InvoiceRecord />
        </div>
      </div>
    </header>
  );
}
