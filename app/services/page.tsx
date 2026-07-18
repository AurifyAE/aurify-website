import type { Metadata } from "next";
import { services } from "@/lib/content/services";
import PageHero from "@/components/ui/PageHero";
import CtaRow from "@/components/ui/CtaRow";
import ServiceBlocks from "@/components/sections/services/ServiceBlocks";

export const metadata: Metadata = {
  title: "Services",
  description: services.hero.subline,
  openGraph: { title: "Aurify Services", description: services.hero.subline },
};

export default function ServicesPage() {
  return (
    <div className="pb-section">
      <PageHero
        eyebrow={services.hero.eyebrow}
        headline={services.hero.headline}
        subline={services.hero.subline}
      />
      <ServiceBlocks />
      <CtaRow
        line={services.cta.line}
        label={services.cta.button.label}
        href={services.cta.button.href}
      />
    </div>
  );
}
