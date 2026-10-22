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
    images: ["/images/akw/akw-banner-desktop.jpeg"],
  },
};

// A word joiner (U+2060) after in-word hyphens stops narrow screens from
// wrapping "e-invoicing" as "e-" / "invoicing".
const keepHyphenated = (text: string) =>
  text.replace(/(\w)-(\w)/g, "$1-⁠$2");

const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => /^[A-Za-z]{2,}/.test(part))
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const { panel, gallery } = akwSeminar;

function PersonCard({
  person,
}: {
  person: (typeof akwSeminar.speakers)[number];
}) {
  return (
    <li className="flex items-center gap-5 rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_12px_40px_rgb(var(--navy)/0.06)]">
      {person.photo ? (
        <Image
          src={person.photo}
          alt={person.name}
          width={160}
          height={160}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-mist text-lg font-medium text-navy"
        >
          {initials(person.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-blue">
          {person.label}
        </p>
        <h3 className="mt-1 text-lg font-medium text-navy">{person.name}</h3>
        <p className="mt-1 text-sm leading-snug text-ink/70">{person.role}</p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-navy">
          {person.organisation}
        </p>
      </div>
    </li>
  );
}

export default function AkwSeminarPage() {
  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Attendees arrive from the link shared after the event, looking for
          their photos, so the highlights and the album link lead the page. */}
      <section
        id="gallery"
        aria-labelledby="gallery-heading"
        className="bg-mist/60 px-6 pb-section-sm pt-28 md:px-10 md:pt-32"
      >
        <div className="mx-auto max-w-content">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-eyebrow uppercase text-blue">
                E-Invoicing Seminar · 10 October 2026
              </p>
              <h1 id="gallery-heading" className="mt-2 text-title-sm text-navy">
                Seminar highlights
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 md:text-base">
                Thank you for joining us at Hyatt Regency, Deira. Browse the
                highlights, or open the full album to view and download every
                photo.
              </p>
            </div>
            <Button
              href={gallery.albumUrl}
              className="shrink-0 self-start active:scale-[0.98] md:self-auto"
            >
              View &amp; download all photos
            </Button>
          </div>
          {/* The first photo is the feature tile: full width on sm, 2x2 on lg. */}
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 md:mt-8 lg:grid-cols-3">
            {gallery.photos.map((photo, i) => (
              <li
                key={photo.src}
                className={i === 0 ? "sm:col-span-2 lg:row-span-2" : undefined}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={2000}
                  height={1333}
                  sizes={
                    i === 0
                      ? "(min-width: 1024px) 66vw, 100vw"
                      : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  }
                  priority={i === 0}
                  className={`aspect-[3/2] h-auto w-full rounded-md object-cover ${i === 0 ? "lg:aspect-auto lg:h-full" : ""}`}
                />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Button
              href={gallery.albumUrl}
              variant="ghost"
              className="active:scale-[0.98]"
            >
              View &amp; download all photos
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf9] px-6 py-section-sm md:px-10">
        <div className="mx-auto grid max-w-content items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <Image
            src="/images/akw/akw-banner-desktop.jpeg"
            alt="AKW Consultants and Aurify Technology E-Invoicing Seminar, 10 October 2026, 5:00 PM to 8:00 PM, Hyatt Regency, Deira, Dubai, with the Dubai Gold Souk at dusk"
            width={3840}
            height={1800}
            sizes="(min-width: 1024px) 50vw, 100vw"
            // Text-heavy artwork: the default q75 visibly softens the small type.
            quality={90}
            className="h-auto w-full rounded-md lg:order-last"
          />
          <div>
            <p className="text-eyebrow uppercase text-blue">
              {akwSeminar.hero.series}
            </p>
            <h2 className="mt-3 text-title-sm text-navy">
              {keepHyphenated(akwSeminar.overview.title)}
            </h2>
            <p className="mt-5 text-body text-ink/70">
              {keepHyphenated(akwSeminar.hero.introduction)}
            </p>
            <p className="mt-4 text-body text-ink/70">
              {akwSeminar.overview.objective}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pt-section-sm md:px-10">
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
                  <h3 className="font-medium text-navy">
                    {keepHyphenated(item.title)}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-ink/50">
                    {item.ledBy}
                  </p>
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
                        <span>{keepHyphenated(point)}</span>
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
        aria-labelledby="speakers-heading"
        className="px-6 pt-section-sm md:px-10"
      >
        <div className="mx-auto max-w-content">
          <h2 id="speakers-heading" className="text-title-sm text-navy">
            Speakers & hosts
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {akwSeminar.speakers.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="panel-heading"
        className="px-6 py-section-sm md:px-10"
      >
        <div className="mx-auto max-w-content">
          <p className="text-eyebrow uppercase text-blue">{panel.time}</p>
          <h2 id="panel-heading" className="mt-3 text-title-sm text-navy">
            {panel.title}
          </h2>
          <p className="mt-4 max-w-2xl text-body text-ink/70">
            {panel.summary}
          </p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {panel.panelists.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </ul>

          <div className="mt-12 border-t border-navy/20 pt-8">
            <h3 className="font-medium text-navy">Discussion themes</h3>
            <ul className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
              {panel.themes.map((theme) => (
                <li
                  key={theme}
                  className="flex gap-2.5 text-sm leading-relaxed text-ink/65"
                >
                  <span
                    aria-hidden
                    className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-blue/60"
                  />
                  <span>{keepHyphenated(theme)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-navy/10 bg-[linear-gradient(180deg,rgb(var(--sky)/0.1),rgb(var(--mist)/0.7))] px-4 py-section-sm sm:px-6 md:px-10">
        <div className="mx-auto w-full min-w-0 max-w-content">
          <div className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_20px_70px_rgb(var(--navy)/0.08)] sm:p-10 md:p-12">
            <p className="text-eyebrow uppercase text-blue">Thank you</p>
            <h2 className="mt-3 text-title-sm text-navy">
              Thank you for joining us at Hyatt Regency, Deira
            </h2>
            <p className="mt-4 max-w-2xl text-body text-ink/70">
              {keepHyphenated(
                "Missed the evening, or want to continue the conversation? Talk to our team about e-invoicing for your precious metals business.",
              )}
            </p>
            <Button href="/contact" className="mt-8 active:scale-[0.98]">
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
