import type { Metadata } from "next";
import { livePrivacyPolicy } from "@/lib/content/live-privacy";
import PageHero from "@/components/ui/PageHero";
import PrivacyPolicyBody from "@/components/sections/legal/PrivacyPolicyBody";

const { hero } = livePrivacyPolicy;

export const metadata: Metadata = {
  title: hero.headline,
  description: hero.subline,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `${hero.headline} - Aurify Technology`,
    description: hero.subline,
    url: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-section">
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} subline={hero.subline} />
      <PrivacyPolicyBody policy={livePrivacyPolicy} />
    </div>
  );
}
