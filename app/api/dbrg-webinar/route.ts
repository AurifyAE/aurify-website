import { NextResponse } from "next/server";
import { countries } from "@/lib/content/countries";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";

const formFields = [
  "fullName",
  "company",
  "companyAddress",
  "designation",
  "email",
  "phone",
  "licenceType",
  "freeZone",
  "businessCategory",
  "country",
  "emirate",
  "nationality",
  "yearsInIndustry",
  "marketingConsent",
] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const licenceTypes = new Set<string>(dbrgWebinar.registrationOptions.licenceTypes);
const emirates = new Set<string>(dbrgWebinar.registrationOptions.emirates);
const freeZones = new Set<string>(dbrgWebinar.registrationOptions.freeZones);
const businessCategories = new Set<string>(
  dbrgWebinar.registrationOptions.businessCategories
);

function readText(data: Record<string, unknown>, key: string) {
  const value = typeof data[key] === "string" ? data[key].trim() : "";
  return value.slice(0, 1001);
}

function validateRegistration(values: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!values.fullName) errors.fullName = "Enter your full name.";
  else if (values.fullName.length < 3 || values.fullName.length > 100)
    errors.fullName = "Full name must be between 3 and 100 characters.";
  else if (values.fullName.split(/\s+/).length < 2)
    errors.fullName = "Enter both your first name and surname.";

  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > 254 || !emailPattern.test(values.email))
    errors.email = "Enter a valid email address.";

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (!values.phone) errors.phone = "Enter your mobile or WhatsApp number.";
  else if (phoneDigits.length < 7 || phoneDigits.length > 15)
    errors.phone = "Enter a valid phone number with 7 to 15 digits.";

  if (!values.company) errors.company = "Enter your company name.";
  else if (values.company.length < 2 || values.company.length > 120)
    errors.company = "Company name must be between 2 and 120 characters.";

  if (!values.designation) errors.designation = "Enter your designation.";
  else if (values.designation.length < 2 || values.designation.length > 120)
    errors.designation = "Designation must be between 2 and 120 characters.";

  if (!values.companyAddress) errors.companyAddress = "Enter your company address.";
  else if (values.companyAddress.length < 5 || values.companyAddress.length > 300)
    errors.companyAddress = "Company address must be between 5 and 300 characters.";

  const selectedCountry = countries.find(
    (country) => country.name.toLowerCase() === values.country.toLowerCase()
  );
  if (!values.country) errors.country = "Choose your country.";
  else if (!selectedCountry) {
    errors.country = "Choose a country from the options.";
  }

  if (selectedCountry?.code === "AE") {
    if (!values.emirate) errors.emirate = "Select your emirate.";
    else if (!emirates.has(values.emirate)) errors.emirate = "Select a valid emirate.";
  }

  if (values.nationality && (values.nationality.length < 2 || values.nationality.length > 80))
    errors.nationality = "Nationality must be between 2 and 80 characters.";

  if (!values.licenceType) errors.licenceType = "Select your licence type.";
  else if (!licenceTypes.has(values.licenceType))
    errors.licenceType = "Select a valid licence type.";

  if (values.licenceType === "Freezone") {
    if (!values.freeZone) errors.freeZone = "Select your free zone.";
    else if (!freeZones.has(values.freeZone)) errors.freeZone = "Select a valid free zone.";
  }

  if (values.yearsInIndustry) {
    const years = Number(values.yearsInIndustry);
    if (!Number.isInteger(years) || years < 0 || years > 100)
      errors.yearsInIndustry = "Enter a whole number between 0 and 100.";
  }

  if (!values.businessCategory) errors.businessCategory = "Select your business category.";
  else if (!businessCategories.has(values.businessCategory))
    errors.businessCategory = "Select a valid business category.";

  return errors;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (readText(data, "website")) {
    return NextResponse.json({ ok: true });
  }

  const values = Object.fromEntries(
    formFields.map((key) => [key, readText(data, key)])
  ) as Record<string, string>;

  const fieldErrors = validateRegistration(values);
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Check the highlighted fields.", fields: fieldErrors },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to =
    process.env.DBRG_REGISTRATION_TO_EMAIL ??
    process.env.CONTACT_TO_EMAIL ??
    "info@aurify.ae";

  if (!apiKey || !from) {
    return NextResponse.json(
      { ok: false, error: "Registration delivery is not configured." },
      { status: 503 }
    );
  }

  const delivery = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: values.email,
      subject: `DBRG webinar registration: ${values.fullName}`,
      text: [
        "New DBRG webinar registration",
        "",
        `Full name: ${values.fullName}`,
        `Company: ${values.company}`,
        `Company address: ${values.companyAddress}`,
        `Country: ${values.country}`,
        `Emirate: ${values.emirate || "Not applicable"}`,
        `Designation: ${values.designation}`,
        `Email: ${values.email}`,
        `Mobile / WhatsApp: ${values.phone}`,
        `Licence type: ${values.licenceType}`,
        `Free Zone: ${values.freeZone || "Not applicable"}`,
        `Nationality: ${values.nationality || "Not provided"}`,
        `Years in industry: ${values.yearsInIndustry || "Not provided"}`,
        `Business category: ${values.businessCategory}`,
        `Marketing consent: ${values.marketingConsent === "yes" ? "Yes" : "No"}`,
      ].join("\n"),
    }),
  });

  if (!delivery.ok) {
    return NextResponse.json(
      { ok: false, error: "Unable to submit registration. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
