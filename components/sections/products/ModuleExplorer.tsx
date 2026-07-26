import type { CSSProperties } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  UserGroupIcon,
  FingerPrintCheckIcon,
  Certificate01Icon,
  Exchange01Icon,
  Exchange02Icon,
  Target02Icon,
  BankIcon,
  SafeBoxIcon,
  Calculator01Icon,
  Chart01Icon,
  BrainCircuitIcon,
  IdCardLanyardIcon,
  TruckIcon,
  BeakerIcon,
  Factory01Icon,
  Calendar01Icon,
  MicroscopeIcon,
  Recycle01Icon,
  Leaf01Icon,
  ChartBarBigIcon,
  CreditCardIcon,
  DropletIcon,
  Package01Icon,
  Settings01Icon,
  DocumentValidationIcon,
  ServerStack01Icon,
  PieChart01Icon,
  Robot01Icon,
  Tornado01Icon,
  Grid2X2Icon,
} from "@hugeicons/core-free-icons";
import Reveal from "@/components/ui/Reveal";
import BentoTile from "@/components/ui/BentoTile";
import type { ProductModule } from "@/lib/content/products";

interface ModuleExplorerProps {
  modules: ProductModule[];
}

/** Keyed by the exact module name strings in lib/content/products.ts. */
const MODULE_ICONS: Record<string, IconSvgElement> = {
  CRM: UserGroupIcon,
  "KYC & Onboarding": FingerPrintCheckIcon,
  "Compliance Manager": Certificate01Icon,
  "Dealing Desk": Exchange02Icon,
  "Fixing Desk": Target02Icon,
  "Treasury Management": BankIcon,
  "Vault Management": SafeBoxIcon,
  "Finance (IFRS)": Calculator01Icon,
  Reports: Chart01Icon,
  "Analytics & AI": BrainCircuitIcon,
  "CRM & KYC Onboarding": IdCardLanyardIcon,
  "Logistics & Intake": TruckIcon,
  "Acceptance Engine": BeakerIcon,
  "Refinery Processing": Factory01Icon,
  "Production Planning": Calendar01Icon,
  "Laboratory Management": MicroscopeIcon,
  "Recovery Tracking": Recycle01Icon,
  "Trade & Vault": Exchange01Icon,
  Treasury: BankIcon,
  "Traceability & ESG": Leaf01Icon,
  "Market Risk": ChartBarBigIcon,
  "Credit Risk": CreditCardIcon,
  "Liquidity Risk": DropletIcon,
  "Inventory Risk": Package01Icon,
  "Operational Risk": Settings01Icon,
  "Compliance Risk": DocumentValidationIcon,
  "Logistics Risk": TruckIcon,
  "Infrastructure Risk": ServerStack01Icon,
  Analytics: PieChart01Icon,
  "AI Engine": Robot01Icon,
  "Stress & Scenario Engine": Tornado01Icon,
};

type Tone = "dark" | "tinted" | "plain";
type Size = "hero" | "tall" | "wide" | "small";

interface Tile {
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
  tone: Tone;
  size: Size;
  /**
   * Span at the 2-column (sm) breakpoint. Chosen per tile so the natural DOM
   * flow tiles sm perfectly - 1-spans only ever appear as adjacent pairs - and
   * reading order (and the visible numbering) stays sequential without
   * grid-flow-dense reshuffling cards.
   */
  smSpan: 1 | 2;
}

/**
 * Bento layout for a 4-column grid. Full portion is tiled by two hand-designed
 * blocks that each perfectly cover a 4×2 rectangle - Block A anchors a 2×2 hero
 * on the left, Block B stands a 1×2 tall card on the right - alternating so the
 * mosaic never repeats the same row shape twice. The 0–3 leftover cards fill one
 * final row summing to exactly 4 columns. Because every tile is placed by
 * explicit grid line, coverage is exact: no empty cells, for any module count.
 */
function buildLayout(n: number): Tile[] {
  const tiles: Tile[] = [];
  let i = 0;
  let row = 1;
  let useA = true;

  while (n - i >= 4) {
    if (useA || n - i < 5) {
      // Block A - 2×2 hero + wide + two small (4 cards). The smalls are DOM
      // neighbours, so at sm they sit side by side as a pair.
      tiles.push({ col: 1, colSpan: 2, row, rowSpan: 2, tone: "dark", size: "hero", smSpan: 2 });
      tiles.push({ col: 3, colSpan: 2, row, rowSpan: 1, tone: "tinted", size: "wide", smSpan: 2 });
      tiles.push({ col: 3, colSpan: 1, row: row + 1, rowSpan: 1, tone: "plain", size: "small", smSpan: 1 });
      tiles.push({ col: 4, colSpan: 1, row: row + 1, rowSpan: 1, tone: "plain", size: "small", smSpan: 1 });
      i += 4;
    } else {
      // Block B - wide + small + tall + small + wide (5 cards). The tall card
      // separates the smalls in DOM order, so at sm they become full-width
      // bands rather than leaving a one-column hole beside each.
      tiles.push({ col: 1, colSpan: 2, row, rowSpan: 1, tone: "tinted", size: "wide", smSpan: 2 });
      tiles.push({ col: 3, colSpan: 1, row, rowSpan: 1, tone: "plain", size: "small", smSpan: 2 });
      tiles.push({ col: 4, colSpan: 1, row, rowSpan: 2, tone: "dark", size: "tall", smSpan: 2 });
      tiles.push({ col: 1, colSpan: 1, row: row + 1, rowSpan: 1, tone: "plain", size: "small", smSpan: 2 });
      tiles.push({ col: 2, colSpan: 2, row: row + 1, rowSpan: 1, tone: "tinted", size: "wide", smSpan: 2 });
      i += 5;
    }
    row += 2;
    useA = !useA;
  }

  // Tail - 0..3 leftover cards, one row that sums to 4 columns.
  const r = n - i;
  if (r === 1) {
    tiles.push({ col: 1, colSpan: 4, row, rowSpan: 1, tone: "dark", size: "wide", smSpan: 2 });
  } else if (r === 2) {
    tiles.push({ col: 1, colSpan: 2, row, rowSpan: 1, tone: "dark", size: "wide", smSpan: 2 });
    tiles.push({ col: 3, colSpan: 2, row, rowSpan: 1, tone: "tinted", size: "wide", smSpan: 2 });
  } else if (r === 3) {
    tiles.push({ col: 1, colSpan: 2, row, rowSpan: 1, tone: "dark", size: "wide", smSpan: 2 });
    tiles.push({ col: 3, colSpan: 1, row, rowSpan: 1, tone: "tinted", size: "small", smSpan: 1 });
    tiles.push({ col: 4, colSpan: 1, row, rowSpan: 1, tone: "plain", size: "small", smSpan: 1 });
  }

  return tiles;
}

const CARD_BASE =
  "group relative flex flex-col overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1";

const TONE_CARD: Record<Tone, string> = {
  dark: "bg-navy ring-1 ring-inset ring-white/10 hover:shadow-2xl hover:shadow-navy/30",
  tinted:
    "bg-mist ring-1 ring-inset ring-navy/[0.08] hover:ring-navy/[0.16] hover:shadow-xl hover:shadow-navy/10",
  plain:
    "bg-white ring-1 ring-inset ring-ink/10 hover:ring-navy/25 hover:shadow-xl hover:shadow-navy/10",
};

const TONE_BADGE: Record<Tone, string> = {
  dark: "bg-white/10 text-white ring-1 ring-inset ring-white/15",
  tinted: "bg-white text-navy ring-1 ring-inset ring-navy/10",
  plain: "bg-mist/70 text-navy ring-1 ring-inset ring-navy/10",
};

/**
 * Instrument-dial backdrop for feature tiles - three engraved hairline rings
 * around the module's icon plus a slowly counter-rotating tick bezel (48
 * graduations via the dash trick: stroke width is the tick height, dash
 * length its width; r=174 circumference 1093.27 / 48 = 22.78 period).
 * Echoes the homepage hero's precision-dial language so the site reads as
 * one system, and turns the feature tiles' open zones into owned
 * composition instead of leftover space. Transform-only rotation, frozen
 * under reduced motion.
 */
function DialMotif({
  icon,
  dark,
  className,
  iconSize,
}: {
  icon: IconSvgElement;
  dark: boolean;
  className: string;
  iconSize: string;
}) {
  const hairline = dark ? "stroke-white/10" : "stroke-navy/[0.07]";
  const tick = dark ? "stroke-white/[0.13]" : "stroke-navy/[0.08]";
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className}`}>
      <svg viewBox="0 0 400 400" fill="none" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="200" r="120" className={hairline} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx="200" cy="200" r="158" className={hairline} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx="200" cy="200" r="192" className={hairline} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-0 animate-spin-slow-rev will-change-transform motion-reduce:animate-none">
        <svg viewBox="0 0 400 400" fill="none" className="h-full w-full">
          <circle cx="200" cy="200" r="174" className={tick} strokeWidth="8" strokeDasharray="1.5 21.28" />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <HugeiconsIcon
          icon={icon}
          strokeWidth={1}
          className={`${iconSize} ${dark ? "text-white/[0.14]" : "text-navy/[0.07]"}`}
        />
      </div>
    </div>
  );
}

export default function ModuleExplorer({ modules }: ModuleExplorerProps) {
  const layout = buildLayout(modules.length);

  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <Reveal className="border-b border-ink/10 pb-6">
        <h2 className="text-eyebrow uppercase text-ink/60">Modules</h2>
      </Reveal>

      <Reveal
        stagger
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {modules.map((mod, idx) => {
          const t = layout[idx];
          const icon = MODULE_ICONS[mod.name] ?? Grid2X2Icon;
          const dark = t.tone === "dark";
          const feature = t.size === "hero" || t.size === "tall";
          // The full-width tail card - laid out as a horizontal ledger row
          // rather than a bottom-pinned column, so it never reads as a
          // thin banner strip.
          const strip = t.colSpan === 4;

          // Grid line/span carried as CSS vars so the explicit placement is
          // scoped to lg only; at sm each tile flows with its precomputed
          // smSpan, which tiles the 2-column grid with no holes.
          const style = {
            "--gc": t.col,
            "--gcs": t.colSpan,
            "--gr": t.row,
            "--grs": t.rowSpan,
          } as CSSProperties;

          const plate = (
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out-expo group-hover:-rotate-2 group-hover:scale-105 ${TONE_BADGE[t.tone]} ${
                feature || strip ? "h-12 w-12" : "h-11 w-11"
              }`}
            >
              <HugeiconsIcon
                icon={icon}
                className={feature || strip ? "h-6 w-6" : "h-5 w-5"}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          );

          return (
            <BentoTile
              key={mod.name}
              glow={dark ? "white" : "blue"}
              style={style}
              className={`${CARD_BASE} ${TONE_CARD[t.tone]} ${
                strip ? "p-8 md:p-10" : feature ? "p-8" : "p-6"
              } ${
                t.smSpan === 2 ? "sm:col-span-2" : ""
              } lg:[grid-column:var(--gc)_/_span_var(--gcs)] lg:[grid-row:var(--gr)_/_span_var(--grs)]`}
            >
              {/* Sky bloom - one quiet radial from the top-right corner
                  replaces the old full-surface brand gradient, keeping a
                  single gradient accent per viewport. */}
              {dark && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgb(var(--sky)/0.22),rgb(var(--blue)/0.12)_38%,transparent_70%)]"
                />
              )}

              {feature || strip ? (
                <DialMotif
                  icon={icon}
                  dark={dark}
                  className={
                    t.size === "hero"
                      ? "-right-24 -top-24 h-[24rem] w-[24rem]"
                      : strip
                        ? "-right-16 top-1/2 h-72 w-72 -translate-y-1/2"
                        : "-right-16 -top-16 h-72 w-72"
                  }
                  iconSize={t.size === "hero" ? "h-24 w-24" : "h-14 w-14"}
                />
              ) : (
                t.tone !== "plain" && (
                  <HugeiconsIcon
                    icon={icon}
                    strokeWidth={1}
                    className={`pointer-events-none absolute -right-7 -top-7 transition-transform duration-500 ease-out-expo group-hover:-rotate-3 group-hover:scale-110 ${
                      t.size === "wide" ? "h-40 w-40" : "h-32 w-32"
                    } ${dark ? "text-white/10" : "text-navy/[0.06]"}`}
                    aria-hidden
                  />
                )
              )}

              {strip ? (
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                  {plate}
                  <div className="sm:max-w-2xl">
                    <h3 className="text-title-sm text-white">{mod.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {mod.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">{plate}</div>

                  <h3
                    className={`relative mt-auto ${feature ? "pt-6 text-title-sm" : "pt-5 font-medium tracking-tight"} ${
                      dark ? "text-white" : "text-navy"
                    }`}
                  >
                    {mod.name}
                  </h3>
                  <p
                    className={`relative mt-2 ${
                      t.size === "hero" ? "max-w-md text-body" : "text-sm leading-relaxed"
                    } ${dark ? "text-white/70" : "text-ink/60"}`}
                  >
                    {mod.summary}
                  </p>
                </>
              )}
            </BentoTile>
          );
        })}
      </Reveal>
    </section>
  );
}
