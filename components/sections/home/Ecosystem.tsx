"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";
import { ecosystem } from "@/lib/content/home";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  ProductIcon,
  ArrowUpRightIcon,
  BankIcon,
  FundIcon,
  GlobeDeskIcon,
  RefineryIcon,
  IngotsIcon,
  VaultIcon,
  ICON_GRADIENT_DARK_ID,
} from "@/components/icons";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

// Content order is fixed in lib/content/home.ts: Bullion Pro, Refine X,
// RMS, IQ. Each product gets a purpose-built card in the bento below, so
// they are addressed by name rather than mapped generically.
const [bullionPro, refineX, rms, iq] = ecosystem.products;

// Shared shell for all four cards; each card adds its own bento placement
// and interior layout.
const CARD =
  "group relative flex overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-300 hover:border-white/25";

type Product = (typeof ecosystem.products)[number];

/** Name + category on one line, blurb under — shared by all cards. */
function CardCopy({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-title-sm text-white">{product.name}</h3>
        <span className="text-eyebrow uppercase text-white/50">{product.category}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{product.blurb}</p>
    </div>
  );
}

/** Corner affordance — the whole card is a link to the product page. */
function HoverArrow() {
  return (
    <ArrowUpRightIcon
      tone="dark"
      className="absolute right-6 top-6 z-10 h-5 w-5 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
    />
  );
}

// Connector curves for the Bullion Pro network visual, in a 600×280 space
// stretched to fill the stage (preserveAspectRatio="none"). Every path runs
// node → hub so the animated dash offset carries the beads inward. Endpoints
// hide under the node and hub circles, which absorbs the small drift between
// the SVG's stretched space and the rem-positioned nodes. The mid paths
// carry a slight bend: a perfectly straight horizontal path has a
// zero-height bounding box, and objectBoundingBox gradients vanish on those.
const NETWORK_PATHS = [
  "M30 28 C150 28, 170 140, 300 140",
  "M30 140 C120 130, 200 140, 300 140",
  "M30 252 C150 252, 170 140, 300 140",
  "M570 28 C450 28, 430 140, 300 140",
  "M570 140 C480 130, 400 140, 300 140",
  "M570 252 C450 252, 430 140, 300 140",
];

// Counterparty columns — buy-side institutions left, sell-side supply
// right. Staggered delays keep the floating nodes out of phase.
const BUY_SIDE = [
  { Icon: BankIcon, delay: "" },
  { Icon: FundIcon, delay: "[animation-delay:2.3s]" },
  { Icon: GlobeDeskIcon, delay: "[animation-delay:4.6s]" },
];
const SELL_SIDE = [
  { Icon: RefineryIcon, delay: "[animation-delay:1.1s]" },
  { Icon: IngotsIcon, delay: "[animation-delay:3.4s]" },
  { Icon: VaultIcon, delay: "[animation-delay:5.7s]" },
];

/** Floating counterparty circle on the Bullion Pro network visual. */
function NetworkNode({ Icon, delay }: (typeof BUY_SIDE)[number]) {
  return (
    <span
      className={`flex h-12 w-12 animate-float items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm motion-reduce:animate-none ${delay}`}
    >
      <Icon tone="dark" className="h-5 w-5" />
    </span>
  );
}

/** Gradient pill used on the Refine X and RMS visuals. */
function BadgePill({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-white shadow-[0_0_16px_rgb(var(--sky)/0.35)] ${className}`}
    >
      {label}
    </span>
  );
}

/**
 * §5 — The Ecosystem. Deep navy moment: four product cards in an
 * asymmetric two-column bento (wide feature column left, supporting column
 * right), converging from the edges toward the center on entry — one
 * connected ecosystem. Each card carries its own visual: Bullion Pro
 * routes buy- and sell-side counterparties through one glowing trade hub,
 * Refine X climbs a purity bar, RMS watches a control dial, and IQ sits at
 * the center of an orbit of the other three products — it powers them,
 * underlined by the teal pulse.
 */
export default function Ecosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useNavbarDarkZone(sectionRef);

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

        {/* Asymmetric bento: 6 implicit rows; the left column splits 4/2,
            the right column 2/4, so the seams intentionally misalign. */}
        <div
          ref={gridRef}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-[4fr_3fr] md:auto-rows-[7rem]"
        >
          {/* Bullion Pro — large feature card. Counterparty network:
              buy-side institutions left, sell-side supply right, curved
              gradient connectors carrying animated order-flow beads into
              the glowing trade hub, over a faded dot grid. */}
          <Link
            data-eco-card
            href={`/products/${bullionPro.slug}`}
            className={`${CARD} flex-col p-8 md:col-start-1 md:row-span-4 md:row-start-1`}
          >
            <HoverArrow />
            <CardCopy product={bullionPro} className="max-w-measure pr-10" />
            <div className="relative mt-8 min-h-[14rem] flex-1">
              {/* dot grid, masked so it fades toward the edges */}
              <div className="absolute inset-0 bg-[radial-gradient(rgb(var(--sky)/0.16)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,rgb(var(--ink))_25%,transparent_75%)]" />
              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/25 blur-3xl" />

              {/* connector curves + order-flow beads */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 600 280"
                preserveAspectRatio="none"
                aria-hidden
              >
                {NETWORK_PATHS.map((d) => (
                  <path
                    key={d}
                    d={d}
                    fill="none"
                    strokeWidth={1.5}
                    stroke={`url(#${ICON_GRADIENT_DARK_ID})`}
                    className="opacity-40"
                  />
                ))}
                {NETWORK_PATHS.map((d) => (
                  <path
                    key={`flow-${d}`}
                    d={d}
                    fill="none"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray="1 17"
                    className="animate-bead-flow stroke-sky motion-reduce:hidden"
                  />
                ))}
              </svg>

              {/* counterparty nodes */}
              <div className="absolute inset-y-0 left-0 flex w-12 flex-col justify-between">
                {BUY_SIDE.map((node, i) => (
                  <NetworkNode key={i} {...node} />
                ))}
              </div>
              <div className="absolute inset-y-0 right-0 flex w-12 flex-col justify-between">
                {SELL_SIDE.map((node, i) => (
                  <NetworkNode key={i} {...node} />
                ))}
              </div>

              {/* trade hub — slow-spinning dashed ring around the core.
                  The spin keyframes own `transform`, so the centering
                  translate lives on a wrapper. */}
              <span className="absolute left-1/2 top-1/2 block h-24 w-24 -translate-x-1/2 -translate-y-1/2">
                <span className="block h-full w-full animate-spin-slow rounded-full border border-dashed border-sky/40 motion-reduce:animate-none" />
              </span>
              <span className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-sky/50 bg-navy shadow-[0_0_32px_rgb(var(--sky)/0.45)] transition-colors duration-300 group-hover:border-sky/80">
                <ProductIcon name="trade" tone="dark" className="h-6 w-6" />
              </span>
            </div>
            {(bullionPro.buySideLabel || bullionPro.sellSideLabel) && (
              <div className="mt-4 flex justify-between text-eyebrow uppercase text-white/40">
                <span>{bullionPro.buySideLabel}</span>
                <span>{bullionPro.sellSideLabel}</span>
              </div>
            )}
          </Link>

          {/* Refine X — purity bars climbing to four-nines fine. */}
          <Link
            data-eco-card
            href={`/products/${refineX.slug}`}
            className={`${CARD} flex-row items-center gap-7 p-8 md:col-start-2 md:row-span-2 md:row-start-1`}
          >
            <HoverArrow />
            <div className="relative shrink-0 self-center pt-9">
              {refineX.badge && (
                <BadgePill label={refineX.badge} className="absolute left-8 top-0 -translate-x-1/2" />
              )}
              <div className="flex items-end gap-2">
                <span className="h-12 w-4 rounded-full bg-white/10" />
                <span className="h-24 w-4 rounded-full bg-gradient-to-t from-blue via-sky to-teal shadow-[0_0_20px_rgb(var(--sky)/0.4)]" />
                <span className="h-16 w-4 rounded-full bg-white/10" />
                <span className="h-20 w-4 rounded-full bg-white/10" />
              </div>
            </div>
            <CardCopy product={refineX} className="pr-6" />
          </Link>

          {/* RMS — control dial with live accent points. */}
          <Link
            data-eco-card
            href={`/products/${rms.slug}`}
            className={`${CARD} flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-8 md:col-start-1 md:row-span-2 md:row-start-5`}
          >
            <HoverArrow />
            <div className="relative h-32 w-32 shrink-0">
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-navy">
                  <ProductIcon name="risk" tone="dark" className="h-6 w-6" />
                </span>
              </div>
              {rms.badge && (
                <BadgePill label={rms.badge} className="absolute -left-3 top-0" />
              )}
              <span className="absolute right-1 top-6 h-2 w-2 rounded-full bg-sky" />
              <span className="absolute bottom-3 left-2 h-1.5 w-1.5 rounded-full bg-teal" />
              <span className="absolute -right-1 bottom-10 h-1 w-1 rounded-full bg-sky/60" />
            </div>
            <CardCopy product={rms} className="pr-6" />
          </Link>

          {/* IQ — the other three products orbit the pulsing IQ tile: it
              powers the rest of the ecosystem. */}
          <Link
            data-eco-card
            href={`/products/${iq.slug}`}
            className={`${CARD} flex-col justify-between gap-6 p-8 md:col-start-2 md:row-span-4 md:row-start-3`}
          >
            <HoverArrow />
            <div className="relative mx-auto flex min-h-[13rem] w-full max-w-[20rem] flex-1 items-center justify-center">
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5" />
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/20 blur-2xl" />
              <span className="absolute left-14 top-1/2 w-12 border-t border-dashed border-sky/30" />
              <span className="absolute right-14 top-1/2 w-12 border-t border-dashed border-sky/30" />
              <span className="relative z-10 flex h-20 w-20 animate-iq-pulse items-center justify-center rounded-2xl border border-teal/40 bg-navy shadow-[0_8px_32px_rgb(var(--teal)/0.25)]">
                <ProductIcon name="intelligence" tone="dark" className="h-9 w-9" />
              </span>
              <span className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-navy">
                <ProductIcon name="trade" tone="dark" className="h-5 w-5 opacity-80" />
              </span>
              <span className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-navy">
                <ProductIcon name="refine" tone="dark" className="h-5 w-5 opacity-80" />
              </span>
              <span className="absolute left-1/2 top-0 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-navy">
                <ProductIcon name="risk" tone="dark" className="h-5 w-5 opacity-80" />
              </span>
            </div>
            <CardCopy product={iq} />
          </Link>
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
