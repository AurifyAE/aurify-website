/**
 * E-Invoicing - UAE e-invoicing built into the Aurify platform. Final copy
 * integrated verbatim from the approved content brief (September 2026).
 * Drives /e-invoicing (standalone top-level route, like /connect -
 * e-invoicing is a platform capability, not one of the four core products).
 */

import type { Product, ProductSlug } from "@/lib/content/products";

const demoCta = { label: "Book a Demo", href: "/contact" };

export const eInvoicingHero = {
  eyebrow: "E-Invoicing",
  headline: "E-Invoicing, Built Into Your Precious Metals Operations.",
  highlight: "Precious Metals Operations.",
  subline:
    "Create, validate and manage compliant invoices without leaving the platform that runs your business.",
  intro:
    "Aurify connects e-invoicing directly with your transactions, customers, inventory, finance and compliance workflows - giving your business a single, connected flow from transaction to invoice.",
  cta: demoCta,
  secondary: { label: "See the Flow", href: "#invoice-flow" },
  // Hero visual - a structured, metal-aware invoice record. Illustrative
  // values only; they show the fields, not a real transaction.
  sample: {
    label: "Structured e-invoice",
    number: "INV-2026-00418",
    format: "Peppol · XML",
    lines: [
      { label: "Metal", value: "Gold" },
      { label: "Purity", value: "999.9" },
      { label: "Gross weight", value: "1,000.00 g" },
      { label: "Fine weight", value: "999.90 g" },
      { label: "Rate", value: "Fixed · Live" },
      { label: "VAT treatment", value: "Captured" },
    ],
    linked: ["Transaction", "Customer", "Finance"],
    status: "Validated",
  },
};

export const eInvoicingProblem = {
  title: "Your Business Shouldn't Have to Invoice in Isolation.",
  lead: "Precious metals transactions are rarely just invoices.",
  body: "They involve metal, purity, weight, rates, value, counterparties, VAT, payments and compliance - all moving together.",
  elements: [
    "Metal",
    "Purity",
    "Weight",
    "Rates",
    "Value",
    "Counterparties",
    "VAT",
    "Payments",
    "Compliance",
  ],
  bridge: "Aurify brings these elements into one connected workflow.",
  chain: ["Trade", "Invoice", "Finance", "Compliance"],
  nos: [
    "No duplicate data entry.",
    "No disconnected systems.",
    "No manual reconciliation between operations and invoicing.",
  ],
};

export type EInvoicingIcon =
  | "metal"
  | "link"
  | "tax"
  | "customer"
  | "finance"
  | "compliance";

export const eInvoicingCapabilities = {
  eyebrow: "Metal-Aware by Design",
  title: "E-Invoicing That Understands Precious Metals.",
  body: "Generic invoicing software treats every product as a simple SKU. Aurify is built around the realities of precious metals.",
  items: [
    {
      icon: "metal",
      title: "Metal-Aware Invoicing",
      summary:
        "Capture the transaction details that matter - including metal type, purity, gross weight, fine weight, rates, quantities and values.",
    },
    {
      icon: "link",
      title: "Transaction-Linked Invoices",
      summary:
        "Generate invoices directly from your completed business transactions, keeping commercial and invoice data connected.",
    },
    {
      icon: "tax",
      title: "VAT & Tax Data",
      summary:
        "Capture the tax information required for compliant invoicing while maintaining consistency across your transaction and finance records.",
    },
    {
      icon: "customer",
      title: "Customer & Counterparty Data",
      summary:
        "Pull customer and counterparty information directly from your CRM and onboarding records.",
    },
    {
      icon: "finance",
      title: "Finance Integration",
      summary:
        "Connect invoicing with your financial workflows so transactions, receivables and accounting records stay aligned.",
    },
    {
      icon: "compliance",
      title: "Compliance-Ready Data",
      summary:
        "Maintain structured transaction data that can support evolving UAE e-invoicing and reporting requirements.",
    },
  ] satisfies { icon: EInvoicingIcon; title: string; summary: string }[],
};

export const eInvoicingFlow = {
  eyebrow: "One Connected Flow",
  title: "From Transaction to Compliant Invoice.",
  steps: [
    {
      step: "Transact",
      summary:
        "Create your purchase, sale or other business transaction inside Aurify.",
    },
    {
      step: "Capture",
      summary:
        "Transaction details, customer information, metal data, rates, quantities and tax information flow into the invoice.",
    },
    {
      step: "Validate",
      summary:
        "Invoice data is checked against configured business and tax rules before submission.",
    },
    {
      step: "Exchange",
      summary:
        "Structured invoice data can be transmitted through the appropriate e-invoicing network and service provider architecture.",
    },
    {
      step: "Record",
      summary:
        "The invoice remains connected to the underlying transaction and financial records for a complete audit trail.",
    },
  ],
  closing: "One transaction. One source of truth.",
};

export const eInvoicingUae = {
  eyebrow: "UAE E-Invoicing",
  title: "Built for the UAE's Digital Tax Future.",
  body: "The UAE is moving toward structured, machine-readable e-invoicing through the Peppol-based DCTCE framework.",
  challenge:
    "For businesses preparing for the mandate, the challenge isn't simply generating an electronic invoice.",
  emphasis:
    "It's making sure the data behind the invoice is accurate, structured and connected to the systems that run the business.",
  foundation: "Aurify is designed to provide that connected foundation.",
  // Illustrative five-corner exchange model: supplier and buyer each work
  // through a service provider, with tax data reported to the authority.
  exchange: {
    caption: "How a structured e-invoice moves on the Peppol network",
    corners: [
      { id: 1, name: "Supplier", detail: "Invoice data created in Aurify" },
      { id: 2, name: "Supplier's Service Provider", detail: "Validates & sends" },
      { id: 3, name: "Buyer's Service Provider", detail: "Receives & delivers" },
      { id: 4, name: "Buyer", detail: "Receives structured invoice" },
      { id: 5, name: "FTA", detail: "Tax data reporting" },
    ],
  },
  prepareTitle: "Prepare your business for:",
  prepare: [
    {
      title: "Structured e-invoicing",
      summary:
        "Machine-readable invoice data rather than conventional PDF-based invoicing.",
    },
    {
      title: "Peppol-based exchange",
      summary:
        "Designed to work within the UAE's emerging e-invoicing network architecture.",
    },
    {
      title: "FTA reporting workflows",
      summary:
        "Support the structured data requirements associated with UAE e-invoicing.",
    },
    {
      title: "Digital auditability",
      summary:
        "Maintain connected transaction and invoice records across the business.",
    },
  ],
  note: "Final e-invoicing exchange and reporting capabilities depend on the applicable UAE regulations, accredited service-provider architecture and Aurify's integration configuration.",
};

export type DataSourceIcon =
  | "customer"
  | "metal"
  | "pricing"
  | "transaction"
  | "tax"
  | "finance"
  | "compliance";

export const eInvoicingData = {
  eyebrow: "The Data Layer",
  title: "The Precious Metals Data Behind Every Invoice.",
  body: "An e-invoice is only as reliable as the data that creates it. Aurify connects invoice generation to the operational data already being managed across your business.",
  sources: [
    { icon: "customer", name: "Customer", detail: "KYC, onboarding & counterparty information" },
    { icon: "metal", name: "Metal", detail: "Metal type, purity, weight & quantity" },
    { icon: "pricing", name: "Pricing", detail: "Live rates, transaction price & fixing information" },
    { icon: "transaction", name: "Transaction", detail: "Buy, sell, trade & settlement details" },
    { icon: "tax", name: "Tax", detail: "VAT & applicable tax information" },
    { icon: "finance", name: "Finance", detail: "Receivables, payments & accounting records" },
    { icon: "compliance", name: "Compliance", detail: "Audit trails, controls & supporting documentation" },
  ] satisfies { icon: DataSourceIcon; name: string; detail: string }[],
  closing: ["One connected data layer.", "One version of the truth."],
};

export const eInvoicingEcosystem = {
  eyebrow: "The Aurify Ecosystem",
  title: "E-Invoicing Across the Aurify Ecosystem.",
  body: "E-invoicing doesn't operate as a standalone feature. It connects with the wider Aurify ecosystem.",
  products: [
    {
      slug: "bullion-pro",
      icon: "trade",
      name: "Bullion Pro",
      category: "Trade & Operations",
      summary:
        "Generate invoice data from your precious-metals trading and operational workflows.",
    },
    {
      slug: "refine-x",
      icon: "refine",
      name: "Refine X",
      category: "Production & Refining",
      summary:
        "Connect refining transactions, material movements and commercial records with invoicing workflows.",
    },
    {
      slug: "rms",
      icon: "risk",
      name: "Aurify RMS",
      category: "Risk & Compliance",
      summary:
        "Keep compliance and risk controls connected to the underlying business activity.",
    },
    {
      slug: "iq",
      icon: "intelligence",
      name: "Aurify IQ",
      category: "Intelligence",
      summary:
        "Turn operational and financial data into analytics, patterns and actionable insight.",
    },
  ] satisfies {
    slug: ProductSlug;
    icon: Product["icon"];
    name: string;
    category: string;
    summary: string;
  }[],
  closing: "Trade. Finance. Compliance. Intelligence.",
  closingSub: "All connected.",
};

export const eInvoicingReady = {
  title: "Ready for E-Invoicing. Ready for What's Next.",
  lines: [
    "Regulation will evolve.",
    "Your business will grow.",
    "Your systems should evolve with them.",
  ],
  body: "Aurify provides an intelligent, connected foundation for managing precious-metals operations today while preparing your business for tomorrow's digital requirements.",
  cta: {
    line: "Make every invoice part of a smarter operation.",
    label: "Book an Aurify Demo",
    href: "/contact",
  },
};

export const eInvoicingFaq = {
  eyebrow: "FAQ",
  title: "E-Invoicing Questions, Answered.",
  items: [
    {
      q: "What is UAE e-invoicing?",
      a: "UAE e-invoicing is the exchange of structured, machine-readable invoice data through the country's approved e-invoicing framework rather than relying on conventional PDF or paper invoices.",
    },
    {
      q: "Is a PDF invoice an e-invoice?",
      a: "No. A PDF may be an electronic document, but it is not the same as a structured e-invoice designed for machine-to-machine exchange and validation.",
    },
    {
      q: "Does Aurify support e-invoicing?",
      a: "Aurify is designed with e-invoicing as an integrated part of its precious-metals business platform, connecting invoice data with transactions, customers, finance and compliance workflows.",
    },
    {
      q: "Can Aurify connect with existing ERP or accounting systems?",
      a: "Aurify follows an API-first architecture and is designed to integrate with existing technology environments where required.",
    },
    {
      q: "Does e-invoicing work with precious-metals transactions?",
      a: "Yes. Aurify is purpose-built around precious-metals workflows, where invoice data can be connected to metal, purity, weight, rates, transaction and customer information.",
    },
    {
      q: "Will my business need to replace its existing ERP?",
      a: "Not necessarily. Aurify is designed to operate as a connected platform and can integrate with existing systems depending on your technology architecture and requirements.",
    },
  ],
};

export const eInvoicingClosing = {
  headline: "E-Invoicing Shouldn't Be Another System.",
  subline:
    "It should be part of the system you already run your business on.",
  cta: demoCta,
};
