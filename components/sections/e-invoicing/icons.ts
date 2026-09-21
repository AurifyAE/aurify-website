import type { IconSvgElement } from "@hugeicons/react";
import {
  Audit01Icon,
  Coins01Icon,
  Exchange01Icon,
  GoldIngotsIcon,
  Link01Icon,
  TaxesIcon,
  UserAccountIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { DataSourceIcon, EInvoicingIcon } from "@/lib/content/e-invoicing";

/** Glyphs for the capability cards and the data-layer tiles. */
export const eInvoicingIcons: Record<EInvoicingIcon | DataSourceIcon, IconSvgElement> = {
  metal: GoldIngotsIcon,
  link: Link01Icon,
  tax: TaxesIcon,
  customer: UserAccountIcon,
  finance: Wallet01Icon,
  compliance: Audit01Icon,
  pricing: Coins01Icon,
  transaction: Exchange01Icon,
};
