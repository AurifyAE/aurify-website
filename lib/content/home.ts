/**
 * Homepage copy - one object per section, in scroll order.
 * Final copy integrated from the approved content sheet (July 2026).
 */

/**
 * Hero is a 3-banner auto-rotating carousel over the white/gradient-mesh
 * background (see Hero.tsx). Each banner is a text slide by default.
 *  - `highlight` is the exact substring of `headline` that carries the gradient.
 *  - `image` is an optional background photo, `null` until one is supplied -
 *    drop a file in `public/images/hero/` and set its path (e.g.
 *    "/images/hero/trade.jpg") plus `imageAlt` to have a banner use one.
 */
export const hero = {
  scrollCue: "Scroll",
  banners: [
    {
      eyebrow: "The Ecosystem",
      headline: "Digital Infrastructure for Precious Metals.",
      highlight: "Precious Metals.",
      subline:
        "One intelligent ecosystem connecting the entire precious-metals lifecycle - from sourcing and refining to trading, treasury, risk and intelligence.",
      primary: { label: "Explore the Ecosystem", href: "/products" },
      secondary: { label: "Book a Demo", href: "/contact" },
      image: null as string | null,
      imageAlt: "",
    },
    {
      eyebrow: "AI-Native",
      headline: "Intelligence across the entire lifecycle.",
      highlight: "entire lifecycle.",
      subline:
        "Embedded AI turns operational data into foresight - predictive, automated and always on, from the first mile of provenance to the vault.",
      primary: { label: "Meet Aurify IQ", href: "/products/iq" },
      secondary: { label: "Book a Demo", href: "/contact" },
      image: null as string | null,
      imageAlt: "",
    },
    {
      eyebrow: "Built in Dubai",
      headline: "At the centre of the new gold corridor.",
      highlight: "gold corridor.",
      subline:
        "13–15% of the world’s physical gold now flows through Dubai. Aurify is the infrastructure built for that shift - and the decade of change behind it.",
      primary: { label: "Why Aurify", href: "/about" },
      secondary: { label: "Book a Demo", href: "/contact" },
      image: null as string | null,
      imageAlt: "",
    },
  ],
};

// Section 2 - pinned horizontal lifecycle strip (content sheet §11).
export const lifecycle = {
  eyebrow: "The Value Chain",
  stages: [
    {
      word: "Mine",
      sentence:
        "Sourcing, doré flows and the first mile of provenance - structured and accountable from the smallest artisanal lot to the largest consignment.",
      image: "/images/home/Earth_slab_with_gold_veins.jpeg",
      imageAlt: "Abstract render of a gold mine with a raw gold nugget at its center",
    },
    {
      word: "Refine",
      sentence:
        "Purity, assay, production and recovery, tracked with full traceability through every stage.",
      image: "/images/home/Molten_gold_pouring_into_mold.jpeg",
      imageAlt: "Molten gold pouring from a crucible into a mold on a refinery line",
    },
    {
      word: "Trade",
      sentence:
        "Dealing, hedging and exchange, with positions and exposure visible the moment they move.",
      image: "/images/home/Bullion_trading_desk_with_monitors.jpeg",
      imageAlt: "Gold bars beside floating trading charts with a city skyline behind",
    },
    {
      word: "Store",
      sentence:
        "Vaulting, custody and allocation across allocated and unallocated metal, with serial-level control.",
      image: "/images/home/Gold_bars_in_vault_interior.jpeg",
      imageAlt: "Shelves of gold bars inside a secure vault with a circular vault door",
    },
    {
      word: "Finance",
      sentence:
        "Treasury, settlement and institutional-grade financial control built on metal-aware accounting.",
      image: "/images/home/Abstract_corporate_finance_scene.jpeg",
      imageAlt: "A gold bar and pen beside a glass panel showing financial dashboards",
    },
    {
      word: "Analyze",
      sentence:
        "The AI engine, analytics and intelligence that turn operational data into foresight.",
      image: "/images/home/Glass_chess_king_glowing_circuitry.jpeg",
      imageAlt: "A glowing golden node at the center of converging data streams",
    },
  ],
};

// Section 3 - stats (content sheet §7).
export const opportunity = {
  title: "An industry at an inflection point.",
  body: "Few asset classes carry the weight of precious metals. One of the oldest and largest stores of value on earth is entering its most significant period of change in a generation - with Dubai at the centre of a new gold corridor forming across Asia and the Gulf.",
  stats: [
    {
      // CountUp animates `value`; prefix/suffix render statically around it
      value: 15,
      prefix: "13–",
      suffix: "%",
      label: "of the world’s physical gold now flows through Dubai",
      icon: "globe",
    },
    {
      value: 170,
      prefix: "USD ",
      suffix: "B",
      label: "UAE precious-metals trade in 2024 - a sharp year-on-year rise",
      icon: "trend",
    },
    {
      // Non-numeric stat - rendered as a reveal, no count-up
      value: null,
      display: "Trillions",
      label: "in annual gold turnover once financial instruments are included",
      icon: "gold",
    },
  ],
};

// Section 4 - dark pinned interlude (content sheet §8).
export const problem = {
  eyebrow: "The Problem",
  lead: "A high-value industry on low-tech foundations.",
  // "keyword" is the leading substring highlighted in sky blue
  gaps: [
    {
      keyword: "Fragmented operations.",
      text: "Fragmented operations. Trading, refining, vaulting and finance run on separate tools that never share a single version of the truth.",
    },
    {
      keyword: "Manual controls.",
      text: "Manual controls. Spreadsheets, manual reconciliation and human-dependent oversight introduce error and fraud risk at the worst possible point in the chain.",
    },
    {
      keyword: "Rising regulatory pressure.",
      text: "Rising regulatory pressure. AML/CFT, KYC, sanctions screening, goAML, VAT and IFRS obligations demand automation that legacy tools were never built to provide.",
    },
    {
      keyword: "A widening digitization gap.",
      text: "A widening digitization gap. Appetite for tokenization, financialization and digital gold is accelerating, while the infrastructure beneath it lags behind.",
    },
  ],
  closer: "The prize is clear. The infrastructure to capture it is not.",
};

// Section 5 - product suite on deep navy (content sheet §10, §19).
export const ecosystem = {
  eyebrow: "The Ecosystem",
  title: "One Platform. Complete Control.",
  body: "Where most systems digitize a single stage, Aurify connects every stage - mine, refine, trade, store, finance and analyze - into one coherent ecosystem. Metal, money, movement, risk and intelligence in a single source of truth, visible in real time.",
  products: [
    {
      slug: "bullion-pro",
      name: "Bullion Pro",
      category: "Trade",
      blurb:
        "Runs the trade - the intelligent trading and operations platform for precious metals.",
      icon: "trade",
      image: "/images/products/bullion-pro-bg.jpeg",
      // Bento visual - counterparty order flow converging on the trade hub
      buySideLabel: "Buy side",
      sellSideLabel: "Sell side",
    },
    {
      slug: "refine-x",
      name: "Refine X",
      category: "Production",
      blurb:
        "Runs production - the complete digital platform for precious-metals refining.",
      icon: "refine",
      image: "/images/products/refine-x-dashboard.jpeg",
    },
    {
      slug: "rms",
      name: "RMS",
      category: "Risk",
      blurb:
        "Runs risk - an institutional-grade control framework over a unified risk data layer.",
      icon: "risk",
      image: "/images/products/circuit-bg.jpeg",
    },
    {
      slug: "iq",
      name: "IQ",
      category: "Intelligence",
      blurb:
        "Runs intelligence - the AI layer that makes the whole ecosystem predictive.",
      icon: "intelligence",
      pulse: true, // subtle teal pulse - IQ powers the others
      image: "/images/products/iq-dashboard.jpeg",
    },
  ],
  closing: "Metal • Money • Movement • Risk • Intelligence",
};

// Section 6 - differentiators (content sheet §12).
export const whyAurify = {
  eyebrow: "Why Aurify",
  title: "What makes Aurify different.",
  items: [
    {
      claim: "Built for precious metals",
      support:
        "Purpose-built to support the unique workflows, accounting logic and compliance requirements of the precious-metals industry.",
    },
    {
      claim: "AI-native intelligence",
      support:
        "Embedded AI delivers predictive insights, automation and smarter decision-making across every stage of your operations.",
    },
    {
      claim: "Built-in risk intelligence",
      support:
        "Identify, monitor and manage financial, operational and compliance risks with real-time visibility and proactive alerts.",
    },
    {
      claim: "End-to-end platform",
      support:
        "Manage the complete precious-metals lifecycle - from sourcing and refining to trading, treasury and analytics - within one connected ecosystem.",
    },
    {
      claim: "Modular & scalable",
      support:
        "Adopt only what you need today and expand seamlessly as your business evolves.",
    },
    {
      claim: "Open & connected",
      support:
        "Integrate effortlessly with your existing systems through a secure, API-first architecture designed for enterprise flexibility.",
    },
  ],
};

// Section 7 - four pillars band (content sheet §1).
export const pillars = {
  items: [
    {
      title: "Digital First",
      line: "Replacing manual, fragmented processes with a connected digital backbone.",
    },
    {
      title: "AI Ready",
      line: "Intelligence woven through every product, not bolted on.",
    },
    {
      title: "Analytics Rich",
      line: "Operational data turned into foresight at every stage.",
    },
    {
      title: "Industry Focused",
      line: "Built specifically for precious metals, not adapted from generic software.",
    },
  ],
};

// Section 8 - audience marquee (content sheet §24).
export const whoWeServe = {
  eyebrow: "Who We Serve",
  title: "Infrastructure for every desk in the chain.",
  body: "From a single trading desk to a multi-entity, multi-jurisdiction group.",
  rows: [
    [
      { label: "Bullion traders & wholesalers", icon: "/icons/marquee/Icon 2.svg" },
      { label: "Refineries & producers", icon: "/icons/marquee/icon 3.svg" },
      { label: "ETF & institutional gold desks", icon: "/icons/marquee/Icon 24.svg" },
      { label: "Vault operators & custodians", icon: "/icons/marquee/Icon 5.svg" },
      { label: "Banks & financial institutions", icon: "/icons/marquee/Icon 6.svg" },
    ],
    [
      { label: "Investment houses & funds", icon: "/icons/marquee/Icon 28.svg" },
      { label: "Family offices", icon: "/icons/marquee/Icon 8.svg" },
      {
        label: "Fintech, tokenization & digital-gold platforms",
        icon: "/icons/marquee/Icon 27.svg",
      },
      {
        label: "Precious-metal retail & e-commerce",
        icon: "/icons/marquee/Icon 10.svg",
      },
    ],
  ],
};

// Section 9 - closing CTA (content sheet §23, "The Road Ahead").
export const closingCta = {
  headline: "The industry is being reimagined. Lead it.",
  subline:
    "Aurify Technology is building the infrastructure from Dubai - at the centre of the world’s fastest-rising gold corridor - for clients across the region and the world.",
  cta: { label: "Book a Demo", href: "/contact" },
};
