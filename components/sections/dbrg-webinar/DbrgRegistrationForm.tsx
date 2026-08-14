"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { countries } from "@/lib/content/countries";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";
import {
  PhoneCountryField,
  SearchableCountryField,
} from "@/components/ui/CountryFields";
import BrandedSelect from "@/components/ui/BrandedSelect";
import { validatePhoneForCountry } from "@/lib/phone-validation";

type Status = "idle" | "sending" | "error";
type FieldName =
  | "fullName"
  | "email"
  | "phone"
  | "nationality"
  | "company"
  | "designation"
  | "companyAddress"
  | "country"
  | "emirate"
  | "licenceType"
  | "freeZone"
  | "yearsInIndustry"
  | "businessCategory";
type FieldErrors = Partial<Record<FieldName, string>>;

const fieldClass =
  "mt-2 w-full min-w-0 max-w-full rounded-xl border border-navy/20 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-ink/60 transition-[border-color,box-shadow] duration-200 focus:border-dbrg-gold focus:outline-none focus:ring-2 focus:ring-dbrg-gold/25 disabled:cursor-not-allowed disabled:bg-mist/50 sm:text-[0.9375rem]";
const labelClass = "block text-[0.8125rem] font-medium text-navy sm:text-sm";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const licenceTypes = new Set<string>(dbrgWebinar.registrationOptions.licenceTypes);
const emirates = new Set<string>(dbrgWebinar.registrationOptions.emirates);
const freeZones = new Set<string>(dbrgWebinar.registrationOptions.freeZones);
const businessCategories = new Set<string>(
  dbrgWebinar.registrationOptions.businessCategories
);

function valueOf(data: FormData, field: string) {
  return String(data.get(field) ?? "").trim();
}

function validateRegistration(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = valueOf(data, "fullName");
  const email = valueOf(data, "email");
  const phone = valueOf(data, "phone");
  const phoneCountryCode = valueOf(data, "phoneCountryCode");
  const nationality = valueOf(data, "nationality");
  const company = valueOf(data, "company");
  const designation = valueOf(data, "designation");
  const companyAddress = valueOf(data, "companyAddress");
  const country = valueOf(data, "country");
  const emirate = valueOf(data, "emirate");
  const licenceType = valueOf(data, "licenceType");
  const freeZone = valueOf(data, "freeZone");
  const yearsInIndustry = valueOf(data, "yearsInIndustry");
  const businessCategory = valueOf(data, "businessCategory");

  if (!fullName) errors.fullName = "Enter your full name.";
  else if (fullName.length < 3 || fullName.length > 100)
    errors.fullName = "Full name must be between 3 and 100 characters.";
  else if (fullName.split(/\s+/).length < 2)
    errors.fullName = "Enter both your first name and surname.";

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > 254 || !emailPattern.test(email))
    errors.email = "Enter a valid email address.";

  const phoneValidation = validatePhoneForCountry(phone, phoneCountryCode);
  if (phoneValidation.error) errors.phone = phoneValidation.error;

  if (nationality && (nationality.length < 2 || nationality.length > 80))
    errors.nationality = "Nationality must be between 2 and 80 characters.";

  if (!company) errors.company = "Enter your company name.";
  else if (company.length < 2 || company.length > 120)
    errors.company = "Company name must be between 2 and 120 characters.";

  if (!designation) errors.designation = "Enter your designation.";
  else if (designation.length < 2 || designation.length > 120)
    errors.designation = "Designation must be between 2 and 120 characters.";

  if (!companyAddress) errors.companyAddress = "Enter your company address.";
  else if (companyAddress.length < 5 || companyAddress.length > 300)
    errors.companyAddress = "Company address must be between 5 and 300 characters.";

  const selectedCountry = countries.find(
    (item) => item.name.toLowerCase() === country.toLowerCase()
  );
  if (!country) errors.country = "Choose your country.";
  else if (!selectedCountry) {
    errors.country = "Choose a country from the options.";
  }

  if (selectedCountry?.code === "AE") {
    if (!emirate) errors.emirate = "Select your emirate.";
    else if (!emirates.has(emirate)) errors.emirate = "Select a valid emirate.";
  }

  if (!licenceType) errors.licenceType = "Select your licence type.";
  else if (!licenceTypes.has(licenceType))
    errors.licenceType = "Select a valid licence type.";

  if (licenceType === "Freezone") {
    if (!freeZone) errors.freeZone = "Select your free zone.";
    else if (!freeZones.has(freeZone)) errors.freeZone = "Select a valid free zone.";
  }

  if (yearsInIndustry) {
    const years = Number(yearsInIndustry);
    if (!Number.isInteger(years) || years < 0 || years > 100)
      errors.yearsInIndustry = "Enter a whole number between 0 and 100.";
  }

  if (!businessCategory) errors.businessCategory = "Select your business category.";
  else if (!businessCategories.has(businessCategory))
    errors.businessCategory = "Select a valid business category.";

  return errors;
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-2 text-xs font-medium text-dbrg-ink sm:text-sm" role="alert">
      {error}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}
      {optional ? (
        <span className="ml-2 font-normal text-ink/60">Optional</span>
      ) : (
        <span className="ml-1 text-dbrg-ink" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

export default function DbrgRegistrationForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [licenceType, setLicenceType] = useState("");

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const validationErrors = validateRegistration(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus("idle");
      const firstField = Object.keys(validationErrors)[0] as FieldName;
      requestAnimationFrame(() => {
        form
          .querySelector<HTMLElement>(`[data-field="${firstField}"], [name="${firstField}"]`)
          ?.focus();
      });
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/dbrg-webinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const result = (await response.json().catch(() => null)) as
        | { fields?: FieldErrors }
        | null;
      if (!response.ok) {
        if (result?.fields && Object.keys(result.fields).length > 0) {
          setErrors(result.fields);
          setStatus("idle");
          const firstField = Object.keys(result.fields)[0] as FieldName;
          requestAnimationFrame(() => {
            form
              .querySelector<HTMLElement>(`[data-field="${firstField}"], [name="${firstField}"]`)
              ?.focus();
          });
        } else {
          setStatus("error");
        }
        return;
      }
      router.replace("/dbrg-webinar/thank-you");
    } catch {
      setStatus("error");
    }
  }

  const disabled = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      onInputCapture={(event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const field = target.dataset.field ?? target.name;
        if (field) clearError(field as FieldName);
      }}
      className="w-full min-w-0 rounded-2xl border border-dbrg-gold/40 bg-white p-4 shadow-[0_20px_70px_rgb(var(--navy)/0.08)] sm:p-6 md:p-10"
      aria-busy={disabled}
      noValidate
    >
      <div className="max-w-2xl">
        <h2 className="text-xl font-medium text-navy sm:text-title-sm">{dbrgWebinar.form.title}</h2>
        <p className="mt-3 text-xs leading-relaxed text-ink/70 sm:text-sm">
          {dbrgWebinar.form.introduction}
        </p>
      </div>

      <fieldset disabled={disabled} className="mt-10 min-w-0">
        <legend className="text-base font-medium text-navy sm:text-lg">Your details</legend>
        <div className="mt-5 grid min-w-0 gap-6 [&>*]:min-w-0 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="dbrg-full-name">Full name</FieldLabel>
            <input
              id="dbrg-full-name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              minLength={3}
              maxLength={100}
              placeholder="First name and surname"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "dbrg-full-name-error" : undefined}
              data-field="fullName"
              className={`${fieldClass} ${errors.fullName ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-full-name-error" error={errors.fullName} />
          </div>
          <div>
            <FieldLabel htmlFor="dbrg-email">Email</FieldLabel>
            <input
              id="dbrg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "dbrg-email-error" : undefined}
              data-field="email"
              className={`${fieldClass} ${errors.email ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-email-error" error={errors.email} />
          </div>
          <div>
            <FieldLabel htmlFor="dbrg-phone">Mobile / WhatsApp</FieldLabel>
            <PhoneCountryField
              id="dbrg-phone"
              error={errors.phone}
              disabled={disabled}
              onValueChange={() => clearError("phone")}
            />
            <FieldError id="dbrg-phone-error" error={errors.phone} />
          </div>
          <div>
            <FieldLabel htmlFor="dbrg-nationality" optional>
              Nationality
            </FieldLabel>
            <input
              id="dbrg-nationality"
              name="nationality"
              type="text"
              autoComplete="country-name"
              minLength={2}
              maxLength={80}
              placeholder="Your nationality"
              aria-invalid={Boolean(errors.nationality)}
              aria-describedby={errors.nationality ? "dbrg-nationality-error" : undefined}
              data-field="nationality"
              className={`${fieldClass} ${errors.nationality ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-nationality-error" error={errors.nationality} />
          </div>
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="mt-10 min-w-0 border-t border-ink/10 pt-10">
        <legend className="px-0 text-base font-medium text-navy sm:text-lg">Company details</legend>
        <div className="mt-5 grid min-w-0 gap-6 [&>*]:min-w-0 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="dbrg-company">Company</FieldLabel>
            <input
              id="dbrg-company"
              name="company"
              type="text"
              required
              autoComplete="organization"
              minLength={2}
              maxLength={120}
              placeholder="Company name"
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "dbrg-company-error" : undefined}
              data-field="company"
              className={`${fieldClass} ${errors.company ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-company-error" error={errors.company} />
          </div>
          <div>
            <FieldLabel htmlFor="dbrg-designation">Designation</FieldLabel>
            <input
              id="dbrg-designation"
              name="designation"
              type="text"
              required
              autoComplete="organization-title"
              minLength={2}
              maxLength={120}
              placeholder="Your role or job title"
              aria-invalid={Boolean(errors.designation)}
              aria-describedby={errors.designation ? "dbrg-designation-error" : undefined}
              data-field="designation"
              className={`${fieldClass} ${errors.designation ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-designation-error" error={errors.designation} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="dbrg-company-address">Company address</FieldLabel>
            <textarea
              id="dbrg-company-address"
              name="companyAddress"
              required
              autoComplete="street-address"
              rows={3}
              minLength={5}
              maxLength={300}
              placeholder="Street address, city and postal code"
              aria-invalid={Boolean(errors.companyAddress)}
              aria-describedby={errors.companyAddress ? "dbrg-company-address-error" : undefined}
              data-field="companyAddress"
              className={`${fieldClass} resize-y ${errors.companyAddress ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-company-address-error" error={errors.companyAddress} />
          </div>
          <div className={selectedCountryCode === "AE" ? "" : "md:col-span-2"}>
            <FieldLabel htmlFor="dbrg-country">Country</FieldLabel>
            <SearchableCountryField
              id="dbrg-country"
              error={errors.country}
              disabled={disabled}
              required
              onValueChange={() => clearError("country")}
              onCountryChange={(country) => {
                setSelectedCountryCode(country?.code ?? "");
                clearError("country");
                if (country?.code !== "AE") clearError("emirate");
              }}
            />
            <FieldError id="dbrg-country-error" error={errors.country} />
          </div>

          {selectedCountryCode === "AE" && (
            <div>
              <FieldLabel htmlFor="dbrg-emirate">Emirate</FieldLabel>
              <BrandedSelect
                id="dbrg-emirate"
                name="emirate"
                options={dbrgWebinar.registrationOptions.emirates}
                placeholder="Select emirate"
                required
                autoComplete="address-level1"
                disabled={disabled}
                error={errors.emirate}
                describedBy={errors.emirate ? "dbrg-emirate-error" : undefined}
                onValueChange={() => clearError("emirate")}
              />
              <FieldError id="dbrg-emirate-error" error={errors.emirate} />
            </div>
          )}
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="mt-10 min-w-0 border-t border-ink/10 pt-10">
        <legend className="px-0 text-base font-medium text-navy sm:text-lg">Industry profile</legend>
        <div className="mt-5 grid min-w-0 gap-6 [&>*]:min-w-0 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="dbrg-licence-type">Licence type</FieldLabel>
            <BrandedSelect
              id="dbrg-licence-type"
              name="licenceType"
              options={dbrgWebinar.registrationOptions.licenceTypes}
              placeholder="Select licence type"
              required
              value={licenceType}
              disabled={disabled}
              error={errors.licenceType}
              describedBy={errors.licenceType ? "dbrg-licence-type-error" : undefined}
              onValueChange={(nextLicenceType) => {
                setLicenceType(nextLicenceType);
                clearError("licenceType");
                if (nextLicenceType !== "Freezone") clearError("freeZone");
              }}
            />
            <FieldError id="dbrg-licence-type-error" error={errors.licenceType} />
          </div>

          {licenceType === "Freezone" && (
            <div>
              <FieldLabel htmlFor="dbrg-free-zone">Free Zone</FieldLabel>
              <BrandedSelect
                id="dbrg-free-zone"
                name="freeZone"
                options={dbrgWebinar.registrationOptions.freeZones}
                placeholder="Select free zone"
                required
                disabled={disabled}
                error={errors.freeZone}
                describedBy={errors.freeZone ? "dbrg-free-zone-error" : undefined}
                onValueChange={() => clearError("freeZone")}
              />
              <FieldError id="dbrg-free-zone-error" error={errors.freeZone} />
            </div>
          )}

          <div>
            <FieldLabel htmlFor="dbrg-years" optional>
              Years in industry
            </FieldLabel>
            <input
              id="dbrg-years"
              name="yearsInIndustry"
              type="number"
              min="0"
              max="100"
              inputMode="numeric"
              placeholder="Number of years"
              aria-invalid={Boolean(errors.yearsInIndustry)}
              aria-describedby={errors.yearsInIndustry ? "dbrg-years-error" : undefined}
              data-field="yearsInIndustry"
              className={`${fieldClass} ${errors.yearsInIndustry ? "border-dbrg-ink/60" : ""}`}
            />
            <FieldError id="dbrg-years-error" error={errors.yearsInIndustry} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel htmlFor="dbrg-business-category">Business category</FieldLabel>
            <BrandedSelect
              id="dbrg-business-category"
              name="businessCategory"
              options={dbrgWebinar.registrationOptions.businessCategories}
              placeholder="Select business category"
              required
              disabled={disabled}
              error={errors.businessCategory}
              describedBy={errors.businessCategory ? "dbrg-business-category-error" : undefined}
              onValueChange={() => clearError("businessCategory")}
            />
            <FieldError id="dbrg-business-category-error" error={errors.businessCategory} />
          </div>
        </div>
      </fieldset>

      <div className="mt-10 border-t border-ink/10 pt-8">
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink/70 sm:text-sm">
          <input
            name="marketingConsent"
            value="yes"
            type="checkbox"
            disabled={disabled}
            className="mt-1 h-4 w-4 shrink-0 accent-dbrg-ink"
          />
          <span>
            I would like to receive relevant event, product and marketing updates from DBRG. I can opt out at any time.
          </span>
        </label>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="dbrg-website">Website</label>
        <input id="dbrg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <p className="mt-6 rounded-xl border border-dbrg-gold/40 bg-dbrg-gold/10 px-4 py-3 text-sm font-medium text-navy" role="alert">
          {dbrgWebinar.form.error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="mt-8 inline-flex min-w-44 items-center justify-center rounded-full bg-navy px-7 py-3.5 text-[0.8125rem] font-medium text-white transition-[transform,background-color] duration-200 hover:bg-dbrg-ink active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 sm:text-sm"
      >
        {disabled ? dbrgWebinar.form.sendingLabel : dbrgWebinar.form.submitLabel}
      </button>
    </form>
  );
}
