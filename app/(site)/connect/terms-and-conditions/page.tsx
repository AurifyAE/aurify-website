import type { Metadata } from "next";
import { legal } from "@/lib/content/legal";
import PageHero from "@/components/ui/PageHero";
import TermsOfServiceBody from "@/components/sections/legal/TermsOfServiceBody";

const { hero } = legal.termsOfService;

export const metadata: Metadata = {
  title: hero.headline,
  description: hero.subline,
  openGraph: {
    title: `${hero.headline} - Aurify Technology`,
    description: hero.subline,
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="pb-section">
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} subline={hero.subline} />
      <TermsOfServiceBody />
    </div>
  );
}
