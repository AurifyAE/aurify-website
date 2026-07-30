/**
 * Aurify Connect - the WhatsApp Business messaging module inside Bullion
 * Pro. Final copy integrated verbatim from the approved content brief
 * (July 2026). Drives /connect (standalone top-level route, not nested
 * under /products - Connect isn't one of the four core products).
 */

import type { ProductModule } from "@/lib/content/products";

export const connectMeta = {
  title: "Connect — WhatsApp Business Module — Aurify Technology",
  description:
    "Aurify Connect is the WhatsApp Business messaging module built into Bullion Pro — connect your number, manage every customer conversation, and automate engagement with chatbots, templates and broadcasts, without leaving your ERP.",
};

export const connectHero = {
  eyebrow: "A Module of Bullion Pro · Powered by the WhatsApp Business Platform",
  title: "Connect",
  subtitle: "Every Customer Conversation, Inside Bullion Pro.",
  intro:
    "Aurify Connect brings WhatsApp Business messaging natively into Bullion Pro. Connect your business number, manage every customer conversation from one inbox, and automate engagement with custom chatbots, templates, contact lists and broadcasting — all inside the same platform that already runs your trading, compliance and operations.",
  cta: { label: "Request a Demo", href: "/contact" },
};

export const connectModules: ProductModule[] = [
  {
    name: "Number Connection",
    summary:
      "Connect your existing WhatsApp Business number directly to Bullion Pro through Meta's official onboarding flow. No new number, no developer required.",
  },
  {
    name: "Unified Inbox",
    summary:
      "Every customer conversation, from every connected number, in one shared inbox. Assign chats, track status, and keep nothing lost between teams.",
  },
  {
    name: "Custom Chatbots",
    summary:
      "Automated conversation flows built around each client's business — answering common questions, qualifying enquiries, and routing chats to the right person, around the clock.",
  },
  {
    name: "Template Manager",
    summary:
      "Create, submit and track WhatsApp message templates for Meta approval, and reuse approved templates across broadcasts and automated replies.",
  },
  {
    name: "Lists & Segments",
    summary:
      "Organise customers into lists and groups — by interest, activity, or any custom criteria — so the right message always reaches the right audience.",
  },
  {
    name: "Broadcasting",
    summary:
      "Send approved template messages to entire lists or segments at once, with delivery and read tracking, for announcements, offers and updates.",
  },
  {
    name: "Custom Requests",
    summary:
      "Beyond the standard toolkit — bespoke chatbot logic, integrations and workflows built for clients who need something more specific.",
  },
];

export const connectWhy = {
  title: "Why Connect",
  text: "Every customer conversation is business data. Connect keeps WhatsApp inside the same system that already runs trading, compliance and operations — so client-facing messaging is never a separate, disconnected tool. Whether a client wants a simple shared inbox or a fully automated chatbot built to its own workflows, Connect scales to fit, without ever leaving Bullion Pro.",
};

export const connectHowItWorks = [
  {
    step: "Connect your number",
    summary:
      "Securely link your WhatsApp Business number using Meta's official embedded signup. Authenticate once and grant Connect access — no technical setup required.",
  },
  {
    step: "Set up templates, lists and chatbots",
    summary:
      "Build out message templates and submit them for Meta approval, import and segment your contacts, and configure a chatbot flow if you want conversations handled automatically.",
  },
  {
    step: "Manage, automate and broadcast",
    summary:
      "Handle live conversations from the unified inbox, let the chatbot take routine ones, and send broadcasts to lists using approved templates — all tracked in one place.",
  },
];

export const connectMessaging = {
  eyebrow: "Messaging Capabilities",
  windows: [
    {
      title: "Within 24 Hours",
      text: "When a customer messages first, your team — or your chatbot — can reply freely for 24 hours. No template required.",
    },
    {
      title: "Outside 24 Hours",
      text: "To re-engage a customer after that window, or to reach out first, Connect uses Meta-approved templates only — keeping every proactive message fully compliant.",
    },
  ],
};

export const connectIdealFor = {
  rows: [
    [
      { label: "Bullion traders & wholesalers", icon: "/icons/marquee/Icon 2.svg" },
      { label: "Refineries & producers", icon: "/icons/marquee/icon 3.svg" },
      { label: "Banks & financial institutions", icon: "/icons/marquee/Icon 6.svg" },
    ],
    [
      { label: "Investment houses & family offices", icon: "/icons/marquee/Icon 28.svg" },
      { label: "Retail & e-commerce platforms", icon: "/icons/marquee/Icon 10.svg" },
      {
        label: "Any Bullion Pro client managing customer communication at scale",
        icon: "/icons/marquee/Icon 9.svg",
      },
    ],
  ],
};

export const connectCompliance = {
  text: "Aurify Connect is powered by the WhatsApp Business Platform and Meta's official APIs. This module is not affiliated with Meta Platforms, Inc. and is subject to Meta app review for certain features. All messaging features operate in line with applicable WhatsApp Business Platform terms and policies. See our",
  links: [
    { label: "Privacy Policy", href: "/connect/privacy-policy" },
    { label: "Terms of Service", href: "/connect/terms-and-conditions" },
    { label: "Data Deletion", href: "/connect/data-deletion-requests" },
  ],
  after: "page for details on how data is handled.",
};

export const connectClosing = {
  headline: "Start managing WhatsApp inside Bullion Pro.",
  subline:
    "Connect your first number and see how conversations, templates and automation fit into the platform you already run on.",
  cta: { label: "Request a Demo", href: "/contact" },
};
