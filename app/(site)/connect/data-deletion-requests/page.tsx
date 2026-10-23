import type { Metadata } from "next";
import { legal } from "@/lib/content/legal";
import PageHero from "@/components/ui/PageHero";
import DataDeletionBody from "@/components/sections/legal/DataDeletionBody";

const { hero } = legal.dataDeletion;

export const metadata: Metadata = {
  title: hero.headline,
  description: hero.subline,
  openGraph: {
    title: `${hero.headline} - Aurify Technology`,
    description: hero.subline,
  },
};

export default function DataDeletionRequestsPage() {
  return (
    <div className="pb-section">
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} subline={hero.subline} />
      <DataDeletionBody />
    </div>
  );
}
