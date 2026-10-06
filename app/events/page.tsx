import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import { akwSeminar } from "@/lib/content/akw-seminar";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";
import { absoluteSeo, pageSeo } from "@/lib/content/seo";

export const metadata: Metadata = absoluteSeo(pageSeo.webinars);

type Webinar = {
  title: string;
  summary: string;
  date: string;
  dateTime: string;
  href: string;
  /** Empty string hides the register button for that session. */
  registrationUrl: string;
};

// Add future sessions here. Sessions whose date has passed belong in `past`.
const upcoming: Webinar[] = [
  {
    title: "E-Invoicing Seminar: AKW Consultants & Aurify Technology",
    summary:
      "An in-person evening on e-invoicing and digital transformation for the precious metals industry, with an industry panel, dinner and networking at Hyatt Regency, Deira.",
    date: "October 10, 2026 · 5:00 PM GST",
    dateTime: "2026-10-10T17:00:00+04:00",
    href: "/events/e-invoicing-seminar",
    registrationUrl: akwSeminar.registrationUrl,
  },
];

const past: Webinar[] = [
  {
    title: "E-Invoicing Essentials: Preparing for the Digital Tax Future",
    summary:
      "A practical DBRG and Suntech session on e-invoicing requirements, compliance obligations, and implementation best practices.",
    date: "September 10, 2026 · 3:30 PM GST",
    dateTime: "2026-09-10T15:30:00+04:00",
    href: "/webinars/dbrg-webinar",
    registrationUrl: dbrgWebinar.registrationUrl,
  },
];

function WebinarCard({
  webinar,
  index,
  showRegister,
}: {
  webinar: Webinar;
  index: number;
  showRegister: boolean;
}) {
  return (
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
        <h3 className="mt-5 text-title-sm text-navy">{webinar.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          {webinar.summary}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={webinar.href}
            className="group inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue"
          >
            Learn more
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
              strokeWidth={1.8}
              aria-hidden
            />
          </Link>
          {showRegister && webinar.registrationUrl && (
            <Link
              href={webinar.registrationUrl}
              className="inline-flex items-center rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors duration-300 hover:border-navy/50 hover:bg-white"
            >
              Register now
            </Link>
          )}
        </div>
      </article>
    </Reveal>
  );
}

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
            Upcoming sessions
          </h2>
        </Reveal>

        {upcoming.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {upcoming.map((webinar, index) => (
              <WebinarCard
                key={webinar.href}
                webinar={webinar}
                index={index}
                showRegister
              />
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

      {past.length > 0 && (
        <section
          className="mx-auto max-w-content px-6 pt-16 md:px-10 md:pt-24"
          aria-labelledby="past-webinars"
        >
          <Reveal>
            <h2 id="past-webinars" className="text-title-sm text-navy">
              Past sessions
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {past.map((webinar, index) => (
              <WebinarCard
                key={webinar.href}
                webinar={webinar}
                index={index}
                showRegister={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
