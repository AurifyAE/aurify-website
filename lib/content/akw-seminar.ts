/**
 * AKW Consultants x Aurify Technology E-Invoicing Seminar,
 * 10 October 2026, Hyatt Regency Deira, Dubai.
 */

export const akwSeminar = {
  // Paste the RSVP/registration link here. While it is empty, the page and
  // the events card show the seminar details without a Register button.
  registrationUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSfZv3ipRF0lnWcjDO66FRVITv_zz9IQhWxIi-1SMzplrT36mA/viewform",
  partnerName: "AKW Consultants",
  attendanceNote: "Attendance is limited to registered participants only.",
  hero: {
    series: "AKW Consultants & Aurify Technology",
    headline: "E-Invoicing Seminar",
    subline: "An evening on e-invoicing for the precious metals industry",
    introduction:
      "Join AKW Consultants and Aurify Technology for an in-person evening on e-invoicing, digital transformation and the operational challenges facing the precious metals industry - followed by a panel discussion, dinner and networking.",
    cta: "Reserve your spot",
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
  },
  agenda: [
    {
      time: "5:00 - 5:30 PM",
      title: "Registration & Welcome Refreshments",
      ledBy: "Event team",
      points: [
        "Guest reception, registration and badge collection",
        "Welcome refreshments and early networking",
      ],
    },
    {
      time: "5:30 - 5:35 PM",
      title: "Welcome Address",
      ledBy: "Host / MC",
      points: [
        "Welcome to guests and introduction of the hosts",
        "Purpose of the evening and overview of the programme",
      ],
    },
    {
      time: "5:35 - 6:00 PM",
      title: "Technology Session: Digital Transformation & E-Invoicing Readiness",
      ledBy: "Aurify Technology",
      points: [
        "Introduction to Aurify Technology and BullionPro",
        "The new world of digital transformation and its relevance to the precious metals industry",
        "How e-invoicing fits into bullion trading, refining and jewellery workflows",
      ],
    },
    {
      time: "6:00 - 6:30 PM",
      title: "Regulatory Session: The UAE E-Invoicing Framework",
      ledBy: "AKW Consultants",
      points: [
        "Overview of the UAE e-invoicing framework",
        "Key areas of focus for precious metals businesses: compliance obligations, timelines and readiness",
        "Practical steps businesses should take now",
      ],
    },
    {
      time: "6:30 - 7:25 PM",
      title: "Panel Discussion: Industry Challenges",
      ledBy: "Moderated by AKW Consultants",
      points: [
        "Interactive discussion on key industry challenges with industry leaders",
        "Audience interaction and Q&A",
      ],
    },
    {
      time: "7:25 - 7:30 PM",
      title: "Closing Remarks & Vote of Thanks",
      ledBy: "AKW Consultants and Aurify Technology",
      points: [
        "Key takeaways from the sessions and panel",
        "Vote of thanks to speakers, panelists, partners and guests",
      ],
    },
    {
      time: "7:30 PM onwards",
      title: "Dinner & Networking",
      ledBy: "All guests",
      points: [
        "Dinner served",
        "Informal networking with speakers, panelists and industry peers",
      ],
    },
  ],
  panel: {
    title: "Panel discussion: Industry challenges",
    time: "6:30 - 7:25 PM",
    summary:
      "An interactive discussion with insights from industry leaders, closing with 15 minutes of audience Q&A.",
    // Add each photo to public/images/akw/panelists/ and set `photo` to its
    // path (e.g. "/images/akw/panelists/manit-shah.jpg"). While `photo` is
    // empty, the card shows the panelist's initials instead.
    panelists: [
      {
        name: "Manit M. Shah",
        role: "Group CEO",
        organisation: "Palm Holdings",
        photo: "/images/akw/panelists/manit-shah.jpg",
      },
      {
        name: "Michael Stafford",
        role: "Chief Executive Officer and Chief Financial Officer",
        organisation: "Rafmoh Group of Companies",
        photo: "/images/akw/panelists/michael-stafford.jpg",
      },
      {
        name: "Kirit Vadgama",
        role: "Head of Finance",
        organisation: "Emirates Gold DMCC",
        photo: "/images/akw/panelists/kirit-vadgama.jpg",
      },
    ] as { name: string; role: string; organisation: string; photo: string }[],
    themes: [
      "Readiness of the precious metals industry for e-invoicing",
      "Operational challenges: high transaction volumes, fixing and dealing, refining and consignment flows",
      "Finance and VAT considerations from a CFO's perspective",
      "The regulator's view on implementation and support for businesses",
      "Choosing and integrating the right technology",
    ],
  },
} as const;
