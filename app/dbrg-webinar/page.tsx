import type { Metadata } from "next";
import Image from "next/image";
import DbrgRegistrationForm from "@/components/sections/dbrg-webinar/DbrgRegistrationForm";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";

export const metadata: Metadata = {
  title: "E-Invoicing Essentials Webinar",
  description:
    "Register for E-Invoicing Essentials: Preparing for the Digital Tax Future, hosted online by DBRG and Suntech.",
  openGraph: {
    title: "E-Invoicing Essentials: Preparing for the Digital Tax Future",
    description:
      "A DBRG and Suntech webinar covering e-invoicing requirements, compliance obligations and implementation best practices.",
  },
};

export default function DbrgWebinarPage() {
  return (
    <div className="min-h-[100dvh] bg-white">
      <header className="relative overflow-hidden px-6 py-12 md:px-10 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgb(var(--dbrg-gold)/0.22),transparent_32%),radial-gradient(circle_at_86%_72%,rgb(var(--sky)/0.12),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-wide items-center gap-12 md:min-h-[42rem] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
          <div className="max-w-xl">
            <div className="w-fit">
              <Image
                src="/images/dbrg/dbrg-logo.png"
                alt="Business Group for Bullion and Gold Refinery Dubai"
                width={820}
                height={889}
                priority
                className="h-auto w-28 mix-blend-multiply md:w-32"
              />
              <div className="mt-3 border-t border-dbrg-gold/50 pt-3">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-dbrg-ink/80">
                  In association with
                </p>
                <Image
                  src="/logo/aurify-logo.svg"
                  alt="Aurify Technology"
                  width={98}
                  height={40}
                  className="mt-2 h-auto w-24"
                />
              </div>
            </div>

            <p className="mt-9 max-w-md text-xs font-semibold uppercase tracking-[0.14em] text-dbrg-ink">
              {dbrgWebinar.hero.series}
            </p>
            <h1 className="mt-4 text-title text-navy">
              <span className="block">{dbrgWebinar.hero.headline}:</span>
              <span className="mt-3 block max-w-lg text-xl font-medium leading-snug tracking-normal text-dbrg-ink md:text-2xl">
                {dbrgWebinar.hero.subline}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
              {dbrgWebinar.hero.introduction}
            </p>
            <a
              href="#registration"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-dbrg-gold px-7 py-3.5 text-[0.9375rem] font-semibold text-navy transition-[transform,background-color] duration-200 hover:bg-dbrg-gold/80 active:scale-[0.98]"
            >
              {dbrgWebinar.hero.cta}
            </a>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-dbrg-gold/40 bg-mist shadow-[0_24px_80px_rgb(var(--navy)/0.12)]">
            <Image
              src="/images/home/Bullion_trading_desk_with_monitors.jpeg"
              alt="Gold trading desk with market screens overlooking Dubai"
              width={2048}
              height={1152}
              priority
              sizes="(min-width: 768px) 52vw, 100vw"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      <section aria-label="Webinar details" className="border-y border-dbrg-gold/40 bg-white px-6 md:px-10">
        <dl className="mx-auto grid max-w-wide grid-cols-2 md:grid-cols-5">
          {dbrgWebinar.details.map((detail, index) => (
            <div
              key={detail.label}
              className={`py-6 md:px-6 md:py-8 ${index > 0 ? "md:border-l md:border-dbrg-gold/25" : ""} ${index >= 2 ? "border-t border-dbrg-gold/30 md:border-t-0" : ""} ${index % 2 === 1 ? "pl-5 md:pl-6" : "pr-5 md:pr-6"} ${index === dbrgWebinar.details.length - 1 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-dbrg-ink/70">
                {detail.label}
              </dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-navy md:text-base">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        <dl className="mx-auto grid max-w-wide border-t border-dbrg-gold/30 md:grid-cols-2">
          {dbrgWebinar.organisers.map((organiser, index) => (
            <div
              key={organiser.label}
              className={`py-5 md:px-6 ${index > 0 ? "border-t border-dbrg-gold/30 md:border-l md:border-t-0" : ""}`}
            >
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-dbrg-ink/70">
                {organiser.label}
              </dt>
              <dd className="mt-1.5 text-base font-semibold text-navy">{organiser.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-6 py-section-sm md:px-10">
        <div className="mx-auto grid max-w-content gap-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-20">
          <div>
            <h2 className="max-w-2xl text-title-sm text-navy">{dbrgWebinar.overview.title}</h2>
            <p className="mt-5 max-w-2xl text-body text-ink/70">{dbrgWebinar.overview.objective}</p>
          </div>
          <div className="rounded-2xl bg-dbrg-gold/[0.14] p-7 md:p-9">
            <h2 className="text-title-sm text-navy">{dbrgWebinar.overview.takeawayTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">{dbrgWebinar.overview.takeaway}</p>
          </div>
        </div>
      </section>

      <section className="bg-mist/60 px-6 py-section-sm md:px-10">
        <div className="mx-auto grid max-w-content gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20">
          <div>
            <h2 className="text-title-sm text-navy">Session agenda</h2>
            <div className="mt-7 border-t border-navy/20">
              {dbrgWebinar.agenda.map((item) => (
                <div key={item.title} className="grid grid-cols-[6.5rem_1fr] gap-5 border-b border-navy/20 py-5 md:grid-cols-[8rem_1fr]">
                  <p className="text-sm font-medium text-dbrg-ink">{item.duration}</p>
                  <div>
                    <h3 className="font-medium text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{item.presenter}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-title-sm text-navy">Speakers</h2>
            <div className="mt-7 space-y-8">
              {dbrgWebinar.speakers.map((speaker) => (
                <article key={speaker.name} className="border-l border-dbrg-gold pl-6">
                  <p className="text-sm font-medium text-dbrg-ink">{speaker.contribution}</p>
                  <h3 className="mt-2 text-xl font-medium text-navy">{speaker.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{speaker.role}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="registration"
        className="scroll-mt-8 border-t border-dbrg-gold/30 bg-[linear-gradient(180deg,rgb(var(--dbrg-gold)/0.12),rgb(var(--mist)/0.7))] px-6 py-section-sm md:px-10"
      >
        <div className="mx-auto max-w-content">
          <DbrgRegistrationForm />
        </div>
      </section>
    </div>
  );
}
