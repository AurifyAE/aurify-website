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

/** Name + category on one line, blurb under - shared by all cards. */
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

/** Corner affordance - the whole card is a link to the product page. */
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

// Counterparty columns - buy-side institutions left, sell-side supply
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

/**
 * Floating counterparty circle on the Bullion Pro network visual. The
 * connector paths end at each node's center so they tuck out of sight
 * underneath it - but the glass finish alone (bg-white/5) is too
 * transparent to actually hide them, so an opaque navy backing sits behind
 * it purely to occlude the line; the translucent ring stays on top for the
 * frosted look.
 */
function NetworkNode({ Icon, delay }: (typeof BUY_SIDE)[number]) {
  return (
    <span
      className={`relative flex h-12 w-12 animate-float items-center justify-center rounded-full motion-reduce:animate-none ${delay}`}
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-navy" />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
      />
      <Icon tone="dark" className="relative h-5 w-5" />
    </span>
  );
}

// Cast-bar silhouette for the Refine X output bar - wider top face,
// tapered base, like a bar fresh out of the mold.
const INGOT = "[clip-path:polygon(0_0,100%_0,88%_100%,12%_100%)]";

/**
 * Vertical bead line for the Refine X pipeline - beads flow downward.
 * Callers pass negative margins so the line ends run under the opaque
 * furnace ring and output bar (both positioned, so they paint on top)
 * instead of butting against their edges.
 */
function FeedLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-8 w-0.5 ${className}`}
      viewBox="0 0 2 32"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="1" y1="0" x2="1" y2="32" strokeWidth={2} strokeDasharray="2 6" className="stroke-sky/30" />
      <line
        x1="1"
        y1="0"
        x2="1"
        y2="32"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 17"
        className="animate-bead-flow stroke-sky motion-reduce:hidden"
      />
    </svg>
  );
}

/**
 * §5 - The Ecosystem. Deep navy moment: four product cards in an
 * asymmetric two-column bento (wide feature column left, supporting column
 * right), converging from the edges toward the center on entry - one
 * connected ecosystem. Each card carries its own live visual: Bullion Pro
 * routes buy- and sell-side counterparties through one glowing trade hub,
 * Refine X feeds raw granules down a bead line through the furnace into a
 * glinting four-nines bar,
 * RMS runs a radar sweep around a control dial with pinging blips, and IQ
 * sits at the center of a slowly turning orbit of the other three products,
 * data beads feeding in from both sides - it powers them, underlined by the
 * teal pulse.
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
          {/* Bullion Pro - large feature card. Counterparty network:
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
              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/25 blur-3xl transition-colors duration-500 group-hover:bg-sky/40" />

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

              {/* trade hub - slow-spinning dashed ring around the core.
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

          {/* Refine X - the refining pipeline top to bottom: raw granules
              feed down a bead line into the furnace, and the refined bar
              comes out below. The line ends tuck under the ring and bar. */}
          <Link
            data-eco-card
            href={`/products/${refineX.slug}`}
            className={`${CARD} flex-row items-center gap-7 p-8 md:col-start-2 md:row-span-2 md:row-start-1`}
          >
            <HoverArrow />
            <div className="flex shrink-0 flex-col items-center gap-1 self-center">
              {/* raw doré granules in */}
              <span className="flex items-end gap-1" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
              </span>
              <FeedLine className="-mb-2" />
              {/* the furnace - heat glow breathing behind the ring */}
              <span className="relative">
                <span
                  aria-hidden
                  className="absolute -inset-2 animate-pulse rounded-full bg-teal/20 blur-xl [animation-duration:4s] motion-reduce:animate-none"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-teal/40 bg-navy shadow-[0_0_24px_rgb(var(--teal)/0.25)]">
                  <RefineryIcon tone="dark" className="h-5 w-5" />
                </span>
              </span>
              <FeedLine className="-mb-2 -mt-2" />
              {/* refined output - the ingot's clip-path also clips the glint
                  streak, so it never escapes the bar */}
              <span
                className={`relative block h-7 w-20 bg-gradient-to-r from-blue via-sky to-teal ${INGOT}`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-6 animate-sheen bg-white/40 blur-sm motion-reduce:hidden"
                />
              </span>
            </div>
            <CardCopy product={refineX} className="pr-6" />
          </Link>

          {/* RMS - control dial with live accent points. */}
          <Link
            data-eco-card
            href={`/products/${rms.slug}`}
            className={`${CARD} flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-8 md:col-start-1 md:row-span-2 md:row-start-5`}
          >
            <HoverArrow />
            <div className="relative h-32 w-32 shrink-0">
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
              {/* radar sweep — a soft conic wedge turning inside the dial */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div
                  aria-hidden
                  className="absolute inset-0 animate-spin-dial bg-[conic-gradient(from_0deg,rgb(var(--sky)/0.25),transparent_75deg)] motion-reduce:hidden"
                />
              </div>
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-navy">
                  <ProductIcon name="risk" tone="dark" className="h-6 w-6" />
                </span>
              </div>
              {/* live blips — the primary contact pings, the others breathe
                  out of phase */}
              <span className="absolute right-1 top-6 h-2 w-2">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-sky/60 [animation-duration:2.8s] motion-reduce:hidden"
                />
                <span className="absolute inset-0 rounded-full bg-sky" />
              </span>
              <span className="absolute bottom-3 left-2 h-1.5 w-1.5 animate-pulse rounded-full bg-teal [animation-delay:1.2s] motion-reduce:animate-none" />
              <span className="absolute -right-1 bottom-10 h-1 w-1 animate-pulse rounded-full bg-sky/60 [animation-delay:2s] motion-reduce:animate-none" />
            </div>
            <CardCopy product={rms} className="pr-6" />
          </Link>

          {/* IQ - the other three products orbit the pulsing IQ tile: it
              powers the rest of the ecosystem. */}
          <Link
            data-eco-card
            href={`/products/${iq.slug}`}
            className={`${CARD} flex-col justify-between gap-6 p-8 md:col-start-2 md:row-span-4 md:row-start-3`}
          >
            <HoverArrow />
            <CardCopy product={iq} className="pr-10" />
            <div className="relative mx-auto flex min-h-[13rem] w-full max-w-[20rem] flex-1 items-center justify-center">
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5" />
              {/* orbital ring — dashed and slowly turning. The spin keyframes
                  own `transform`, so the centering translate lives on the
                  wrapper (same trick as the Bullion Pro hub ring). */}
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2">
                <div className="h-full w-full animate-spin-slow rounded-full border border-dashed border-white/15 motion-reduce:animate-none" />
              </div>
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/20 blur-2xl" />
              {/* connectors — data beads flowing into IQ from both sides,
                  the same order-flow language as the Bullion Pro network.
                  The right line is drawn reversed so its beads also travel
                  toward the center. */}
              {[false, true].map((reversed) => (
                <svg
                  key={String(reversed)}
                  className={`absolute top-1/2 h-0.5 w-12 -translate-y-1/2 ${
                    reversed ? "right-14" : "left-14"
                  }`}
                  viewBox="0 0 48 2"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line
                    x1={reversed ? 48 : 0}
                    y1="1"
                    x2={reversed ? 0 : 48}
                    y2="1"
                    strokeWidth={2}
                    strokeDasharray="2 6"
                    className="stroke-sky/30"
                  />
                  <line
                    x1={reversed ? 48 : 0}
                    y1="1"
                    x2={reversed ? 0 : 48}
                    y2="1"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray="1 17"
                    className="animate-bead-flow stroke-sky motion-reduce:hidden"
                  />
                </svg>
              ))}
              <span className="relative z-10 flex h-20 w-20 animate-iq-pulse items-center justify-center rounded-2xl border border-teal/40 bg-navy shadow-[0_8px_32px_rgb(var(--teal)/0.25)]">
                <ProductIcon name="intelligence" tone="dark" className="h-9 w-9" />
              </span>
              {/* orbit nodes — float like the Bullion Pro counterparties;
                  the positioning translate stays on the wrapper so the float
                  keyframes' transform can't clobber it */}
              <span className="absolute left-0 top-1/2 block h-11 w-11 -translate-y-1/2">
                <span className="flex h-full w-full animate-float items-center justify-center rounded-full border border-white/10 bg-navy motion-reduce:animate-none">
                  <ProductIcon name="trade" tone="dark" className="h-5 w-5 opacity-80" />
                </span>
              </span>
              <span className="absolute right-0 top-1/2 block h-11 w-11 -translate-y-1/2">
                <span className="flex h-full w-full animate-float items-center justify-center rounded-full border border-white/10 bg-navy [animation-delay:2.3s] motion-reduce:animate-none">
                  <ProductIcon name="refine" tone="dark" className="h-5 w-5 opacity-80" />
                </span>
              </span>
              <span className="absolute left-1/2 top-0 block h-11 w-11 -translate-x-1/2">
                <span className="flex h-full w-full animate-float items-center justify-center rounded-full border border-white/10 bg-navy [animation-delay:4.6s] motion-reduce:animate-none">
                  <ProductIcon name="risk" tone="dark" className="h-5 w-5 opacity-80" />
                </span>
              </span>
            </div>
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
