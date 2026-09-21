import { eInvoicingUae } from "@/lib/content/e-invoicing";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const [supplier, supplierAsp, buyerAsp, buyer, fta] = eInvoicingUae.exchange.corners;
type Corner = typeof supplier;

// Connectors for the desktop diagram, in a 400×320 space stretched to the
// stage width (preserveAspectRatio="none"; the stage height is fixed at
// 320px so y maps 1:1). The four exchange corners sit on one row at x =
// 50/150/250/350, y = 56; the FTA sits below at x = 200, y = 268. Endpoints
// tuck under the opaque node cards, as on the home ecosystem visuals.
const EXCHANGE_PATHS = [
  "M50 56 L150 56",
  "M150 56 L250 56",
  "M250 56 L350 56",
];
const REPORTING_PATHS = [
  "M150 56 C150 170, 200 170, 200 268",
  "M250 56 C250 170, 200 170, 200 268",
];

function Node({ corner, accent = false }: { corner: Corner; accent?: boolean }) {
  return (
    <div
      className={`relative flex w-full flex-col items-center rounded-2xl border p-4 text-center ${
        accent ? "border-teal/40 bg-white" : "border-ink/10 bg-white"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ${
          accent ? "bg-teal" : "bg-gradient-brand"
        }`}
      >
        {corner.id}
      </span>
      <p className="mt-2 text-sm font-medium leading-snug text-navy">{corner.name}</p>
      <p className="mt-1 text-xs leading-snug text-ink/60">{corner.detail}</p>
    </div>
  );
}

function Connector({ d, tone }: { d: string; tone: "sky" | "teal" }) {
  const track = tone === "sky" ? "stroke-sky/30" : "stroke-teal/30";
  const bead = tone === "sky" ? "stroke-blue" : "stroke-teal";
  return (
    <>
      <path d={d} fill="none" strokeWidth={2} className={track} vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="1 17"
        vectorEffect="non-scaling-stroke"
        className={`animate-bead-flow motion-reduce:hidden ${bead}`}
      />
    </>
  );
}

/**
 * "Five-corner" exchange model: supplier → supplier's provider → buyer's
 * provider → buyer along the Peppol network, with both providers reporting
 * tax data to the FTA. Desktop draws the connected diagram; mobile stacks
 * the same corners as a numbered sequence.
 */
function ExchangeDiagram() {
  return (
    <figure className="rounded-3xl border border-ink/10 bg-paper p-6 md:p-10">
      <figcaption className="text-eyebrow uppercase text-ink/60">
        {eInvoicingUae.exchange.caption}
      </figcaption>

      {/* Desktop */}
      <div className="relative mt-8 hidden h-[320px] md:block">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 320"
          preserveAspectRatio="none"
        >
          {EXCHANGE_PATHS.map((d) => (
            <Connector key={d} d={d} tone="sky" />
          ))}
          {REPORTING_PATHS.map((d) => (
            <Connector key={d} d={d} tone="teal" />
          ))}
        </svg>
        <div className="relative grid grid-cols-4 gap-8">
          {[supplier, supplierAsp, buyerAsp, buyer].map((corner) => (
            <Node key={corner.id} corner={corner} />
          ))}
        </div>
        <div className="absolute bottom-0 left-1/2 w-[calc(25%-1.5rem)] -translate-x-1/2">
          <Node corner={fta} accent />
        </div>
      </div>

      {/* Mobile */}
      <ol className="mt-6 space-y-3 md:hidden">
        {[supplier, supplierAsp, buyerAsp, buyer, fta].map((corner) => (
          <li key={corner.id}>
            <Node corner={corner} accent={corner.id === fta.id} />
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** UAE mandate readiness: context, exchange diagram, four readiness points. */
export default function UaeReadiness() {
  return (
    <section className="mx-auto max-w-content px-6 py-section md:px-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
        <SectionHeading
          eyebrow={eInvoicingUae.eyebrow}
          title={eInvoicingUae.title}
          body={eInvoicingUae.body}
        />
        <Reveal className="flex flex-col justify-end space-y-5 text-body text-ink/60">
          <p>{eInvoicingUae.challenge}</p>
          <p className="text-title-sm font-light text-navy">{eInvoicingUae.emphasis}</p>
          <p>{eInvoicingUae.foundation}</p>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <ExchangeDiagram />
      </Reveal>

      <h3 className="mt-20 text-eyebrow uppercase text-ink/60">{eInvoicingUae.prepareTitle}</h3>
      <Reveal stagger className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {eInvoicingUae.prepare.map((item) => (
          <div key={item.title} className="border-t border-ink/10 pt-5">
            <h4 className="font-medium text-navy">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.summary}</p>
          </div>
        ))}
      </Reveal>

      <p className="mt-12 max-w-3xl text-xs italic leading-relaxed text-ink/60">
        Note: {eInvoicingUae.note}
      </p>
    </section>
  );
}
