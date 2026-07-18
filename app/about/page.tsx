import type { Metadata } from "next";
import { about } from "@/lib/content/about";
import PageHero from "@/components/ui/PageHero";
import CtaRow from "@/components/ui/CtaRow";
import AboutStory from "@/components/sections/about/AboutStory";
import MissionVision from "@/components/sections/about/MissionVision";
import Approach from "@/components/sections/about/Approach";
import ValuesGrid from "@/components/sections/about/ValuesGrid";
import TrustBand from "@/components/sections/about/TrustBand";
import TeamScale from "@/components/sections/about/TeamScale";

export const metadata: Metadata = {
  title: "About",
  description: about.hero.subline,
  openGraph: { title: "About Aurify Technology", description: about.hero.subline },
};

export default function AboutPage() {
  return (
    <div className="pb-section">
      <PageHero
        eyebrow={about.hero.eyebrow}
        headline={about.hero.headline}
        highlight={about.hero.highlight}
        subline={about.hero.subline}
      />
      <AboutStory />
      <MissionVision />
      <Approach />
      <ValuesGrid />
      <TrustBand />
      <TeamScale />
      <CtaRow
        line="Talk to the team building it."
        label="Talk to Us"
        href="/contact"
      />
    </div>
  );
}
