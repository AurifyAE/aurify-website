import type { Metadata } from "next";
import { getImageProps } from "next/image";
import Button from "@/components/ui/Button";
import { eInvoicingWebinar } from "@/lib/content/e-invoicing-webinar";

export const metadata: Metadata = {
  title: "UAE E-Invoicing, Tax & Digital Compliance Webinar",
  description:
    "Join Muneeb Cholayil, Founder & CEO of Aurify Technology, on Thursday, October 22, 2026 from 8:00 PM to 9:00 PM GST for a webinar on UAE e-invoicing, VAT and FTA compliance.",
  openGraph: {
    title: "UAE E-Invoicing, Tax & Digital Compliance",
    description:
      "An Aurify Technology webinar on e-invoicing readiness with Bullion Pro, unfixed gold deals, automated VAT and FTA reporting.",
  },
};

export default function EInvoicingWebinarPage() {
  const { registrationOpen, registrationUrl } = eInvoicingWebinar;
  const bannerAlt =
    "UAE E-Invoicing, Tax & Digital Compliance webinar with Muneeb Cholayil, Thursday, October 22, 2026 from 8:00 PM to 9:00 PM GST";
  const { props: desktopBanner } = getImageProps({
    src: "/images/e-invoicing-webinar/web-banner.jpg",
    alt: bannerAlt,
    width: 6250,
    height: 2083,
    priority: true,
    sizes: "100vw",
  });
  const {
    props: { srcSet: mobileBannerSrcSet },
  } = getImageProps({
    src: "/images/e-invoicing-webinar/web-banner-mobile.jpg",
    alt: bannerAlt,
    width: 4500,
    height: 5625,
    priority: true,
    sizes: "100vw",
  });

  return (
    <div className="min-h-[100dvh] bg-white">
      <header className="bg-white">
        <a
          href="#registration"
          aria-label="UAE E-Invoicing, Tax & Digital Compliance webinar registration details"
          className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue"
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={mobileBannerSrcSet}
              width="4500"
              height="5625"
            />
            <img
              {...desktopBanner}
              alt={bannerAlt}
              className="h-auto w-full transition-opacity duration-200 group-hover:opacity-95"
            />
          </picture>
        </a>
        <h1 className="sr-only">{eInvoicingWebinar.hero.headline}</h1>
      </header>

      <section aria-label="Webinar details" className="border-y border-navy/10 bg-white px-6 md:px-10">
        <dl className="mx-auto grid max-w-wide grid-cols-2 md:grid-cols-5">
          {eInvoicingWebinar.details.map((detail, index) => (
            <div
              key={detail.label}
              className={`py-6 md:px-6 md:py-8 ${index > 0 ? "md:border-l md:border-navy/10" : ""} ${index >= 2 ? "border-t border-navy/10 md:border-t-0" : ""} ${index % 2 === 1 ? "pl-5 md:pl-6" : "pr-5 md:pr-6"} ${index === eInvoicingWebinar.details.length - 1 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-blue">
                {detail.label}
              </dt>
              <dd className="mt-2 text-sm font-medium leading-snug text-navy md:text-base">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {registrationOpen && registrationUrl && (
        <section aria-label="Register" className="bg-navy px-6 py-6 md:px-10">
          <div className="mx-auto flex max-w-wide flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
            <p className="text-base leading-snug text-white/85">
              <span className="font-medium text-white">Reserve your spot.</span>{" "}
              Register on Microsoft Teams to join the live session.
            </p>
            <Button
              href={registrationUrl}
              variant="light"
              className="shrink-0 active:scale-[0.98]"
            >
              Register now
            </Button>
          </div>
        </section>
      )}

      <section className="bg-mist/60 px-6 py-section-sm md:px-10">
        <div className="mx-auto grid max-w-content gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20">
          <div>
            <h2 className="text-title-sm text-navy">{eInvoicingWebinar.overview.title}</h2>
            <ol className="mt-7 border-t border-navy/20">
              {eInvoicingWebinar.overview.topics.map((topic, index) => (
                <li key={topic} className="grid grid-cols-[3rem_1fr] gap-5 border-b border-navy/20 py-5">
                  <span className="text-sm font-medium text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="font-medium text-navy">{topic}</h3>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-title-sm text-navy">Webinar team</h2>
            <div className="mt-7 space-y-8">
              {eInvoicingWebinar.speakers.map((speaker) => (
                <article key={speaker.name} className="border-l-2 border-teal pl-6">
                  <p className="text-sm font-medium text-blue">{speaker.contribution}</p>
                  <h3 className="mt-2 text-xl font-medium text-navy">{speaker.name}</h3>
                  {speaker.role && <p className="mt-1 text-sm leading-relaxed text-ink/60">{speaker.role}</p>}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="registration"
        className="scroll-mt-8 border-t border-navy/10 bg-[linear-gradient(180deg,rgb(var(--blue)/0.08),rgb(var(--mist)/0.7))] px-4 py-section-sm sm:px-6 md:px-10"
      >
        <div className="mx-auto w-full min-w-0 max-w-content">
          <div className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_20px_70px_rgb(var(--navy)/0.08)] sm:p-10 md:p-12">
            {registrationOpen ? (
              <>
                <p className="text-eyebrow uppercase text-blue">Reserve your spot</p>
                <h2 className="mt-3 text-title-sm text-navy">Join us for the live session</h2>
                {registrationUrl ? (
                  <>
                    <p className="mt-4 max-w-2xl text-body text-ink/70">
                      Registration is managed securely through Microsoft Teams. Click below to reserve your spot for this webinar.
                    </p>
                    <Button href={registrationUrl} className="mt-8 active:scale-[0.98]">
                      Register now
                    </Button>
                  </>
                ) : (
                  <p className="mt-4 max-w-2xl text-body text-ink/70">
                    The registration link will be shared here soon.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-eyebrow uppercase text-blue">Registration closed</p>
                <h2 className="mt-3 text-title-sm text-navy">This live session has ended</h2>
                <p className="mt-4 max-w-2xl text-body text-ink/70">
                  Thank you to everyone who joined. Registration for this webinar is now closed.
                </p>
                <Button disabled className="mt-8 cursor-not-allowed disabled:hover:bg-navy">
                  Registration closed
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
