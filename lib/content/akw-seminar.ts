/**
 * AKW Consultants x Aurify Technology E-Invoicing Seminar,
 * 10 October 2026, Hyatt Regency Deira, Dubai.
 */

type Person = {
  label: string;
  name: string;
  role: string;
  organisation: string;
  photo: string;
};

export const akwSeminar = {
  partnerName: "AKW Consultants",
  hero: {
    series: "AKW Consultants & Aurify Technology",
    headline: "E-Invoicing Seminar",
    subline: "An evening on e-invoicing for the precious metals industry",
    introduction:
      "AKW Consultants and Aurify Technology hosted an in-person evening on e-invoicing, digital transformation and the operational challenges facing the precious metals industry - followed by a panel discussion, dinner and networking.",
  },
  overview: {
    title: "Digital transformation, e-invoicing and the industry's next step",
    objective:
      "The session introduced Aurify and the new world of digital transformation as it applies to the precious metals industry, followed by an AKW session on its key areas of focus and an interactive panel on the challenges the industry is working through.",
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
      ledBy: "Paarth Gandhi (MC) and Faisal Ahmed, AKW Consultants",
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
      ledBy: "Manali Chopra and Ahmad Nawaz, AKW Consultants",
      points: [
        "Overview of the UAE e-invoicing framework",
        "Key areas of focus for precious metals businesses: compliance obligations, timelines and readiness",
        "Practical steps businesses should take now",
      ],
    },
    {
      time: "6:30 - 7:25 PM",
      title: "Panel Discussion: Industry Challenges",
      ledBy: "Moderated by Michael Wharton, AKW Consultants",
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
    // While `photo` is empty, the card shows the person's initials instead.
    panelists: [
      {
        label: "Panelist",
        name: "Manit M. Shah",
        role: "Group CEO",
        organisation: "Palm Holdings",
        photo: "/images/akw/panelists/manit-shah.jpg",
      },
      {
        label: "Panelist",
        name: "Michael Stafford",
        role: "Chief Executive Officer and Chief Financial Officer",
        organisation: "Rafmoh Group of Companies",
        photo: "/images/akw/panelists/michael-stafford.jpg",
      },
      {
        label: "Panelist",
        name: "Kirit Vadgama",
        role: "Head of Finance",
        organisation: "Emirates Gold DMCC",
        photo: "/images/akw/panelists/kirit-vadgama.jpg",
      },
    ] as Person[],
    themes: [
      "Readiness of the precious metals industry for e-invoicing",
      "Operational challenges: high transaction volumes, fixing and dealing, refining and consignment flows",
      "Finance and VAT considerations from a CFO's perspective",
      "The regulator's view on implementation and support for businesses",
      "Choosing and integrating the right technology",
    ],
  },
  speakers: [
    {
      label: "Opening Remarks",
      name: "Faisal Ahmed",
      role: "Managing Partner & CEO",
      organisation: "AKW Consultants",
      photo: "/images/akw/speakers/faisal-ahmed.jpg",
    },
    {
      label: "MC",
      name: "Paarth Gandhi",
      role: "Director | Strategy & Risk Advisory",
      organisation: "AKW Consultants",
      photo: "/images/akw/speakers/paarth-gandhi.jpg",
    },
    {
      label: "Speaker",
      name: "Manali Chopra",
      role: "Director | Regulatory Compliance & Tax Advisory",
      organisation: "AKW Consultants",
      photo: "/images/akw/speakers/manali-chopra.jpg",
    },
    {
      label: "Speaker",
      name: "Ahmad Nawaz",
      role: "Manager | Accounting, Audit & Taxation",
      organisation: "AKW Consultants",
      photo: "/images/akw/speakers/ahmad-nawaz.jpg",
    },
    {
      label: "Moderator",
      name: "Michael Wharton",
      role: "Director | Business Strategy & Growth",
      organisation: "AKW Consultants",
      photo: "/images/akw/speakers/michael-wharton.jpg",
    },
  ] as Person[],
  gallery: {
    // Full set of event photos; the page shows only the highlights below.
    albumUrl: "https://photos.app.goo.gl/V7519rxYvghwGpzw6",
    albumCount: 675,
    // All 2000x1333 (3:2 landscape), resized from the camera originals.
    photos: [
      {
        src: "/images/akw/gallery/dsc08445.jpg",
        alt: "Muneeb Cholayil, CEO and Founder of Aurify Technology, speaking at the podium",
      },
      {
        src: "/images/akw/gallery/dsc08741.jpg",
        alt: "Speakers and panellists together on stage after the panel discussion",
      },
      {
        src: "/images/akw/gallery/dsc08684.jpg",
        alt: "Panel discussion on industry challenges in e-invoicing operations",
      },
      {
        src: "/images/akw/gallery/dsc08711.jpg",
        alt: "Panellists answering questions on stage during the discussion",
      },
      {
        src: "/images/akw/gallery/dsc08412.jpg",
        alt: "Attendees seated in the ballroom ahead of the seminar sessions",
      },
      {
        src: "/images/akw/gallery/dsc08297.jpg",
        alt: "Guests checking in at the AKW Consultants and Aurify seminar reception",
      },
      {
        src: "/images/akw/gallery/dsc08276.jpg",
        alt: "Aurify team welcoming guests at the E-Invoicing Seminar registration desk",
      },
      {
        src: "/images/akw/gallery/dsc08291.jpg",
        alt: "Red carpet entrance lined with Aurify and AKW banners at Hyatt Regency Dubai",
      },
      {
        src: "/images/akw/gallery/dsc08866.jpg",
        alt: "Aurify and AKW Consultants gift bags lined up for guests",
      },
    ],
  },
} as const;
