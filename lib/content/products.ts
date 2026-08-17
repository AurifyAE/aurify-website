/**
 * Product suite content - drives /products and the shared product template.
 * Final copy integrated from the approved content sheet (July 2026), §15–19.
 */

export type ProductSlug = "bullion-pro" | "refine-x" | "rms" | "iq";

export interface ProductModule {
  name: string;
  summary: string;
}

export interface RmsLayer {
  name: string;
  summary: string;
  /** Module names inside this layer (details live in `modules`) */
  modules: string[];
}

export interface ProductDimension {
  title: string;
  summary: string;
  points: string[];
}

export interface Product {
  slug: ProductSlug;
  name: string;
  category: string; // Trade | Production | Risk | Intelligence
  icon: "trade" | "refine" | "risk" | "intelligence";
  /** One-line role. `highlight` is the substring carrying the gradient. */
  role: string;
  highlight: string;
  /** Short positioning paragraph under the hero */
  intro: string;
  modules: ProductModule[];
  audiences: string[];
  /** Refine X only - the refinery process flow */
  processFlow?: { step: string; summary: string }[];
  /** RMS only - three-layer architecture diagram */
  architecture?: {
    title: string;
    note: string;
    base: string;
    layers: RmsLayer[];
  };
  /** RMS only - key system outputs */
  outputs?: { name: string; summary: string }[];
  /** IQ only - replaces the "Powered by IQ" band */
  dimensions?: ProductDimension[];
  /** Closing "why" paragraph */
  why?: { title: string; text: string };
}

export const productOrder: ProductSlug[] = ["bullion-pro", "refine-x", "rms", "iq"];

export const products: Record<ProductSlug, Product> = {
  "bullion-pro": {
    slug: "bullion-pro",
    name: "Bullion Pro",
    category: "Trade",
    icon: "trade",
    role: "The Intelligent Trading & Operations Platform for Precious Metals.",
    highlight: "Trading & Operations",
    intro:
      "A comprehensive digital platform built specifically for precious-metals businesses - bringing trading, treasury, finance, compliance, vault management and business intelligence into one connected ecosystem.",
    modules: [
      {
        name: "CRM",
        summary:
          "Manage clients, counterparties and relationships across the trade lifecycle in one place, with a complete view of every interaction and account.",
      },
      {
        name: "KYC & Onboarding",
        summary:
          "Structured, defensible customer onboarding with identity verification, risk rating and documentation, designed to satisfy regulatory expectations from day one.",
      },
      {
        name: "Compliance Manager",
        summary:
          "Embedded AML/CFT controls, sanctions and PEP screening, risk matrices and audit trails, keeping compliance active inside daily operations rather than as an afterthought.",
      },
      {
        name: "Dealing Desk",
        summary:
          "Capture, price and execute physical and financial metal trades with live rates, position keeping and full trade history.",
      },
      {
        name: "Fixing Desk",
        summary:
          "Manage unfixed positions and execute fixings against benchmarks with precision and a clear, auditable trail.",
      },
      {
        name: "Treasury Management",
        summary:
          "Manage metal and cash positions, exposure, funding and liquidity across the business.",
      },
      {
        name: "Vault Management",
        summary:
          "Track stored metal across allocated and unallocated pools, by location and at serial level, with full custody control.",
      },
      {
        name: "Finance (IFRS)",
        summary:
          "Metal-aware accounting and financial control aligned to IFRS concepts, reconciling metal and money in a single ledger.",
      },
      {
        name: "Reports",
        summary:
          "Configurable operational, financial and regulatory reporting across the whole business.",
      },
      {
        name: "Analytics & AI",
        summary:
          "Always powered by Aurify IQ - dashboards, forecasting and pattern detection that turn daily operations into insight.",
      },
    ],
    audiences: [
      "Bullion traders & wholesalers",
      "Refineries & precious-metals producers",
      "Banks & financial institutions",
      "ETF & institutional trading desks",
      "Investment houses & family offices",
      "Retail & e-commerce platforms",
      "Gold wallet & digital-asset platforms",
      "Fintech & tokenisation companies",
    ],
    why: {
      title: "Why Bullion Pro",
      text: "Built exclusively for the precious-metals industry, Bullion Pro combines deep domain expertise with modern technology. By connecting trading, finance, compliance and operational intelligence within a single ecosystem, it empowers businesses to operate more efficiently, manage risk proactively and unlock new opportunities for growth.",
    },
  },

  "refine-x": {
    slug: "refine-x",
    name: "Refine X",
    category: "Production",
    icon: "refine",
    role: "The Complete Digital Platform for Precious Metals Refining.",
    highlight: "Refining.",
    intro:
      "An end-to-end refinery management platform that digitises every stage of the refining process - from material intake and assay to production, vaulting, finance and ESG traceability. It includes the full commercial and compliance capability of Bullion Pro, extended with the operational depth a refinery needs.",
    processFlow: [
      {
        step: "Intake",
        summary:
          "CRM, KYC and logistics. Material and its owner enter the system together, fully documented.",
      },
      {
        step: "Acceptance",
        summary:
          "Doré and scrap are melted and assayed; the acceptance engine establishes true metal content and value.",
      },
      {
        step: "Refining",
        summary:
          "Batch processing moves material through the refining workflow with full tracking of metal and value at every step.",
      },
      {
        step: "Production",
        summary:
          "Finished output is planned and produced as bars, coins and other forms.",
      },
      {
        step: "Vault & Finance",
        summary:
          "Output is vaulted, with treasury and settlement closing the loop.",
      },
    ],
    modules: [
      {
        name: "CRM & KYC Onboarding",
        summary:
          "Customer and counterparty management with compliant onboarding for every supplier of material.",
      },
      {
        name: "Compliance Manager",
        summary:
          "AML/CFT, sanctions screening and risk controls across the refinery’s counterparties and flows.",
      },
      {
        name: "Logistics & Intake",
        summary:
          "Manage inbound material, couriers, insurance and the documented hand-off at intake.",
      },
      {
        name: "Acceptance Engine",
        summary:
          "Melt, assay and establish metal content and value for doré and scrap - the foundation of every downstream calculation.",
      },
      {
        name: "Refinery Processing",
        summary:
          "Track batches through each refining stage with full visibility of material, value and recoveries.",
      },
      {
        name: "Production Planning",
        summary:
          "Plan and schedule the production of bars, coins and forms against demand and capacity.",
      },
      {
        name: "Laboratory Management",
        summary:
          "Keep assay and quality data connected to operations so purity and recoveries stay consistent and settlement-ready.",
      },
      {
        name: "Recovery Tracking",
        summary:
          "Account for recoveries and losses across the process with full transparency.",
      },
      {
        name: "Trade & Vault",
        summary:
          "Manage trading positions and vaulted metal alongside production.",
      },
      {
        name: "Treasury",
        summary:
          "Manage metal and cash exposure, funding and settlement across the operation.",
      },
      {
        name: "Finance (IFRS)",
        summary:
          "Metal-aware accounting and financial control aligned to IFRS concepts.",
      },
      {
        name: "Traceability & ESG",
        summary:
          "A traceability ledger that follows metal from source to finished form, designed around responsible-sourcing and ESG expectations.",
      },
      {
        name: "Reports",
        summary:
          "Operational, financial, regulatory and ESG reporting in one place.",
      },
      {
        name: "Analytics & AI",
        summary: "Always powered by Aurify IQ.",
      },
    ],
    audiences: [
      "Precious-metal refineries & producers",
      "Integrated trader-refiners",
      "Recyclers & scrap processors",
      "Mints & fabricators",
      "Responsible-sourcing & ESG operations",
    ],
    why: {
      title: "Why Refine X",
      text: "Refine X is more than a refinery management system - it’s a complete digital foundation for modern refining operations. By connecting production, quality, compliance, finance and traceability within a single platform, it empowers refineries to operate more efficiently, maintain the highest standards of transparency and quality, and confidently meet the evolving demands of the global precious-metals industry.",
    },
  },

  rms: {
    slug: "rms",
    name: "Aurify RMS",
    category: "Risk",
    icon: "risk",
    role: "The Institutional-Grade Control Framework for Precious-Metals Risk.",
    highlight: "Risk.",
    intro:
      "A dedicated, institutional-grade risk management system for the precious-metals business - organised as a three-layer architecture over a Unified Risk Data Layer, so there is no siloed exposure and risk is seen as one connected picture rather than a set of disconnected reports.",
    modules: [
      {
        name: "Market Risk",
        summary: "Mark-to-market, Value-at-Risk, hedge ratio, FX and gap risk.",
      },
      {
        name: "Credit Risk",
        summary: "Counterparty limits, margin and collateral management.",
      },
      {
        name: "Liquidity Risk",
        summary:
          "Cash and metal forecasting, liquidity coverage and survival-days analysis.",
      },
      {
        name: "Inventory Risk",
        summary:
          "Allocated and unallocated positions, work-in-progress and serial-level reconciliation.",
      },
      {
        name: "Operational Risk",
        summary: "Maker-checker controls, audit trail and override detection.",
      },
      {
        name: "Compliance Risk",
        summary: "AML/CFT, KYC, goAML, VAT, IFRS and sanctions exposure.",
      },
      {
        name: "Logistics Risk",
        summary: "In-transit metal, insurance and courier dependency.",
      },
      {
        name: "Infrastructure Risk",
        summary: "IT health, disaster-recovery readiness and vault security.",
      },
      {
        name: "Analytics",
        summary: "Cross-risk aggregation, pattern detection and benchmarking.",
      },
      {
        name: "AI Engine",
        summary: "Default prediction, fraud detection and dynamic limits.",
      },
      {
        name: "Stress & Scenario Engine",
        summary: "Predefined shocks and multi-variable scenario combinations.",
      },
    ],
    audiences: [
      "Bullion traders & wholesalers",
      "Banks & financial institutions",
      "ETF & institutional desks",
      "Vault operators & custodians",
    ],
    architecture: {
      title: "Three layers. One risk picture.",
      note: "All modules share a Unified Risk Data Layer - no siloed exposure.",
      base: "Unified Risk Data Layer",
      layers: [
        {
          name: "Financial Risk Core",
          summary:
            "Market, credit, liquidity and inventory risk engines running on live positions.",
          modules: ["Market Risk", "Credit Risk", "Liquidity Risk", "Inventory Risk"],
        },
        {
          name: "Control & Systemic Risk Core",
          summary:
            "Controls, compliance and the operational dependencies around the metal.",
          modules: [
            "Operational Risk",
            "Compliance Risk",
            "Logistics Risk",
            "Infrastructure Risk",
          ],
        },
        {
          name: "Intelligence Layer",
          summary:
            "Aurify IQ models scoring, forecasting and flagging across every risk.",
          modules: ["Analytics", "AI Engine", "Stress & Scenario Engine"],
        },
      ],
    },
    outputs: [
      {
        name: "Real-Time Exposure",
        summary:
          "A unified view of market, credit, liquidity and inventory exposure across all entities.",
      },
      {
        name: "Early Warning Alerts",
        summary:
          "AI-powered signals before breaches occur: default probability, margin deficits and anomalies.",
      },
      {
        name: "Regulatory Reporting",
        summary:
          "AML, goAML, VAT, IFRS, KYC status and sanction alerts as automated compliance output.",
      },
      {
        name: "Executive Heatmap",
        summary:
          "A visual risk-concentration map across counterparties, geographies, metals and operations.",
      },
      {
        name: "Stress Test Results",
        summary:
          "Survival probability, capital impact and decision simulation under multiple shock scenarios.",
      },
      {
        name: "Systemic Risk Index",
        summary:
          "A composite index aggregating financial, operational, compliance and infrastructure health.",
      },
    ],
  },

  iq: {
    slug: "iq",
    name: "IQ",
    category: "Intelligence",
    icon: "intelligence",
    role: "Analytics + AI + Organizational Intelligence.",
    highlight: "Intelligence.",
    intro:
      "The intelligence layer that sits across the whole ecosystem. IQ is what makes Bullion Pro, Refine X and RMS not just digital, but predictive - turning operational and historical data into foresight, and ultimately into an AI-driven, self-learning precious-metals organisation.",
    modules: [],
    audiences: [
      "Every Aurify customer",
      "Executives",
      "Analysts",
      "Data teams",
    ],
    dimensions: [
      {
        title: "Product",
        summary: "Pre-built analytical engines, ready out of the box.",
        points: [
          "Industry-specific data models built for precious metals",
          "Integrated within Bullion Pro, Refine X and Aurify RMS",
          "A ready-to-deploy intelligence layer",
        ],
      },
      {
        title: "Platform",
        summary: "Your own AI model, specific to your organisation.",
        points: [
          "Learns continuously from your operational and historical data",
          "Behavioural pattern recognition",
          "A predictive alerts and forecasting engine",
        ],
      },
      {
        title: "Consultancy",
        summary: "Our intelligence expertise, applied to your organisation.",
        points: [
          "AI readiness assessment",
          "Data architecture advisory",
          "Model training and optimisation",
          "Ongoing intelligence evolution as your business grows",
        ],
      },
    ],
  },
};

/** Shared badge band shown on every product page except IQ */
export const poweredByIq = {
  badge: "Always powered by Aurify IQ",
  line: "Dashboards, forecasting and pattern detection that turn daily operations into insight - native to every Aurify product.",
  href: "/products/iq",
};

/** /products suite overview page (content sheet §19) */
export const productsPage = {
  eyebrow: "Products",
  title: "One Platform. Complete Control.",
  intro:
    "The four products are designed to work as one. Bullion Pro runs the trade, Refine X runs production, Aurify RMS runs risk, and Aurify IQ runs intelligence across all of them - around a single Aurify ecosystem core.",
  closing: "Metal • Money • Movement • Risk • Intelligence",
};

/** Architecture & engagement models (content sheet §13) */
export const engagement = {
  title: "Architecture & engagement models",
  intro:
    "Enterprises buy infrastructure, not just features. Aurify is designed to meet your business where it is.",
  items: [
    {
      name: "SaaS or enterprise",
      summary:
        "A fully managed software-as-a-service model for speed and simplicity, or a dedicated enterprise architecture for control, customization and data sovereignty.",
    },
    {
      name: "Cloud-ready",
      summary:
        "Cloud-native hosting for scalability and resilience, with deployment options to suit your security and data-residency requirements.",
    },
    {
      name: "API-first",
      summary:
        "Every capability is built to connect - integration with your existing estate, and with the wider market, is straightforward.",
    },
    {
      name: "Modular by design",
      summary:
        "Start with one product or module and expand across the ecosystem as you grow, without rip-and-replace.",
    },
  ],
};
