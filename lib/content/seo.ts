/**
 * On-page SEO copy: titles and meta descriptions supplied by the SEO team.
 * Titles are complete as written, so pages opt out of the layout's
 * "%s - Aurify Technology" template via absoluteSeo().
 */

import type { Metadata } from "next";
import type { ProductSlug } from "@/lib/content/products";
import { site } from "@/lib/content/site";

export interface SeoEntry {
  /** Route path, used for the canonical URL (resolved against metadataBase). */
  path: string;
  title: string;
  description: string;
}

/**
 * A page's openGraph/twitter objects replace the layout's rather than merging
 * with them, so the shared fields are repeated here.
 */
export function absoluteSeo({ path, title, description }: SeoEntry): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      url: path,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const homeSeo: SeoEntry = {
  path: "/",
  title:
    "Advanced AI Software for Gold, Silver & Bullion | Precious Metals Platform | Aurify",
  description:
    "Aurify offers advanced AI-powered software for gold, silver and bullion businesses, with smart analytics, automation, inventory management, traceability and real-time dashboards.",
};

export const pageSeo = {
  products: {
    path: "/products",
    title: "AI-Powered Cloud ERP Software for Precious Metals Industry | Aurify",
    description:
      "Aurify offers AI-powered cloud ERP software for the precious metals industry with advanced analytics, automation, traceability, digital wallets, tokenization and e-commerce",
  },
  about: {
    path: "/about",
    title: "Aurify | Technology for the Global Precious Metals Industry",
    description:
      "Aurify is a technology company powering the global precious metals industry with connected solutions for sourcing, refining, trading, treasury, compliance and risk.",
  },
  services: {
    path: "/services",
    title:
      "Precious Metals Trading Platform | Digital Infrastructure | Aurify Technology",
    description:
      "Explore precious metals trading platform softwares with digital infrastructure designed to streamline trading, operations, inventory, compliance and business management.",
  },
  blogs: {
    path: "/blogs",
    title: "Precious Metals Industry Insights | Latest Gold & Bullion Industry Trends",
    description:
      "Stay updated with the latest gold industry trends, market insights, trading developments and key opportunities shaping the global gold industry.",
  },
  webinars: {
    path: "/webinars",
    title: "Precious Metals Webinars | Precious Metals Technology Events",
    description:
      "Participate in expert-led precious metals webinars and technology seminars to discover industry trends, trading solutions, digital innovation and new opportunities.",
  },
  eInvoicing: {
    path: "/e-invoicing",
    title: "UAE E-Invoicing Software for Precious Metals Businesses | Aurify",
    description:
      "Create, validate and manage compliant e-invoices inside Aurify. Metal-aware invoicing connected to transactions, VAT, finance and compliance, built for the UAE's Peppol-based framework.",
  },
} satisfies Record<string, SeoEntry>;

/** Products without an entry fall back to the generated product metadata. */
export const productSeo: Partial<Record<ProductSlug, SeoEntry>> = {
  "bullion-pro": {
    path: "/products/bullion-pro",
    title: "Bullion Trading Software | ERP Gold & Silver Software | Bullion Pro",
    description:
      "Powerful bullion trading software with Dealing Desk, Fixing Desk, inventory, pricing, and ERP gold solutions to streamline bullion and jewellery business operations.",
  },
  "refine-x": {
    path: "/products/refine-x",
    title: "Bullion Refinery Software | Refining ERP & Bullion Management | Refine X",
    description:
      "Streamline refining with bullion refinery software, gold refinery software, refining ERP, and bullion software solutions for efficient operations.",
  },
  rms: {
    path: "/products/rms",
    title: "Risk Management Software for Precious Metals Business",
    description:
      "Manage risks efficiently with jewellery risk management software designed for the precious-metals business, supporting compliance, controls, and operations.",
  },
};
