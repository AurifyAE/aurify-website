"use client";

import { useState, type FormEvent } from "react";
import { contact } from "@/lib/content/contact";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

type Status = "idle" | "sending" | "success" | "error";

const fieldCls =
  "w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink/30 transition-colors duration-300 focus:border-blue focus:outline-none";
const labelCls = "mb-2 block text-sm font-medium text-navy";

/**
 * Offices + message form. Posts to the stubbed /api/contact route —
 * swap in an email/CRM provider there without touching this component.
 */
export default function ContactPanel() {
  const [status, setStatus] = useState<Status>("idle");
  const { fields } = contact.form;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto mt-16 grid max-w-content items-start gap-12 px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:px-10">
      {/* Offices + direct contact */}
      <Reveal stagger>
        {contact.offices.map((office) => (
          <div key={office.city} className="border-t border-ink/10 py-8">
            <div className="flex items-baseline gap-3">
              <h2 className="text-title-sm text-navy">{office.city}</h2>
              <span className="text-eyebrow uppercase text-ink/60">
                {office.role}
              </span>
            </div>
            <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-ink/60">
              {office.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {office.phone && (
                <p className="pt-2">
                  <a
                    href={office.phoneHref}
                    className="underline-gradient text-blue transition-colors duration-300 hover:text-navy"
                  >
                    {office.phone}
                  </a>
                </p>
              )}
            </address>
          </div>
        ))}
        <p className="border-t border-ink/10 pt-8 text-sm leading-relaxed text-ink/60">
          Prefer email?{" "}
          <a
            href={site.contact.emailHref}
            className="underline-gradient text-blue transition-colors duration-300 hover:text-navy"
          >
            {site.contact.email}
          </a>
        </p>
      </Reveal>

      {/* Form */}
      <Reveal delay={0.15}>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-paper p-8 md:p-10"
          noValidate={false}
        >
          <h2 className="text-title-sm text-navy">{contact.form.title}</h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className={labelCls}>
                {fields.name.label}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder={fields.name.placeholder}
                className={fieldCls}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelCls}>
                {fields.email.label}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={fields.email.placeholder}
                className={fieldCls}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="contact-company" className={labelCls}>
              {fields.company.label}
            </label>
            <input
              id="contact-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={fields.company.placeholder}
              className={fieldCls}
            />
          </div>

          <div className="mt-6">
            <label htmlFor="contact-message" className={labelCls}>
              {fields.message.label}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              placeholder={fields.message.placeholder}
              className={`${fieldCls} resize-y`}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : contact.form.submitLabel}
            </Button>
            <p aria-live="polite" className="text-sm">
              {status === "success" && (
                <span className="font-medium text-blue">
                  {contact.form.success}
                </span>
              )}
              {status === "error" && (
                <span className="font-medium text-navy">
                  {contact.form.error}
                </span>
              )}
            </p>
          </div>
        </form>
      </Reveal>
    </section>
  );
}
