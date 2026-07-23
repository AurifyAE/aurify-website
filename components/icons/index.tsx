/**
 * Icon set. Two rendering paths:
 *  - Featured icons (product glyphs + arrows) render their own paths with
 *    stroke="url(#aurify-icon-gradient)", referencing the shared gradient
 *    def mounted once in the root layout (IconGradientDefs). HugeiconsIcon
 *    itself can't do this — its `color` prop only ever sets a plain CSS
 *    `color` on the wrapping <svg> for currentColor inheritance, and `color`
 *    can't hold a gradient paint reference the way `stroke`/`fill` can.
 *  - Utility icons (nav toggle, stat icons — defined in their own files)
 *    stay on HugeiconsIcon with flat currentColor, unchanged.
 */

import { createElement } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDataTransferHorizontalIcon,
  TestTube01Icon,
  Shield01Icon,
  NeuralNetworkIcon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  BankIcon as BankGlyph,
  UserGroupIcon as UserGroupGlyph,
  GlobeIcon as GlobeGlyph,
  FactoryIcon as FactoryGlyph,
  GoldIngotsIcon as GoldIngotsGlyph,
  SafeIcon as SafeGlyph,
} from "@hugeicons/core-free-icons";

interface IconProps {
  className?: string;
  /**
   * Which shared gradient def to stroke with. "light" (default) is the
   * navy→sky brand ramp for light backgrounds; "dark" is the sky→teal ramp —
   * the navy end of the light ramp disappears on navy sections.
   */
  tone?: "light" | "dark";
}

export const ICON_GRADIENT_ID = "aurify-icon-gradient";
export const ICON_GRADIENT_DARK_ID = "aurify-icon-gradient-dark";

function GradientIcon({
  icon,
  className,
  tone = "light",
}: IconProps & {
  icon: IconSvgElement;
}) {
  const id = tone === "dark" ? ICON_GRADIENT_DARK_ID : ICON_GRADIENT_ID;
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      className={className}
      aria-hidden
    >
      {icon.map(([tag, attrs]) =>
        createElement(tag, { ...attrs, stroke: `url(#${id})` })
      )}
    </svg>
  );
}

/** Trade — opposing exchange arrows */
export function TradeIcon(props: IconProps) {
  return <GradientIcon icon={ArrowDataTransferHorizontalIcon} {...props} />;
}

/** Refine — assay/lab test tube */
export function RefineIcon(props: IconProps) {
  return <GradientIcon icon={TestTube01Icon} {...props} />;
}

/** Risk — shield */
export function RiskIcon(props: IconProps) {
  return <GradientIcon icon={Shield01Icon} {...props} />;
}

/** Intelligence — connected node network */
export function IntelligenceIcon(props: IconProps) {
  return <GradientIcon icon={NeuralNetworkIcon} {...props} />;
}

export function ArrowRightIcon(props: IconProps) {
  return <GradientIcon icon={ArrowRight01Icon} {...props} />;
}

export function ArrowUpRightIcon(props: IconProps) {
  return <GradientIcon icon={ArrowUpRight01Icon} {...props} />;
}

/* Counterparty glyphs — the Bullion Pro network visual in the Ecosystem
   bento. Named for what they represent in the trade flow, not the glyph. */

/** Banks & financial institutions */
export function BankIcon(props: IconProps) {
  return <GradientIcon icon={BankGlyph} {...props} />;
}

/** Funds, family offices & investment houses */
export function FundIcon(props: IconProps) {
  return <GradientIcon icon={UserGroupGlyph} {...props} />;
}

/** Global & institutional desks */
export function GlobeDeskIcon(props: IconProps) {
  return <GradientIcon icon={GlobeGlyph} {...props} />;
}

/** Refineries & producers */
export function RefineryIcon(props: IconProps) {
  return <GradientIcon icon={FactoryGlyph} {...props} />;
}

/** Bullion traders & wholesalers */
export function IngotsIcon(props: IconProps) {
  return <GradientIcon icon={GoldIngotsGlyph} {...props} />;
}

/** Vault operators & custodians */
export function VaultIcon(props: IconProps) {
  return <GradientIcon icon={SafeGlyph} {...props} />;
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
  ...props
}: IconProps & { name: ProductIconName }) {
  const Cmp = productIcons[name];
  return <Cmp {...props} />;
}
