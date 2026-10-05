import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { akwSeminar } from "@/lib/content/akw-seminar";

export const metadata: Metadata = {
  title: "E-Invoicing Seminar - AKW Consultants & Aurify",
  description:
    "An in-person E-Invoicing Seminar by AKW Consultants and Aurify Technology on 10 October 2026 at Hyatt Regency, Deira, Dubai.",
  openGraph: {
    title: "E-Invoicing Seminar - AKW Consultants & Aurify Technology",
    description:
      "Digital transformation, e-invoicing and an industry panel, followed by dinner and networking. 10 October 2026, Hyatt Regency, Deira, Dubai.",
    images: ["/images/akw/akw-seminar-banner.jpeg"],
  },
};

// A word joiner (U+2060) after in-word hyphens stops narrow screens from
// wrapping "e-invoicing" as "e-" / "invoicing".
const keepHyphenated = (text: string) =>
  text.replace(/(\w)-(\w)/g, "$1-⁠$2");

export default function AkwSeminarPage() {
  const hasRegistration = akwSeminar.registrationUrl.length > 0;

  return (
    <div className="min-h-[100dvh] bg-white">
      <header className="bg-[#fbfaf9]">
        <h1 className="sr-only">
          E-Invoicing Seminar by AKW Consultants and Aurify Technology, 10
          October 2026, Hyatt Regency, Deira, Dubai
        </h1>
        <Image
          src="/images/akw/akw-seminar-banner.jpeg"
          alt="AKW Consultants and Aurify Technology E-Invoicing Seminar, 10 October 2026, 5:00 PM to 8:00 PM, Hyatt Regency, Deira, Dubai, with the Dubai Gold Souk at dusk"
          width={3546}
          height={1312}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </header>

      <section
        aria-label="Seminar details"
        className="border-y border-navy/15 bg-white px-6 md:px-10"
      >
        <dl className="mx-auto grid max-w-wide grid-cols-2 md:grid-cols-4">
          {akwSeminar.details.map((detail, index) => (
            <div
              key={detail.label}
              className={`py-6 md:px-6 md:py-8 ${index > 0 ? "md:border-l md:border-navy/15" : ""} ${index >= 2 ? "border-t border-navy/15 md:border-t-0" : ""} ${index % 2 === 1 ? "pl-5 md:pl-6" : "pr-5 md:pr-6"}`}
            >
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-ink/60">
                {detail.label}
              </dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-navy md:text-base">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mx-auto flex max-w-wide flex-col gap-4 border-t border-navy/15 py-6 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="text-sm font-medium text-navy">
            {akwSeminar.attendanceNote}
          </p>
          <Button
            href={hasRegistration ? akwSeminar.registrationUrl : "/contact"}
            className="shrink-0 self-start active:scale-[0.98] sm:self-auto"
          >
            {hasRegistration ? akwSeminar.hero.cta : "Contact us"}
          </Button>
        </div>
      </section>

      <section className="px-6 py-section-sm md:px-10">
        <div className="mx-auto grid max-w-content gap-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-20">
          <div>
            <p className="text-eyebrow uppercase text-blue">
              {akwSeminar.hero.series}
            </p>
            <h2 className="mt-3 max-w-2xl text-title-sm text-navy">
              {keepHyphenated(akwSeminar.overview.title)}
            </h2>
            <p className="mt-5 max-w-2xl text-body text-ink/70">
              {keepHyphenated(akwSeminar.hero.introduction)}
            </p>
            <p className="mt-4 max-w-2xl text-body text-ink/70">
              {akwSeminar.overview.objective}
            </p>
          </div>
          <div className="rounded-2xl bg-mist/60 p-7 md:p-9">
            <h2 className="text-title-sm text-navy">
              {akwSeminar.overview.takeawayTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              {akwSeminar.overview.takeaway}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-mist/60 px-6 py-section-sm md:px-10">
        <div className="mx-auto max-w-content">
          <h2 className="text-title-sm text-navy">Event day agenda</h2>
          <div className="mt-7 border-t border-navy/20">
            {akwSeminar.agenda.map((item) => (
              <div
                key={item.title}
                className="grid gap-2 border-b border-navy/20 py-5 md:grid-cols-[11rem_1fr] md:gap-8"
              >
                <p className="text-sm font-medium text-blue">{item.time}</p>
                <div>
                  <h3 className="font-medium text-navy">{item.title}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink/65"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-blue/60"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="registration"
        className="scroll-mt-8 border-t border-navy/10 bg-[linear-gradient(180deg,rgb(var(--sky)/0.1),rgb(var(--mist)/0.7))] px-4 py-section-sm sm:px-6 md:px-10"
      >
        <div className="mx-auto w-full min-w-0 max-w-content">
          <div className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_20px_70px_rgb(var(--navy)/0.08)] sm:p-10 md:p-12">
            <p className="text-eyebrow uppercase text-blue">
              {hasRegistration ? "Reserve your place" : "Seats are limited"}
            </p>
            <h2 className="mt-3 text-title-sm text-navy">
              Join us at Hyatt Regency, Deira
            </h2>
            <p className="mt-4 max-w-2xl text-body text-ink/70">
              {hasRegistration
                ? "Places are limited. Reserve yours below and we will confirm your attendance by email."
                : "Places are limited. Contact our team to request an invitation to the seminar."}
            </p>
            <p className="mt-4 max-w-2xl text-sm font-medium text-navy">
              {akwSeminar.attendanceNote}
            </p>
            <Button
              href={hasRegistration ? akwSeminar.registrationUrl : "/contact"}
              className="mt-8 active:scale-[0.98]"
            >
              {hasRegistration ? akwSeminar.hero.cta : "Contact us"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
