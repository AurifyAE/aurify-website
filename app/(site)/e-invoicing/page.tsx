import type { Metadata } from "next";
import { absoluteSeo, pageSeo } from "@/lib/content/seo";
import { eInvoicingFaq, eInvoicingReady } from "@/lib/content/e-invoicing";
import EInvoicingHero from "@/components/sections/e-invoicing/EInvoicingHero";
import InvoiceIsolation from "@/components/sections/e-invoicing/InvoiceIsolation";
import MetalAwareCapabilities from "@/components/sections/e-invoicing/MetalAwareCapabilities";
import ConnectedInvoiceFlow from "@/components/sections/e-invoicing/ConnectedInvoiceFlow";
import UaeReadiness from "@/components/sections/e-invoicing/UaeReadiness";
import InvoiceDataLayer from "@/components/sections/e-invoicing/InvoiceDataLayer";
import EcosystemConnections from "@/components/sections/e-invoicing/EcosystemConnections";
import EInvoicingFaq from "@/components/sections/e-invoicing/EInvoicingFaq";
import EInvoicingClosingCta from "@/components/sections/e-invoicing/EInvoicingClosingCta";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = absoluteSeo(pageSeo.eInvoicing);

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: eInvoicingFaq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * E-Invoicing - UAE e-invoicing as an integrated capability of the Aurify
 * platform. Standalone top-level route, like /connect. Alternates light and
 * navy bands: hero, isolation problem, metal-aware capabilities, the
 * five-step flow, UAE readiness with the five-corner exchange diagram, the
 * data layer, ecosystem links, readiness CTA, FAQ and the closing moment.
 */
export default function EInvoicingPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      <EInvoicingHero />
      <InvoiceIsolation />
      <MetalAwareCapabilities />
      <ConnectedInvoiceFlow />
      <UaeReadiness />
      <InvoiceDataLayer />
      <EcosystemConnections />

      <section className="mx-auto max-w-content px-6 pb-section md:px-10">
        <Reveal className="grid gap-x-20 gap-y-10 rounded-3xl border border-ink/10 p-8 md:p-14 lg:grid-cols-2">
          <h2 className="max-w-4xl text-title text-navy lg:col-span-2">{eInvoicingReady.title}</h2>
          <div>
            <ul className="space-y-1 text-title-sm font-light text-ink/70">
              {eInvoicingReady.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-body text-ink/60">{eInvoicingReady.body}</p>
            <p className="mt-8 text-title-sm text-navy">{eInvoicingReady.cta.line}</p>
            <div className="mt-6">
              <Button href={eInvoicingReady.cta.href} variant="gradient">
                {eInvoicingReady.cta.label}
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <EInvoicingFaq />
      <EInvoicingClosingCta />
    </div>
  );
}
