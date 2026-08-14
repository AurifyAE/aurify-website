import type { Metadata } from "next";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import Button from "@/components/ui/Button";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";

export const metadata: Metadata = {
  title: "Registration Confirmed | DBRG Webinar",
  description:
    "Your registration for the DBRG E-Invoicing Essentials webinar has been confirmed.",
  robots: { index: false, follow: false },
};

const eventDetails = [
  { label: "Date", value: "Thursday, September 10, 2026" },
  { label: "Time", value: "3:30 PM GST" },
  { label: "Platform", value: "Microsoft Teams" },
] as const;

export default function DbrgWebinarThankYouPage() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden bg-white px-6 py-8 md:px-10 md:py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-80 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--dbrg-gold)/0.22),transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-36 -z-20 h-96 w-96 rounded-full bg-mist/80 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-content flex-col md:min-h-[calc(100dvh-5rem)]">
        <header className="flex flex-col items-center justify-between gap-7 border-b border-dbrg-gold/30 pb-7 sm:flex-row">
          <Image
            src="/images/dbrg/email/aurify-logo.png"
            alt="Aurify Technology"
            width={320}
            height={92}
            priority
            className="h-9 w-auto"
          />

          <div className="flex max-w-sm items-center gap-3 text-center sm:text-left">
            <Image
              src="/images/dbrg/dbrg-logo.png"
              alt="DBRG"
              width={788}
              height={889}
              priority
              className="h-14 w-auto mix-blend-multiply"
            />
            <p className="text-xs font-medium leading-snug text-navy sm:text-sm">
              {dbrgWebinar.organisationName}
            </p>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center md:py-20">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            className="h-16 w-16 text-dbrg-ink"
            strokeWidth={1.5}
            aria-hidden
          />

          <p className="mt-7 text-eyebrow uppercase text-dbrg-ink">
            Registration confirmed
          </p>
          <h1 className="mt-4 text-title text-navy">Thank you for registering.</h1>
          <p className="mt-5 max-w-2xl text-body text-ink/65">
            Your seat for <strong className="font-medium text-navy">E-Invoicing Essentials: Preparing for the Digital Tax Future</strong> is confirmed. We sent the Microsoft Teams link to the email address you provided.
          </p>

          <dl className="mt-10 grid w-full grid-cols-1 border-y border-dbrg-gold/35 sm:grid-cols-3">
            {eventDetails.map((detail, index) => (
              <div
                key={detail.label}
                className={`px-5 py-5 ${index > 0 ? "border-t border-dbrg-gold/25 sm:border-l sm:border-t-0" : ""}`}
              >
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-dbrg-ink/70">
                  {detail.label}
                </dt>
                <dd className="mt-2 text-sm font-medium leading-snug text-navy">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 text-sm leading-relaxed text-ink/55">
            If the confirmation is not in your inbox, please check your spam or junk folder.
          </p>

          <Button href="/dbrg-webinar" className="mt-8 active:scale-[0.98]">
            Back to webinar
          </Button>
        </main>
      </div>
    </section>
  );
}
