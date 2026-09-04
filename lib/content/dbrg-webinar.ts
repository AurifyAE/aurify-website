export const dbrgWebinar = {
  registrationUrl:
    "https://events.teams.microsoft.com/event/1bce4bf8-862a-46be-8b42-9d680e562c4a@8eae87ad-0b0c-433b-9bb9-14336673dfc3?source=copyLinkOneEventsShareDialog",
  organisationName: "Dubai Business Group for Bullion & Gold Refinery",
  hero: {
    series: "DBRG Expert Live Webinar Series Invite",
    headline: "E-Invoicing Essentials",
    subline: "Preparing for the Digital Tax Future",
    introduction:
      "Ensure your financial operations and system integrations remain fully compliant. Join DBRG and industry specialists for an exclusive webinar.",
    cta: "Register now",
  },
  details: [
    { label: "Date", value: "Thursday, September 10, 2026" },
    { label: "Time", value: "3:30 PM GST" },
    { label: "Duration", value: "1 hour" },
    { label: "Platform", value: "Microsoft Teams" },
    { label: "Format", value: "Presentation and Q&A" },
  ],
  organisers: [
    {
      label: "Organised by",
      value: "DBRG",
      logo: "/images/dbrg/dbrg-logo.png",
      logoWidth: 820,
      logoHeight: 889,
      logoClass: "h-20 w-auto mix-blend-multiply",
    },
    {
      label: "Contributing Team Member & Compliance Partner",
      value: "Suntech",
      logo: "/images/dbrg/suntech-logo.svg",
      logoWidth: 1440,
      logoHeight: 800,
      logoClass: "h-12 w-auto max-w-full",
    },
  ],
  overview: {
    title: "Practical Strategies for Corporate Readiness & Compliance",
    objective:
      "This webinar will educate stakeholders on e-invoicing requirements, compliance obligations and implementation best practices to support a seamless transition to digital invoicing.",
    takeawayTitle: "What you will take away",
    takeaway:
      "Participants will gain practical insights into e-invoicing requirements, compliance expectations, implementation considerations and the actions needed to prepare their organizations for a successful transition.",
  },
  agenda: [
    {
      duration: "10 minutes",
      title: "Introduction",
      presenter: "DBRG",
      logo: "/images/dbrg/dbrg-logo.png",
      logoWidth: 820,
      logoHeight: 889,
      logoClass: "h-20 w-auto mix-blend-multiply",
    },
    {
      duration: "40 minutes",
      title: "Technical Session",
      presenter: "Suntech",
      logo: "/images/dbrg/suntech-logo.svg",
      logoWidth: 1200,
      logoHeight: 400,
      logoClass: "h-12 w-auto max-w-36",
    },
    {
      duration: "10 minutes",
      title: "Questions and Answers",
      presenter: "",
      logo: null,
      logoWidth: 0,
      logoHeight: 0,
      logoClass: "",
    },
  ],
  speakers: [
    {
      name: "Shabnam Ebrahim",
      role: "General Manager, DBRG",
      contribution: "Moderator and Host",
    },
    {
      name: "Hussein Osman",
      role: "CMO, MAH GOLD | DBRG Board Member",
      contribution: "Webinar Chairperson",
    },
    {
      name: "Tushar Gupta",
      role: "Executive Director | Head of Compliance Strategy, Suntech",
      contribution: "Technical Speaker",
    },
  ],
  attendance: "Approximately 75 attendees expected",
  materials: "Presentation materials will be shared.",
} as const;
