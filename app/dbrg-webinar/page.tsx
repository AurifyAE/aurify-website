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
      <header className="bg-[#fbfaf9]">
        <h1 className="sr-only">
          E-Invoicing Essentials: Preparing for the Digital Tax Future
        </h1>
        <a
          href="#registration"
          aria-label="Register for the E-Invoicing Essentials webinar"
          className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-dbrg-gold"
        >
          <Image
            src="/images/dbrg/dbrg-web-banner.jpg"
            alt="DBRG Expert Live Webinar Series invitation for E-Invoicing Essentials, Thursday, September 10, 2026 at 3:30 PM GST"
            width={6000}
            height={3333}
            priority
            sizes="100vw"
            className="h-auto w-full transition-opacity duration-200 group-hover:opacity-95"
          />
        </a>
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
              <dd className="mt-3 flex min-h-20 items-center">
                <Image
                  src={organiser.logo}
                  alt={organiser.value}
                  width={organiser.logoWidth}
                  height={organiser.logoHeight}
                  className={organiser.logoClass}
                />
              </dd>
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
                    {item.logo && (
                      <Image
                        src={item.logo}
                        alt={item.presenter}
                        width={item.logoWidth}
                        height={item.logoHeight}
                        className={`mt-3 ${item.logoClass}`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-title-sm text-navy">Webinar team</h2>
            <div className="mt-7 space-y-8">
              {dbrgWebinar.speakers.map((speaker) => (
                <article key={speaker.name} className="border-l border-dbrg-gold pl-6">
                  <p className="text-sm font-medium text-dbrg-ink">{speaker.contribution}</p>
                  <h3 className="mt-2 text-xl font-medium text-navy">{speaker.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">{speaker.role}</p>
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
