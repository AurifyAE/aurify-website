import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import { akwSeminar } from "@/lib/content/akw-seminar";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";
import { absoluteSeo, pageSeo } from "@/lib/content/seo";

export const metadata: Metadata = absoluteSeo(pageSeo.events);

type EventItem = {
  title: string;
  summary: string;
  date: string;
  dateTime: string;
  href: string;
  /** Empty string hides the register button for that session. */
  registrationUrl: string;
  /** False hides the register button; webinars also show an Open/Closed tag. */
  registrationOpen: boolean;
};

// Add future sessions here. Online webinars belong in `webinars`.
const upcoming: EventItem[] = [
  {
    title: "E-Invoicing Seminar: AKW Consultants & Aurify Technology",
    summary:
      "An in-person evening on e-invoicing and digital transformation for the precious metals industry, with an industry panel, dinner and networking at Hyatt Regency, Deira.",
    date: "October 10, 2026 · 5:00 PM GST",
    dateTime: "2026-10-10T17:00:00+04:00",
    href: "/events/e-invoicing-seminar",
    registrationUrl: akwSeminar.registrationUrl,
    registrationOpen: true,
  },
];

const webinars: EventItem[] = [
  {
    title: "E-Invoicing Essentials: Preparing for the Digital Tax Future",
    summary:
      "A practical DBRG and Suntech session on e-invoicing requirements, compliance obligations, and implementation best practices.",
    date: "September 10, 2026 · 3:30 PM GST",
    dateTime: "2026-09-10T15:30:00+04:00",
    href: "/events/dbrg-webinar",
    registrationUrl: dbrgWebinar.registrationUrl,
    registrationOpen: dbrgWebinar.registrationOpen,
  },
];

function EventCard({
  event,
  index,
  showStatus = false,
}: {
  event: EventItem;
  index: number;
  showStatus?: boolean;
}) {
  const open = event.registrationOpen;

  // Open sessions read as live (white card, teal ring, lift); closed ones
  // step back (flat mist card, muted type, outline button).
  return (
    <Reveal key={event.href} delay={index * 0.08}>
      <article
        className={`flex h-full flex-col rounded-3xl p-6 ring-1 ring-inset sm:p-8 ${
          open
            ? "bg-white shadow-[0_18px_50px_rgb(var(--navy)/0.08)] ring-teal/30"
            : "bg-mist/40 ring-navy/10"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <time
            dateTime={event.dateTime}
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              open ? "text-blue" : "text-ink/55"
            }`}
          >
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="h-4 w-4"
              strokeWidth={1.8}
              aria-hidden
            />
            {event.date}
          </time>
          {showStatus && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] ${
                event.registrationOpen
                  ? "bg-teal/10 text-teal ring-1 ring-inset ring-teal/25"
                  : "bg-navy/[0.06] text-ink/60 ring-1 ring-inset ring-navy/10"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  event.registrationOpen ? "bg-teal" : "bg-ink/40"
                }`}
              />
              {event.registrationOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>
        <h3
          className={`mt-5 text-title-sm ${open ? "text-navy" : "text-navy/70"}`}
        >
          {event.title}
        </h3>
        <p
          className={`mt-4 text-base leading-relaxed ${
            open ? "text-ink/65" : "text-ink/55"
          }`}
        >
          {event.summary}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
          <Link
            href={event.href}
            className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
              open
                ? "bg-navy text-white hover:bg-blue"
                : "border border-navy/20 text-navy/80 hover:border-navy/50 hover:bg-white"
            }`}
          >
            Learn more
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
              strokeWidth={1.8}
              aria-hidden
            />
          </Link>
          {event.registrationOpen && event.registrationUrl && (
            <Link
              href={event.registrationUrl}
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

export default function EventsPage() {
  return (
    <div className="bg-white pb-section">
      <PageHero
        eyebrow="Events"
        headline="Expert conversations for a connected metals industry."
        subline="Join practical sessions on technology, operations, compliance, and risk across the precious metals value chain."
      />

      <section
        className="mx-auto max-w-content px-6 pt-16 md:px-10 md:pt-24"
        aria-labelledby="upcoming-events"
      >
        <Reveal>
          <h2 id="upcoming-events" className="text-title-sm text-navy">
            Upcoming events
          </h2>
        </Reveal>

        {upcoming.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {upcoming.map((event, index) => (
              <EventCard
                key={event.href}
                event={event}
                index={index}
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
                We will publish upcoming event dates and registration details here.
              </p>
            </div>
          </Reveal>
        )}
      </section>

      {webinars.length > 0 && (
        <section
          className="mx-auto max-w-content px-6 pt-16 md:px-10 md:pt-24"
          aria-labelledby="webinars"
        >
          <Reveal>
            <h2 id="webinars" className="text-title-sm text-navy">
              Webinars
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {webinars.map((event, index) => (
              <EventCard
                key={event.href}
                event={event}
                index={index}
                showStatus
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
