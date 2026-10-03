/**
 * AKW Consultants x Aurify Technology E-Invoicing Seminar,
 * 10 October 2026, Hyatt Regency Deira, Dubai.
 */

export const akwSeminar = {
  // Paste the RSVP/registration link here. While it is empty, the page and
  // the webinars card show the seminar details without a Register button.
  registrationUrl: "",
  partnerName: "AKW Consultants",
  attendanceNote: "Attendance is limited to registered participants only.",
  hero: {
    series: "AKW Consultants & Aurify Technology",
    headline: "E-Invoicing Seminar",
    subline: "An evening on e-invoicing for the precious metals industry",
    introduction:
      "Join AKW Consultants and Aurify Technology for an in-person evening on e-invoicing, digital transformation and the operational challenges facing the precious metals industry - followed by a panel discussion, dinner and networking.",
    cta: "Reserve your place",
  },
  details: [
    { label: "Date", value: "10 October 2026" },
    { label: "Time", value: "5:00 PM - 8:00 PM GST" },
    { label: "Venue", value: "Hyatt Regency, Deira, Dubai" },
    { label: "Format", value: "In-person seminar, panel and dinner" },
  ],
  overview: {
    title: "Digital transformation, e-invoicing and the industry's next step",
    objective:
      "The session introduces Aurify and the new world of digital transformation as it applies to the precious metals industry, followed by an AKW session on its key areas of focus and an interactive panel on the challenges the industry is working through.",
    takeawayTitle: "What the evening covers",
    takeaway:
      "An introduction to Aurify and digital transformation for precious metals, AKW's key areas of focus, and a panel discussion with industry leaders - with time for audience questions, dinner and networking.",
  },
  agenda: [
    {
      time: "5:00 - 5:30 PM",
      title: "Guest Arrival, Refreshments & Registration",
      points: ["Guest reception and registration", "Welcome refreshments"],
    },
    {
      time: "5:30 - 6:00 PM",
      title: "Aurify Introduction",
      points: [
        "Introduction to Aurify",
        "Overview of the new world of digital transformation and its relevance to the precious metals industry",
      ],
    },
    {
      time: "6:00 - 6:30 PM",
      title: "AKW Session",
      points: ["Introduction to the session", "Overview of key areas of focus"],
    },
    {
      time: "6:30 - 7:30 PM",
      title: "Panel Discussion - Industry Challenges",
      points: [
        "Interactive discussion on key industry challenges",
        "Insights and perspectives from industry leaders",
        "Audience interaction and Q&A",
      ],
    },
    {
      time: "7:30 PM onwards",
      title: "Dinner & Networking",
      points: ["Dinner", "Informal networking and closing interactions"],
    },
  ],
} as const;
