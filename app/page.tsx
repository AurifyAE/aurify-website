import dynamic from "next/dynamic";
import Hero from "@/components/sections/home/Hero";
import LifecycleStrip from "@/components/sections/home/LifecycleStrip";
import Opportunity from "@/components/sections/home/Opportunity";

// Below the fold - still server-rendered, but their client chunks load
// after the above-the-fold sections hydrate.
const ProblemInterlude = dynamic(
  () => import("@/components/sections/home/ProblemInterlude")
);
const Ecosystem = dynamic(() => import("@/components/sections/home/Ecosystem"));
const WhyAurify = dynamic(() => import("@/components/sections/home/WhyAurify"));
const Pillars = dynamic(() => import("@/components/sections/home/Pillars"));
const WhoWeServe = dynamic(
  () => import("@/components/sections/home/WhoWeServe")
);
const ClosingCta = dynamic(
  () => import("@/components/sections/home/ClosingCta")
);

export default function Home() {
  return (
    <>
      <Hero />
      <LifecycleStrip />
      <Opportunity />
      <ProblemInterlude />
      <Ecosystem />
      <WhyAurify />
      <Pillars />
      <WhoWeServe />
      <ClosingCta />
    </>
  );
}
