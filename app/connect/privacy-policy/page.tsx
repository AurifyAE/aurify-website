import type { Metadata } from "next";
import { legal } from "@/lib/content/legal";
import PageHero from "@/components/ui/PageHero";
import PrivacyPolicyBody from "@/components/sections/legal/PrivacyPolicyBody";

const { hero } = legal.privacyPolicy;

export const metadata: Metadata = {
  title: hero.headline,
  description: hero.subline,
  openGraph: {
    title: `${hero.headline} - Aurify Technology`,
    description: hero.subline,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-section">
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} subline={hero.subline} />
      <PrivacyPolicyBody />
    </div>
  );
}
