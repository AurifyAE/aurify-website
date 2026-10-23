import type { Metadata } from "next";
import {
  connectMeta,
  connectModules,
  connectWhy,
  connectHowItWorks,
} from "@/lib/content/connect";
import ConnectHero from "@/components/sections/connect/ConnectHero";
import ModuleExplorer from "@/components/sections/products/ModuleExplorer";
import ProductProcessFlow from "@/components/sections/products/ProductProcessFlow";
import MessagingWindows from "@/components/sections/connect/MessagingWindows";
import IdealForMarquee from "@/components/sections/connect/IdealForMarquee";
import ConnectClosingCta from "@/components/sections/connect/ConnectClosingCta";
import ComplianceNotice from "@/components/sections/connect/ComplianceNotice";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: connectMeta.title,
  description: connectMeta.description,
  openGraph: {
    title: connectMeta.title,
    description: connectMeta.description,
  },
  twitter: {
    description: connectMeta.description,
  },
};

/**
 * Aurify Connect - the WhatsApp Business messaging module inside Bullion
 * Pro. Standalone top-level route (not nested under /products). Composed
 * from bespoke sections (hero, messaging windows, ideal-for marquee,
 * closing CTA, compliance notice) plus the shared product-template pieces
 * reused as-is: ModuleExplorer for the 7 module capabilities and
 * ProductProcessFlow for the 3-step "How It Works" band.
 */
export default function ConnectPage() {
  return (
    <div className="pb-section">
      <ConnectHero />

      <ModuleExplorer modules={connectModules} title="Module Capabilities" />

      <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
        <Reveal className="max-w-3xl">
          <h2 className="text-eyebrow uppercase text-ink/60">{connectWhy.title}</h2>
          <p className="mt-6 text-title-sm font-light leading-normal text-ink/80">
            {connectWhy.text}
          </p>
        </Reveal>
      </section>

      <ProductProcessFlow steps={connectHowItWorks} title="How It Works" />

      <MessagingWindows />

      <IdealForMarquee />

      <ConnectClosingCta />

      <ComplianceNotice />
    </div>
  );
}
