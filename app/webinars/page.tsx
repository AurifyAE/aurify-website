import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Webinars",
  description:
    "Join Aurify webinars on precious metals technology, connected operations, compliance, and risk.",
  openGraph: {
    title: "Aurify Webinars",
    description:
      "Expert conversations on the technology shaping the precious metals industry.",
  },
};

type Webinar = {
  title: string;
  summary: string;
  date: string;
  dateTime: string;
  href: string;
};

// Add future sessions here. The page automatically switches to a webinar grid.
const webinars: Webinar[] = [];

export default function WebinarsPage() {
  return (
    <div className="bg-white pb-section">
      <PageHero
        eyebrow="Webinars"
        headline="Expert conversations for a connected metals industry."
        subline="Join practical sessions on technology, operations, compliance, and risk across the precious metals value chain."
      />

      <section
        className="mx-auto max-w-content px-6 pt-16 md:px-10 md:pt-24"
        aria-labelledby="upcoming-webinars"
      >
        <Reveal>
          <h2 id="upcoming-webinars" className="text-title-sm text-navy">
            Upcoming webinars
          </h2>
        </Reveal>

        {webinars.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {webinars.map((webinar, index) => (
              <Reveal key={webinar.href} delay={index * 0.08}>
                <article className="flex h-full flex-col rounded-3xl bg-mist/45 p-6 ring-1 ring-inset ring-navy/10 sm:p-8">
                  <time
                    dateTime={webinar.dateTime}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue"
                  >
                    <HugeiconsIcon
                      icon={Calendar01Icon}
                      className="h-4 w-4"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                    {webinar.date}
                  </time>
                  <h3 className="mt-5 text-title-sm text-navy">
                    {webinar.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-ink/65">
                    {webinar.summary}
                  </p>
                  <Link
                    href={webinar.href}
                    className="group mt-7 inline-flex w-fit items-center gap-2 text-sm font-medium text-blue transition-colors duration-300 hover:text-navy"
                  >
                    View webinar
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-8">
            <div className="rounded-3xl bg-mist/45 px-6 py-14 ring-1 ring-inset ring-navy/10 sm:px-10 sm:py-16">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="h-8 w-8 text-blue"
                strokeWidth={1.6}
                aria-hidden
              />
              <h3 className="mt-6 text-title-sm text-navy">
                New sessions are being prepared.
              </h3>
              <p className="mt-3 max-w-measure text-base leading-relaxed text-ink/60">
                We will publish upcoming webinar dates and registration details here.
              </p>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
