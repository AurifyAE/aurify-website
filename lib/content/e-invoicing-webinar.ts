export const eInvoicingWebinar = {
  registrationOpen: true,
  // Empty until the joining link is ready: the page then says the link is
  // coming and the events card hides its register button.
  registrationUrl: "",
  hero: {
    headline: "UAE E-Invoicing, Tax & Digital Compliance",
  },
  details: [
    { label: "Date", value: "Thursday, October 22, 2026" },
    { label: "Time", value: "8:00 PM GST onwards" },
    { label: "Duration", value: "1 hour" },
    { label: "Platform", value: "Microsoft Teams" },
    { label: "Host", value: "Aurify Technology" },
  ],
  overview: {
    title: "Key areas of discussion",
    topics: [
      "E-Invoicing Readiness with Bullion Pro",
      "Managing Unfixed Gold Deals under E-Invoicing",
      "Automated VAT & Reverse Charge Invoicing",
      "FTA Reporting, Tracking & Compliance",
    ],
  },
  speakers: [
    {
      name: "Lubna",
      role: "Project Manager, 3R Creative",
      contribution: "Moderator and Host",
    },
    {
      name: "Muneeb Cholayil",
      role: "Founder & CEO, Aurify Technology",
      contribution: "Speaker",
    },
  ],
} as const;
