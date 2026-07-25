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
  "group relative flex flex-col overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1";

const TONE_CARD: Record<Tone, string> = {
  dark: "bg-gradient-brand hover:shadow-2xl hover:shadow-navy/25",
  tinted: "bg-mist hover:shadow-xl hover:shadow-navy/10",
  plain:
    "border border-ink/10 bg-white hover:border-navy/20 hover:shadow-xl hover:shadow-navy/10",
};

const TONE_BADGE: Record<Tone, string> = {
  dark: "bg-white/15 text-white",
  tinted: "bg-white text-blue",
  plain: "border border-ink/10 text-navy",
};

const TONE_INDEX: Record<Tone, string> = {
  dark: "text-white/40",
  tinted: "text-navy/30",
  plain: "text-ink/25",
};

export default function ModuleExplorer({ modules }: ModuleExplorerProps) {
  const layout = buildLayout(modules.length);

  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">Modules</h2>

      <Reveal
        stagger
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {modules.map((mod, idx) => {
          const t = layout[idx];
          const icon = MODULE_ICONS[mod.name] ?? Grid2X2Icon;
          const dark = t.tone === "dark";
          const feature = t.size === "hero" || t.size === "tall";

          // Grid line/span carried as CSS vars so the explicit placement is
          // scoped to lg only; at sm each tile flows with its precomputed
          // smSpan, which tiles the 2-column grid with no holes.
          const style = {
            "--gc": t.col,
            "--gcs": t.colSpan,
            "--gr": t.row,
            "--grs": t.rowSpan,
          } as CSSProperties;

          return (
            <BentoTile
              key={mod.name}
              glow={dark ? "white" : "blue"}
              style={style}
              className={`${CARD_BASE} ${TONE_CARD[t.tone]} ${feature ? "p-8" : "p-6"} ${
                t.smSpan === 2 ? "sm:col-span-2" : ""
              } lg:[grid-column:var(--gc)_/_span_var(--gcs)] lg:[grid-row:var(--gr)_/_span_var(--grs)]`}
            >
              {t.tone !== "plain" && (
                <HugeiconsIcon
                  icon={icon}
                  strokeWidth={1}
                  className={`pointer-events-none absolute transition-transform duration-500 ease-out-expo group-hover:scale-110 ${
                    feature
                      ? "-bottom-10 -right-8 h-48 w-48"
                      : "-bottom-8 -right-6 h-36 w-36"
                  } ${dark ? "text-white/[0.12]" : "text-navy/[0.06]"}`}
                  aria-hidden
                />
              )}

              <div className="relative flex items-start justify-between">
                <span
                  className={`inline-flex items-center justify-center rounded-full transition-transform duration-300 ease-out-expo group-hover:scale-105 ${TONE_BADGE[t.tone]} ${
                    feature ? "h-12 w-12" : "h-11 w-11"
                  }`}
                >
                  <HugeiconsIcon
                    icon={icon}
                    className={feature ? "h-6 w-6" : "h-5 w-5"}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
                <span
                  className={`text-eyebrow tabular-nums ${TONE_INDEX[t.tone]}`}
                  aria-hidden
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <h3
                className={`relative mt-auto ${feature ? "pt-6 text-title-sm" : "pt-5 font-medium"} ${
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
            </BentoTile>
          );
        })}
      </Reveal>
    </section>
  );
}
