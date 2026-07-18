import Link from "next/link";
import { poweredByIq } from "@/lib/content/products";
import { IntelligenceIcon, ArrowRightIcon } from "@/components/icons";
import Reveal from "@/components/ui/Reveal";

/**
 * "Always powered by Aurify IQ" badge band — every product page except IQ.
 */
export default function PoweredByIQ() {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <Reveal>
        <Link
          href={poweredByIq.href}
          className="group flex flex-col gap-4 rounded-2xl bg-ink p-8 text-white transition-colors duration-300 hover:bg-navy md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div>
            {/* Icon carries the teal (3:1 graphics threshold); text stays
                white for 4.5:1 body-text contrast on ink */}
            <p className="flex items-center gap-3 font-medium text-white">
              <IntelligenceIcon className="h-5 w-5 text-teal" />
              {poweredByIq.badge}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
              {poweredByIq.line}
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
        </Link>
      </Reveal>
    </section>
  );
}
