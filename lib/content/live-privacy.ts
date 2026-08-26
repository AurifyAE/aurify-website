import type { LegalSection } from "@/lib/content/legal";

const sections: LegalSection[] = [
  {
    number: "1",
    title: "Information We Collect",
    paragraphs: [
      "Aurify Live is designed to provide its core services without requiring users to create an account or provide personal information.",
      "We do not require you to provide information such as:",
    ],
    items: [
      "Name",
      "Email address",
      "Phone number",
      "Physical address",
      "Profile information",
      "Username",
      "Password",
      "Login credentials",
    ],
    afterItems: [
      "We do not intentionally collect personal information for advertising, marketing, analytics, or user profiling purposes.",
    ],
    subsections: [
      {
        title: "Notification and Rate Alert Information",
        paragraphs: [
          "When you configure a rate alert, we may process and store certain information necessary to provide that functionality.",
          "This may include:",
        ],
        items: [
          'A Firebase Cloud Messaging ("FCM") registration token or similar notification identifier associated with your application installation.',
          "Your rate alert preferences and settings, including the rates, conditions, currencies, or other alert criteria you configure within the application.",
        ],
        afterItems: [
          "This information is used solely to provide and manage the rate alert functionality and to deliver notifications to the appropriate application installation.",
          "The FCM token is a technical identifier associated with the application installation and is not used by us to identify you by name, create a personal profile, or track your activity across other applications or websites.",
        ],
      },
    ],
  },
  {
    number: "2",
    title: "No Account or Authentication Required",
    paragraphs: [
      "Aurify Live does not require users to create an account or log in to access its core functionality.",
      "We do not collect usernames, passwords, or other account authentication credentials for the use of Aurify Live.",
    ],
  },
  {
    number: "3",
    title: "Live Rate Services",
    paragraphs: [
      "Aurify Live provides live and real-time rate information.",
      "To provide this functionality, the application communicates with our services and may establish real-time network connections to receive updated rate information.",
      "These connections are used solely to provide live rate data and related functionality within the application.",
    ],
  },
  {
    number: "4",
    title: "Rate Alert Notifications",
    paragraphs: [
      "Aurify Live allows users to configure notifications based on selected rate conditions or preferences.",
      "To provide this functionality, your configured rate alert preferences may be associated with an FCM registration token or another technical notification identifier associated with your application installation.",
      "When the configured rate conditions are met, a notification may be sent to the corresponding application installation.",
      "You can modify or disable your rate alerts within the application, where such functionality is available. You can also manage or disable push notifications through your device or operating system settings.",
    ],
  },
  {
    number: "5",
    title: "How We Use Information",
    paragraphs: [
      "The technical notification identifiers and rate alert preferences described in this Privacy Policy are used only for purposes necessary to operate and provide Aurify Live, including:",
    ],
    items: [
      "Saving and managing your configured rate alert preferences.",
      "Determining when configured rate alert conditions are met.",
      "Delivering rate alert notifications to the appropriate application installation.",
      "Providing live rate information and related functionality.",
      "Maintaining the security, reliability, and operation of our services.",
    ],
    subsections: [
      {
        title: "We do not use this information for:",
        items: [
          "Targeted advertising.",
          "Behavioral advertising.",
          "Marketing profiling.",
          "Cross-app tracking.",
          "Cross-website tracking.",
          "Selling or renting user information.",
        ],
      },
    ],
  },
  {
    number: "6",
    title: "Analytics, Advertising, and Tracking",
    paragraphs: [
      "Aurify Live does not use Firebase Analytics or other analytics services to track user behavior within the application.",
      "We do not use advertising networks or advertising trackers to deliver targeted advertisements.",
      "We do not track users across applications or websites owned by other companies.",
    ],
  },
  {
    number: "7",
    title: "Location Information",
    paragraphs: [
      "Aurify Live does not request, access, or intentionally collect your precise or approximate location information.",
      "Location data is not required to use the core functionality of the application.",
    ],
  },
  {
    number: "8",
    title: "Data Sharing",
    paragraphs: [
      "Aurify Technology does not sell, rent, or trade user information.",
      "We do not share information with third parties for advertising or marketing purposes.",
      "However, certain technical information necessary to provide notifications may be processed through third-party service providers that support the operation of the application.",
      "For example, Firebase Cloud Messaging is used to deliver push notifications and rate alerts to the appropriate application installation.",
      "Such service providers process information as necessary to provide their services and support the functionality of Aurify Live.",
    ],
  },
  {
    number: "9",
    title: "Data Retention",
    paragraphs: [
      "Aurify Live does not maintain user accounts.",
      "Technical notification identifiers and associated rate alert preferences may be retained for as long as reasonably necessary to provide and maintain the rate alert functionality.",
      "We may remove or update such information when:",
    ],
    items: [
      "A notification token becomes invalid or expires.",
      "A notification registration is no longer active.",
      "The information is no longer required to provide the service.",
      "The associated rate alert settings are removed or no longer applicable.",
    ],
  },
  {
    number: "10",
    title: "Data Security",
    paragraphs: [
      "We take reasonable technical and organizational measures designed to protect information processed in connection with Aurify Live.",
      "We use appropriate measures to help protect the confidentiality, integrity, and availability of our services and the information necessary to operate them.",
      "However, no method of electronic transmission or storage is completely secure. While we take reasonable steps to protect information, we cannot guarantee absolute security.",
    ],
  },
  {
    number: "11",
    title: "International Use",
    paragraphs: [
      "Aurify Live may be accessed and used by individuals located in different countries and regions.",
      "Information necessary to operate the service may be processed through infrastructure or service providers located in different jurisdictions.",
      "By using Aurify Live, you understand that information may be processed in accordance with this Privacy Policy and applicable laws.",
    ],
  },
  {
    number: "12",
    title: "Children's Privacy",
    paragraphs: [
      "Aurify Live is available for general use and is not specifically directed toward children.",
      "We do not knowingly require users to provide personal information to access the core functionality of the application.",
      "If you believe that personal information has been unintentionally provided to us through Aurify Live, please contact us using the information provided below.",
    ],
  },
  {
    number: "13",
    title: "White-Label Applications",
    paragraphs: [
      "Aurify Technology may provide the Aurify Live platform under different client-specific names, branding, or configurations.",
      "These applications may use the same underlying technology and services described in this Privacy Policy.",
      "Unless a separate privacy policy is explicitly provided for a specific application or service, this Privacy Policy applies to the privacy practices of Aurify Technology in connection with those white-label versions of the Aurify Live platform.",
    ],
  },
  {
    number: "14",
    title: "Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes to our services, technology, legal requirements, or privacy practices.",
      'When we make changes, we will update the "Last Updated" date at the top of this Privacy Policy.',
      "We encourage users to review this Privacy Policy periodically.",
    ],
  },
  {
    number: "15",
    title: "Contact Us",
    paragraphs: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or the privacy practices of Aurify Live, you may contact us at:",
    ],
    contact: {
      email: "developer@aurify.ae",
      emailHref: "mailto:developer@aurify.ae",
      company: "Aurify Technology",
      displayCompanyPrefix: false,
      website: "aurify.global",
      websiteHref: "https://aurify.global",
    },
  },
];

export const livePrivacyPolicy = {
  meta: {
    product: "Aurify Live",
    company: "Aurify Technology",
    lastUpdated: "August 24, 2026",
  },
  hero: {
    eyebrow: "Legal",
    headline: "Privacy Policy",
    subline:
      "How Aurify Technology handles information when you use Aurify Live and its related applications, website, and white-label services.",
  },
  intro: [
    'Aurify Technology ("Aurify", "we", "us", or "our") operates Aurify Live, including its mobile applications, website, and related white-label services.',
    "Aurify Live provides access to live rate information and allows users to configure rate alerts. This Privacy Policy explains how information is handled when you use Aurify Live and related applications or services operated by Aurify Technology.",
  ],
  sections,
};
