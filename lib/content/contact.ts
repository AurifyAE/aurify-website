/**
 * Contact page copy.
 */

export const contact = {
  hero: {
    eyebrow: "Contact",
    headline: "Let’s talk.",
    subline:
      "Whether you run a desk, a refinery or a vault - we’d like to hear how you work.",
  },

  offices: [
    {
      city: "Dubai",
      role: "Headquarters",
      lines: ["Suite No:1006, 10th Floor, Block A, Al Rayyan Building,", "Al Nahda, Dubai, UAE"],
      phone: "+971 58 502 3411",
      phoneHref: "tel:+971585023411",
    },
    {
      city: "Kozhikode",
      role: "Engineering hub",
      lines: [
        "2109, First Floor, Tower 2",
        "HiLite Business Park",
        "Kozhikode, Kerala 673014, India",
      ],
    },
  ],

  form: {
    title: "Send us a message",
    fields: {
      name: { label: "Name", placeholder: "Your name" },
      email: { label: "Work email", placeholder: "you@company.com" },
      company: { label: "Company", placeholder: "Company name" },
      phone: { label: "Phone number", placeholder: "50 123 4567" },
      message: { label: "Message", placeholder: "What are you looking to build or fix?" },
    },
    submitLabel: "Send Message",
    success: "Thank you - we’ll be in touch shortly.",
    error: "Something went wrong. Please try again or email us directly.",
  },

  thankYou: {
    eyebrow: "Contact",
    headline: "Thank you",
    message:
      "Your enquiry has been received. Our team will be in touch shortly to understand your requirements and explore how we can assist you.",
    backLabel: "Back to home",
    backHref: "/",
  },
};
