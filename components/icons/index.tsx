/**
 * Monoline icon set — 24×24 viewBox, 1.5 stroke, currentColor.
 * Geometric and restrained; no filled shapes.
 */

interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Trade — opposing exchange arrows */
export function TradeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5" />
      <path d="M20 16H7M10.5 19.5 7 16l3.5-3.5" />
    </svg>
  );
}

/** Refine — droplet over heat lines */
export function RefineIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3c2.8 3.6 4.5 5.9 4.5 8.3a4.5 4.5 0 1 1-9 0C7.5 8.9 9.2 6.6 12 3Z" />
      <path d="M7 20h10" />
    </svg>
  );
}

/** Risk — shield with pulse line */
export function RiskIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.3 7 8.8 4.1-1.5 7-4.5 7-8.8V5.8L12 3Z" />
      <path d="M8.5 12h2l1.5-2.5 1.5 4L15 11h.5" />
    </svg>
  );
}

/** Intelligence — node hub */
export function IntelligenceIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="3" r="0.5" />
      <circle cx="12" cy="21" r="0.5" />
      <circle cx="3" cy="12" r="0.5" />
      <circle cx="21" cy="12" r="0.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h16M13.5 5.5 20 12l-6.5 6.5" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 18 18 6M8.5 6H18v9.5" />
    </svg>
  );
}

export type ProductIconName = "trade" | "refine" | "risk" | "intelligence";

const productIcons: Record<ProductIconName, (p: IconProps) => React.JSX.Element> = {
  trade: TradeIcon,
  refine: RefineIcon,
  risk: RiskIcon,
  intelligence: IntelligenceIcon,
};

export function ProductIcon({
  name,
  className,
}: IconProps & { name: ProductIconName }) {
  const Cmp = productIcons[name];
  return <Cmp className={className} />;
}
