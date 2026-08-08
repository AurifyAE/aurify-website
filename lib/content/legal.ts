/**
 * Legal copy - Aurify Connect (the WhatsApp Business messaging module inside
 * Bullion Pro) privacy policy, terms of service, and data deletion
 * instructions, integrated verbatim from the approved legal documents (July
 * 2026). The privacy policy and data deletion pages are the public URLs Meta
 * requires for the WhatsApp Embedded Signup app review.
 */

interface Definition {
  term: string;
  text: string;
}

interface Subsection {
  title: string;
  intro?: string;
  items?: string[];
  outro?: string;
}

interface LegalSection {
  number: string;
  title: string;
  paragraphs?: string[];
  definitions?: Definition[];
  items?: string[];
  links?: Array<{
    label: string;
    href: string;
  }>;
  subsections?: Subsection[];
  outro?: string;
  contact?: {
    label?: string;
    email: string;
    emailHref: string;
    company: string;
    address?: string;
    note?: string;
  };
}

const sections: LegalSection[] = [
  {
    number: "1",
    title: "Definitions",
    definitions: [
      {
        term: "Service",
        text: "The Bullion Pro application operated by Aurify Technology L.L.C.",
      },
      {
        term: "Personal Data",
        text: "Information relating to an identified or identifiable living individual.",
      },
      {
        term: "Usage Data",
        text: "Information collected automatically through use of the Service, such as page visits, session duration, and device information.",
      },
      {
        term: "Data Controller",
        text: "The individual or organization that determines the purposes and means of processing personal data. For the purposes of this Privacy Policy, Aurify Technology L.L.C is the Data Controller.",
      },
      {
        term: "Data Processor",
        text: "Any individual or organization that processes personal data on behalf of the Data Controller.",
      },
    ],
  },
  {
    number: "2",
    title: "Information Collection and Use",
    paragraphs: [
      "We collect different types of information to provide, improve, and secure our Services.",
    ],
    subsections: [
      {
        title: "2.1 Personal Data",
        intro: "While using our Service, we may collect the following personal information:",
        items: [
          "Email address",
          "First and last name",
          "WhatsApp phone number",
          "Address",
          "State / Province",
          "ZIP / Postal Code",
          "City",
          "Social media login credentials (if connected)",
          "Cookies and Usage Data",
        ],
      },
      {
        title: "2.2 Usage Data",
        intro: "We may automatically collect information including:",
        items: [
          "IP address",
          "Browser type and version",
          "Pages visited",
          "Time spent on pages",
          "Device identifiers",
          "Diagnostic data",
        ],
      },
      {
        title: "2.3 Behavioral and Location Data",
        intro: "We may collect information regarding:",
        items: [
          "Platform activity",
          "Feature usage",
          "Template management",
          "General location derived from IP address",
        ],
        outro: "This information is used for analytics, performance improvements, and security.",
      },
      {
        title: "2.4 Contact Lists & Uploaded Files",
        intro: "You may upload or import:",
        items: ["Contact lists", "Images", "Audio files", "Videos", "Documents"],
        outro:
          "These files are used solely in connection with messaging and customer support features.",
      },
    ],
  },
  {
    number: "3",
    title: "Tracking & Cookies",
    paragraphs: ["We use cookies and similar technologies to improve your experience."],
    definitions: [
      { term: "Session Cookies", text: "Used to operate and maintain the Service." },
      { term: "Preference Cookies", text: "Used to remember your settings and preferences." },
      { term: "Security Cookies", text: "Used to help keep your account and data secure." },
    ],
  },
  {
    number: "4",
    title: "Use of Data",
    paragraphs: ["Aurify Technology L.L.C uses collected information to:"],
    items: [
      "Provide and maintain the Service",
      "Connect WhatsApp Business accounts through Meta's Embedded Signup",
      "Manage inboxes, messaging, templates, and analytics",
      "Provide customer support",
      "Monitor platform usage",
      "Detect, prevent, and investigate fraud or technical issues",
    ],
  },
  {
    number: "5",
    title: "Legal Basis for Processing",
    paragraphs: ["We process Personal Data based on one or more of the following legal grounds:"],
    items: [
      "Your consent",
      "Performance of a contract",
      "Legitimate business interests",
      "Compliance with legal obligations",
    ],
  },
  {
    number: "6",
    title: "Retention and Transfer of Data",
    paragraphs: [
      "We retain your Personal Data only for as long as necessary to fulfill the purposes described in this Privacy Policy.",
      "Your information may be transferred to and processed in countries outside your country of residence where data protection laws may differ from those in your jurisdiction.",
    ],
  },
  {
    number: "7",
    title: "Disclosure of Data",
    paragraphs: ["We may disclose Personal Data where necessary to:"],
    items: [
      "Comply with legal obligations",
      "Protect the rights or property of Aurify Technology L.L.C",
      "Prevent fraud or other unlawful activities",
      "Protect the safety of our users and the public",
    ],
  },
  {
    number: "8",
    title: "Your Data Protection Rights",
    paragraphs: ["Depending on your location and applicable law, you may have the right to:"],
    items: [
      "Access your Personal Data",
      "Update or correct your Personal Data",
      "Request deletion of your Personal Data",
      "Object to certain processing activities",
      "Request data portability",
      "Withdraw previously given consent",
    ],
    outro:
      "To exercise these rights, please contact us at info@aurify.ae. You may also submit a request for data deletion.",
  },
  {
    number: "9",
    title: "Security of Data",
    paragraphs: [
      "We use commercially reasonable administrative, technical, and organizational safeguards to protect your Personal Data.",
      "However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    number: "10",
    title: "Children's Privacy",
    paragraphs: [
      "Our Service is not intended for individuals under the age of 18.",
      "We do not knowingly collect Personal Data from anyone under the age of 18.",
    ],
  },
  {
    number: "11",
    title: "Contact Us",
    paragraphs: [
      "If you have any questions regarding this Privacy Policy or your personal data, please contact us.",
    ],
    contact: {
      email: "info@aurify.ae",
      emailHref: "mailto:info@aurify.ae",
      company: "Aurify Technology L.L.C",
      address: "Dubai Branch, Building-1-141, Mankhool, Makani No. 2851194466, Dubai",
    },
  },
];

const termsSections: LegalSection[] = [
  {
    number: "1",
    title: "Acceptance of Terms",
    paragraphs: [
      "Aurify Connect (the “Module,” “Feature,” or “Aurify Connect”) is a WhatsApp Business messaging and client communication module offered as part of Bullion Pro, owned and operated by Aurify Technology L.L.C.",
      "This Agreement governs your access to and use of the Platform and the Services.",
    ],
    subsections: [
      {
        title: "Eligibility & Authority — Individual Users",
        intro: "If you are using the Services for your own purposes, you represent and warrant that:",
        items: [
          "You are at least 18 years of age or have reached the age of majority in your jurisdiction.",
          "You have the legal capacity to enter into this Agreement.",
        ],
      },
      {
        title: "Eligibility & Authority — Business Users",
        intro: "If you use the Services on behalf of a company or organization, you represent and warrant that:",
        items: [
          "You have the authority to bind that entity to this Agreement.",
          "The entity agrees to comply with these Terms.",
        ],
      },
      {
        title: "Agreement Effective Date",
        intro: "This Agreement becomes effective upon the earliest of:",
        items: [
          "Accessing or using the Services.",
          "Clicking an “I Accept,” “Sign Up,” or similar button indicating acceptance.",
        ],
        outro:
          "By using the Services, you also consent to the collection, storage, use, and processing of your information in accordance with our Privacy Policy.",
      },
    ],
    outro:
      "This Agreement constitutes an electronic record in accordance with UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services. It is also intended to comply with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and other applicable UAE laws and regulations, where applicable.",
  },
  {
    number: "2",
    title: "Aurify Services",
    paragraphs: [
      "Aurify Connect provides a secure cloud-hosted communication module that enables businesses to manage and centralize customer conversations.",
      "The Module supports integrations and workflows for WhatsApp Business and other supported messaging channels, subject to the availability and policies of third-party providers such as Meta and WhatsApp.",
      "The Services may include:",
    ],
    items: [
      "Unified WhatsApp communication management",
      "Shared team inbox and conversation management",
      "Broadcast and bulk messaging tools (where permitted)",
      "Contact management and audience segmentation",
      "Template management",
      "Workflow automation",
      "Chatbot or automated reply features",
      "Usage analytics and reporting",
    ],
    subsections: [
      {
        title: "Third-Party Dependency",
        intro:
          "The Platform relies on third-party services and infrastructure that are outside the control of Aurify Technology L.L.C. Changes to the policies, pricing, APIs, availability, or technical limitations of Meta, WhatsApp, or other providers may affect the functionality or availability of the Services.",
      },
    ],
  },
  {
    number: "3",
    title: "Fees, Billing & Payments",
    subsections: [
      {
        title: "3.1 Custom Pricing",
        intro:
          "Aurify Connect is offered as part of a client's Bullion Pro subscription and is not available for self-service purchase. Access to the Services, including applicable fees, is agreed between the client and Aurify Technology L.L.C. on a custom basis, based on the client's business requirements, and set out in a separate order form, proposal, or commercial agreement (“Agreement”) signed by both parties. Fees may vary by client and are not published on the Website or App.",
      },
      {
        title: "3.2 Meta & WhatsApp Charges",
        intro:
          "Charges imposed directly by Meta, WhatsApp, or other third-party providers — including conversation-based, messaging, template, or usage-based charges — are separate from any fees payable to Aurify Technology L.L.C. under the Agreement, unless expressly stated otherwise in writing. The Company does not control, and assumes no responsibility for, Meta's pricing, billing policies, or any changes to them.",
      },
      {
        title: "3.3 Invoicing and Payment",
        intro:
          "Invoices are issued in accordance with the payment terms set out in the client's Agreement. Unless otherwise agreed in writing, invoices are payable within 15 days from the invoice date.",
      },
      {
        title: "3.4 Non-Payment",
        intro:
          "Failure to pay any invoice by its due date may result in suspension, restriction, or termination of access to the Services, at the Company's discretion, following reasonable notice to the client.",
      },
      {
        title: "3.5 Refunds",
        intro:
          "Fees paid under an Agreement are non-refundable unless otherwise expressly agreed in writing between the client and the Company.",
      },
    ],
  },
  {
    number: "4",
    title: "WhatsApp Business API Compliance",
    paragraphs: [
      "You acknowledge that Aurify Connect is an independent module of Bullion Pro, operated by Aurify Technology L.L.C, and is not a Meta Solution Partner, WhatsApp Solution Provider, or official technology partner unless expressly stated otherwise.",
      "Your use of WhatsApp-related features is subject to the current terms, policies, and technical limitations imposed by Meta and WhatsApp. You agree to comply with:",
    ],
    links: [
      {
        label: "WhatsApp Business Policy",
        href: "https://whatsappbusiness.com/policy/",
      },
      {
        label: "WhatsApp Business Solution Terms",
        href: "https://www.whatsapp.com/legal/business-solution-terms",
      },
      {
        label: "WhatsApp Commerce Policy",
        href: "https://whatsappbusiness.com/policy/#policy-for-whatsapp-commerce-features-including-offering-goods-or-services-for-sale",
      },
    ],
    subsections: [
      {
        title: "Account Responsibility",
        intro:
          "You are solely responsible for ensuring compliance with Meta and WhatsApp policies. Violation of these policies may result in restrictions or suspension of your WhatsApp account. Aurify Technology L.L.C shall not be liable for any suspension, limitation, or termination imposed by Meta or WhatsApp.",
      },
    ],
  },
  {
    number: "5",
    title: "Intellectual Property Rights",
    paragraphs: [
      "All copyrights, trademarks, database rights, software, designs, graphics, logos, documentation, and other intellectual property associated with the Platform and Services are owned by Aurify Technology L.L.C, its affiliates, or licensors.",
      "Subject to this Agreement, the Company grants you a limited, non-exclusive, non-transferable license to access and use the Platform solely for your internal business purposes, for the duration of your subscription, subject to earlier termination as set out in this Agreement.",
      "You may not:",
    ],
    items: [
      "Copy or reproduce the Platform.",
      "Reverse engineer or modify the Services.",
      "Extract substantial amounts of data.",
      "Use automated tools such as bots, spiders, or scrapers to access the Platform.",
      "Create derivative or competing products based on the Services.",
    ],
  },
  {
    number: "6",
    title: "Representations and Warranties",
    paragraphs: ["You represent and warrant that:"],
    items: [
      "You have the legal authority to enter into this Agreement.",
      "You will comply with all applicable laws.",
      "You will not attempt to compromise the security of the Platform.",
      "You will not use the Services for unlawful, fraudulent, or harmful activities.",
      "You will not create copies, clones, or imitations of the Platform without prior written permission from the Company.",
    ],
  },
  {
    number: "7",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, Aurify Technology L.L.C, its affiliates, employees, and licensors shall not be liable for any:",
    ],
    items: [
      "Direct damages",
      "Indirect damages",
      "Incidental damages",
      "Special damages",
      "Consequential damages",
      "Loss of profits",
      "Loss of revenue",
      "Loss of business opportunities",
      "Loss of data",
    ],
    subsections: [
      {
        title: "Additional Exclusions",
        intro: "The Company shall also not be responsible for:",
        items: [
          "Service interruptions caused by third-party providers.",
          "Downtime resulting from Meta, WhatsApp, cloud infrastructure, internet providers, or telecommunications failures.",
          "Unauthorized access resulting from your failure to maintain the confidentiality of your account credentials.",
        ],
      },
    ],
  },
  {
    number: "8",
    title: "Force Majeure",
    paragraphs: [
      "The Company shall not be liable for delays or failures in performance caused by circumstances beyond its reasonable control, including but not limited to:",
    ],
    items: [
      "Natural disasters",
      "War",
      "Terrorism",
      "Government actions",
      "Internet outages",
      "Telecommunications failures",
      "Power failures",
      "Civil unrest",
      "Any other force majeure event",
    ],
  },
  {
    number: "9",
    title: "General Provisions",
    subsections: [
      {
        title: "Entire Agreement",
        intro:
          "This Agreement constitutes the complete understanding between you and the Company regarding the Services and supersedes all prior agreements and communications relating to its subject matter.",
      },
      {
        title: "Governing Law",
        intro:
          "This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates.",
      },
    ],
  },
  {
    number: "10",
    title: "Contact",
    paragraphs: ["If you have any questions regarding this Agreement, please contact us."],
    contact: {
      email: "info@aurify.ae",
      emailHref: "mailto:info@aurify.ae",
      company: "Aurify Technology L.L.C",
      address: "Dubai Branch, Building-1-141, Mankhool, Makani No. 2851194466, Dubai",
    },
  },
];

const dataDeletionSections: LegalSection[] = [
  {
    number: "1",
    title: "How to Request Deletion",
    subsections: [
      {
        title: "Step 1 — Email Us",
        intro: "Send a deletion request to our privacy contact using the email below.",
      },
      {
        title: "Step 2 — Include the Required Details",
        intro:
          "Please include the information below so we can identify your account and process your request safely:",
        items: [
          "Your full name",
          "Your WhatsApp number or email address used with Bullion Pro",
          "The business name or account name, if applicable",
          "A clear request to delete your data",
        ],
      },
      {
        title: "Step 3 — Verification",
        intro:
          "We may ask for limited information to verify your identity before deleting data, especially where required to protect account security and prevent unauthorized deletion.",
      },
      {
        title: "Step 4 — Processing Time",
        intro:
          "After verification, we will delete or anonymize applicable personal data within a reasonable period, unless we must retain certain records for legal, tax, security, or compliance purposes.",
      },
    ],
    outro:
      "Some records may be retained where required by law or for legitimate business purposes such as dispute resolution, fraud prevention, billing, security, or compliance logging.",
  },
  {
    number: "2",
    title: "Contact",
    paragraphs: ["Send your deletion request here:"],
    contact: {
      label: "Aurify Data Deletion Requests",
      company: "Aurify Technology L.L.C",
      email: "info@aurify.ae",
      emailHref: "mailto:info@aurify.ae?subject=Aurify%20Data%20Deletion%20Request",
      note:
        "Use the subject line “Aurify Data Deletion Request” and include the required details listed in Step 2 above.",
    },
  },
];

export const legal = {
  dataDeletion: {
    meta: {
      product: "Bullion Pro",
      company: "Aurify Technology L.L.C",
      lastUpdated: "29 July 2026",
    },

    hero: {
      eyebrow: "Legal",
      headline: "Data Deletion Requests",
      subline:
        "How to request deletion of the personal data Aurify Technology L.L.C holds about you in connection with Bullion Pro.",
    },

    intro: [
      "If you used Bullion Pro or communicated with Aurify Technology L.L.C via our website, WhatsApp, email, or phone, you may request deletion of your personal data by following the steps below.",
      "Under applicable data protection laws, you have the right to request deletion of personal data we hold about you in connection with Bullion Pro or your communications with Aurify Technology L.L.C. This page explains how to submit that request and what to expect during processing.",
      "For broader information on how we collect and use data, see our Privacy Policy.",
    ],

    sections: dataDeletionSections,
  },

  termsOfService: {
    meta: {
      product: "Bullion Pro",
      company: "Aurify Technology L.L.C",
      lastUpdated: "29 July 2026",
    },

    hero: {
      eyebrow: "Legal",
      headline: "Terms & Conditions",
      subline:
        "The terms and conditions governing your purchase of, and use of, Aurify Connect and related Services provided by Aurify Technology L.L.C.",
    },

    intro: [
      "This Terms of Service (“Agreement”) contains the terms and conditions governing your purchase of, and use of, subscriptions to, and use of, Aurify Connect and related Services provided by Aurify Technology L.L.C (hereinafter referred to as “Aurify Technology L.L.C,” “Company,” “we,” “us,” or “our”).",
      "This Agreement is a legally binding contract between the Company and you, or the entity or organization that you represent.",
    ],

    sections: termsSections,
  },

  privacyPolicy: {
    meta: {
      product: "Bullion Pro",
      company: "Aurify Technology L.L.C",
      lastUpdated: "29 July 2026",
    },

    hero: {
      eyebrow: "Legal",
      headline: "Privacy Policy",
      subline:
        "How Aurify Connect - the WhatsApp Business messaging and client communication module inside Bullion Pro - collects, uses and protects your information.",
    },

    intro: [
      "Aurify Connect (the “Module,” “Feature,” or “Aurify Connect”) is a WhatsApp Business messaging and client communication module offered as part of Bullion Pro, the product developed and operated by Aurify Technology L.L.C (hereinafter referred to as “we,” “us,” or “our”). Aurify Connect is not available as a standalone product and is accessed exclusively through a subscribing client’s Bullion Pro account.",
      "This Privacy Policy explains what information we collect, why we collect it, how we use it, and how we protect it. We take the protection of your information seriously and are committed to safeguarding the personal information in our possession.",
      "This document constitutes an electronic record in accordance with UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services. This Policy is also issued in accordance with applicable UAE data protection laws, including Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL), and, where applicable, international regulations such as the General Data Protection Regulation (GDPR).",
    ],

    sections,
  },
};
