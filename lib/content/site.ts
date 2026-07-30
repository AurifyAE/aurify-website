/**
 * Global site content: identity, navigation, footer, contact.
 * Final copy gets pasted here - components never hard-code strings.
 */

export const site = {
  name: "Aurify Technology",
  shortName: "Aurify",
  tagline: "Digital Infrastructure for Precious Metals",
  signature: "Mine • Refine • Trade",
  domain: "aurify.global",
  url: "https://aurify.global",
  description:
    "Aurify is an AI-native technology company building the digital backbone for the global precious-metals industry - unifying sourcing, refining, trading, treasury, compliance, risk and intelligence into one connected ecosystem.",

  contact: {
    address: "Suite 1006, I Rayyan Building, Al Nahda, Dubai, UAE",
    phone: "+971 58 502 3411",
    phoneHref: "tel:+971585023411",
    email: "info@aurify.global",
    emailHref: "mailto:info@aurify.global",
  },

  nav: [
    { label: "Products", href: "/products" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  navCta: { label: "Talk to Us", href: "/contact" },

  footer: {
    columns: [
      {
        title: "Products",
        links: [
          { label: "Bullion Pro", href: "/products/bullion-pro" },
          { label: "Refine X", href: "/products/refine-x" },
          { label: "RMS", href: "/products/rms" },
          { label: "IQ", href: "/products/iq" },
          { label: "Connect", href: "/connect" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],

    // Legal pages belong to Aurify Connect, not to Aurify Technology as a
    // whole - they govern the WhatsApp module inside Bullion Pro. Meta
    // requires them publicly reachable, so the footer adds this column on
    // /connect routes only, never site-wide.
    connectColumn: {
      title: "Connect Legal",
      links: [
        { label: "Privacy Policy", href: "/connect/privacy-policy" },
        { label: "Terms & Conditions", href: "/connect/terms-and-conditions" },
        { label: "Data Deletion Requests", href: "/connect/data-deletion-requests" },
      ],
    },

    legalNote: "Aurify Technology. All rights reserved.",
  },
} as const;
