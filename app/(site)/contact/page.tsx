import type { Metadata } from "next";
import { contact } from "@/lib/content/contact";
import PageHero from "@/components/ui/PageHero";
import ContactPanel from "@/components/sections/contact/ContactPanel";

export const metadata: Metadata = {
  title: "Contact",
  description: contact.hero.subline,
  openGraph: { title: "Contact Aurify Technology", description: contact.hero.subline },
};

export default function ContactPage() {
  return (
    <div className="pb-section">
      <PageHero
        eyebrow={contact.hero.eyebrow}
        headline={contact.hero.headline}
        subline={contact.hero.subline}
      />
      <ContactPanel />
    </div>
  );
}
