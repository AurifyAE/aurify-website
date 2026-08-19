"use client";

import { useState, type FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { contact } from "@/lib/content/contact";
import { site } from "@/lib/content/site";
import { countries, FlagIcon } from "@/lib/content/countries";
import {
  validateContact,
  type ContactField,
  type ContactFieldErrors,
} from "@/lib/contact-validation";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

type Status = "idle" | "sending" | "error";

const fieldCls =
  "w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink/30 transition-colors duration-300 focus:border-blue focus:outline-none";
const labelCls = "mb-2 block text-sm font-medium text-navy";

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-xs font-medium text-[#a12b24]">
      {error}
    </p>
  );
}

/**
 * Offices + message form. Posts to the stubbed /api/contact route -
 * swap in an email/CRM provider there without touching this component.
 */
export default function ContactPanel() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const { fields } = contact.form;

  const defaultCountry = countries.find((c) => c.code === "AE") || countries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dial.includes(searchQuery)
  );

  function clearError(field: ContactField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (status === "error") setStatus("idle");
  }

  function focusFirstError(form: HTMLFormElement, fieldErrors: ContactFieldErrors) {
    const firstField = Object.keys(fieldErrors)[0] as ContactField | undefined;
    if (!firstField) return;
    requestAnimationFrame(() => {
      form
        .querySelector<HTMLElement>(`[data-field="${firstField}"], [name="${firstField}"]`)
        ?.focus();
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const validation = validateContact(data);
    if (Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      setStatus("idle");
      focusFirstError(form, validation.errors);
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json().catch(() => null)) as
        | { fields?: ContactFieldErrors }
        | null;
      if (!res.ok) {
        if (result?.fields && Object.keys(result.fields).length > 0) {
          setErrors(result.fields);
          setStatus("idle");
          focusFirstError(form, result.fields);
        } else {
          setStatus("error");
        }
        return;
      }
      router.push("/contact/thank-you");
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
            target="_blank"
            rel="noopener noreferrer"
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
          onInputCapture={(event) => {
            const target = event.target as HTMLInputElement | HTMLTextAreaElement;
            const field = target.dataset.field ?? target.name;
            if (field) clearError(field as ContactField);
          }}
          className="rounded-2xl bg-paper p-8 md:p-10"
          aria-busy={status === "sending"}
          noValidate
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
                minLength={2}
                maxLength={100}
                placeholder={fields.name.placeholder}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                data-field="name"
                className={`${fieldCls} ${errors.name ? "border-[#a12b24]" : ""}`}
              />
              <FieldError id="contact-name-error" error={errors.name} />
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
                maxLength={254}
                placeholder={fields.email.placeholder}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                data-field="email"
                className={`${fieldCls} ${errors.email ? "border-[#a12b24]" : ""}`}
              />
              <FieldError id="contact-email-error" error={errors.email} />
            </div>
          </div>

          {/* Company Row */}
          <div className="mt-6">
            <label htmlFor="contact-company" className={labelCls}>
              {fields.company.label}
            </label>
            <input
              id="contact-company"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={120}
              placeholder={fields.company.placeholder}
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "contact-company-error" : undefined}
              data-field="company"
              className={`${fieldCls} ${errors.company ? "border-[#a12b24]" : ""}`}
            />
            <FieldError id="contact-company-error" error={errors.company} />
          </div>

          {/* Phone Number Row */}
          <div className="mt-6">
            <label htmlFor="contact-phone-input" className={labelCls}>
              {fields.phone.label}
            </label>
            <div
              className={`relative flex rounded-lg border bg-white transition-all duration-300 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/10 ${
                errors.phone ? "border-[#a12b24]" : "border-ink/10"
              }`}
              ref={dropdownRef}
            >
              {/* Country Code Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setSearchQuery("");
                }}
                className="flex items-center gap-2 rounded-l-lg border-r border-ink/10 bg-paper/50 px-4 py-3 text-[0.9375rem] text-ink hover:bg-ink/5 transition-all focus:outline-none select-none"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <FlagIcon code={selectedCountry.code} />
                <span className="font-semibold text-navy/80">{selectedCountry.dial}</span>
                <svg className={`h-3 w-3 text-ink/40 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-blue" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Local Phone Number Input */}
              <input
                id="contact-phone-input"
                type="tel"
                required
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value.replace(/[^0-9\s-()]/g, ""))}
                inputMode="tel"
                autoComplete="tel-national"
                maxLength={25}
                placeholder={fields.phone.placeholder}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "contact-phone-error" : "contact-phone-hint"}
                data-field="phone"
                className="w-full rounded-r-lg bg-transparent px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink/30 focus:outline-none"
              />

              <input type="hidden" name="phone" value={localPhone.trim()} />
              <input type="hidden" name="phoneCountryCode" value={selectedCountry.code} />

              {/* Custom Country Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 max-h-72 w-80 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2.5 shadow-2xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                  <div className="sticky top-0 z-10 bg-white pb-2">
                    <div className="relative flex items-center">
                      <svg className="absolute left-3 h-4 w-4 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search country or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-ink/10 bg-paper/30 py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink/30 focus:border-blue/50 focus:bg-white focus:outline-none transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsDropdownOpen(false);
                          clearError("phone");
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                          selectedCountry.code === c.code 
                            ? "bg-blue/5 text-blue font-semibold" 
                            : "text-ink/80 hover:bg-ink/5 hover:text-navy"
                        }`}
                      >
                        <FlagIcon code={c.code} />
                        <span className="truncate flex-1 text-[0.875rem]">{c.name}</span>
                        <span className="text-xs font-mono text-ink/40 font-normal">{c.dial}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-6 text-center text-sm text-ink/40">
                        <p>No countries match &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.phone ? (
              <FieldError id="contact-phone-error" error={errors.phone} />
            ) : (
              <p id="contact-phone-hint" className="mt-2 text-xs text-ink/50">
                Choose a country code and enter the local phone number.
              </p>
            )}
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
              minLength={10}
              maxLength={2000}
              placeholder={fields.message.placeholder}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              data-field="message"
              className={`${fieldCls} resize-y ${errors.message ? "border-[#a12b24]" : ""}`}
            />
            <FieldError id="contact-message-error" error={errors.message} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : contact.form.submitLabel}
            </Button>
            <p aria-live="polite" className="text-sm">
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
