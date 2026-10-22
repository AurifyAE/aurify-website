import type { Metadata } from "next";
import { contact } from "@/lib/content/contact";
import Button from "@/components/ui/Button";

const { thankYou } = contact;

export const metadata: Metadata = {
  title: "Thank You",
  description: thankYou.message,
  robots: { index: false, follow: false },
};

export default function ContactThankYouPage() {
  return (
    <section className="relative isolate flex min-h-[82dvh] items-center overflow-hidden bg-paper px-6 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
      <div className="hero-grid pointer-events-none absolute inset-0 -z-20" aria-hidden />
      <div
        className="pointer-events-none absolute -right-40 top-8 -z-10 h-[34rem] w-[34rem] rounded-full bg-sky/15 blur-3xl md:right-[-8rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-16rem] left-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-blue/10 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-content gap-12 md:grid-cols-[0.72fr_1.28fr] md:items-center md:gap-20">
        <div className="relative flex min-h-52 items-center justify-center md:min-h-96">
          <div className="absolute h-40 w-40 rounded-full border border-blue/10 md:h-72 md:w-72" aria-hidden />
          <div className="absolute h-28 w-28 rounded-full border border-sky/20 md:h-52 md:w-52" aria-hidden />
          <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-brand text-white shadow-[0_24px_70px_rgb(var(--navy)/0.22)] md:h-32 md:w-32 md:rounded-[2.5rem]">
            <svg viewBox="0 0 48 48" className="h-11 w-11 md:h-14 md:w-14" fill="none" aria-hidden>
              <path d="m13 25 7 7 15-17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="absolute right-[14%] top-[16%] h-3 w-3 rounded-full bg-teal shadow-[0_0_0_7px_rgb(var(--teal)/0.12)] md:right-[12%]" aria-hidden />
        </div>

        <div className="max-w-2xl">
          <p className="text-eyebrow uppercase text-blue">{thankYou.eyebrow} · Message received</p>
          <h1 className="mt-5 text-display text-navy">{thankYou.headline}<span className="text-sky">.</span></h1>
          <p className="mt-7 max-w-measure text-body text-ink/60">{thankYou.message}</p>

          <div className="mt-10 flex flex-col gap-5 border-t border-navy/10 pt-8 sm:flex-row sm:items-center sm:gap-7">
            <Button href={thankYou.backHref} className="group">
              {thankYou.backLabel}
              <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" aria-hidden>
                <path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <p className="text-sm leading-relaxed text-ink/50">A member of our team will follow up shortly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
