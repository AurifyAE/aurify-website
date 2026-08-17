import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { countries } from "@/lib/content/countries";
import { dbrgWebinar } from "@/lib/content/dbrg-webinar";
import { validatePhoneForCountry } from "@/lib/phone-validation";

const formFields = [
  "fullName",
  "company",
  "companyAddress",
  "designation",
  "email",
  "phone",
  "phoneCountryCode",
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
const emailLogoFiles = [
  { filename: "aurify-logo.png", contentId: "aurify-logo" },
  { filename: "dbrg-logo.png", contentId: "dbrg-logo" },
] as const;

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

  const phoneValidation = validatePhoneForCountry(
    values.phone,
    values.phoneCountryCode
  );
  if (phoneValidation.error) errors.phone = phoneValidation.error;

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

function createRegistrationId(email: string) {
  return createHash("sha256")
    .update(`dbrg-e-invoicing-webinar-2026:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
}

function isSecureUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function appendToGoogleSheet({
  webhookUrl,
  webhookSecret,
  registrationId,
  submittedAt,
  values,
}: {
  webhookUrl: string;
  webhookSecret: string;
  registrationId: string;
  submittedAt: string;
  values: Record<string, string>;
}) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: webhookSecret,
      registrationId,
      submittedAt,
      ...values,
    }),
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  return response.ok && result?.ok === true;
}

function sendEmail({
  apiKey,
  idempotencyKey,
  payload,
}: {
  apiKey: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
}) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}

async function loadEmailLogoAttachments() {
  return Promise.all(
    emailLogoFiles.map(async ({ filename, contentId }) => ({
      content: (
        await readFile(
          join(process.cwd(), "public", "images", "dbrg", "email", filename)
        )
      ).toString("base64"),
      filename,
      content_id: contentId,
      content_type: "image/png",
    }))
  );
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

  const normalizedPhone = validatePhoneForCountry(
    values.phone,
    values.phoneCountryCode
  ).normalized;
  if (normalizedPhone) values.phone = normalizedPhone;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const sheetsWebhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  const webinarUrl = process.env.DBRG_WEBINAR_TEAMS_URL;
  const to =
    process.env.DBRG_REGISTRATION_TO_EMAIL ??
    process.env.CONTACT_TO_EMAIL ??
    "info@aurify.ae";

  if (
    !apiKey ||
    !from ||
    !sheetsWebhookUrl ||
    !isSecureUrl(sheetsWebhookUrl) ||
    !sheetsWebhookSecret ||
    !webinarUrl ||
    !isSecureUrl(webinarUrl)
  ) {
    return NextResponse.json(
      { ok: false, error: "Registration delivery is not configured." },
      { status: 503 }
    );
  }

  let emailLogoAttachments: Awaited<ReturnType<typeof loadEmailLogoAttachments>>;
  try {
    emailLogoAttachments = await loadEmailLogoAttachments();
  } catch (error) {
    console.error("Unable to load DBRG confirmation email logos.", error);
    return NextResponse.json(
      { ok: false, error: "Registration email assets are unavailable." },
      { status: 500 }
    );
  }

  const registrationId = createRegistrationId(values.email);
  const submittedAt = new Date().toISOString();

  try {
    const stored = await appendToGoogleSheet({
      webhookUrl: sheetsWebhookUrl,
      webhookSecret: sheetsWebhookSecret,
      registrationId,
      submittedAt,
      values,
    });

    if (!stored) {
      return NextResponse.json(
        { ok: false, error: "Unable to save registration. Please try again." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to save registration. Please try again." },
      { status: 502 }
    );
  }

  const eventTitle = "E-Invoicing Essentials: Preparing for the Digital Tax Future";

  const [confirmationResult, internalResult] = await Promise.allSettled([
      sendEmail({
        apiKey,
        idempotencyKey: `dbrg-confirmation-${registrationId}`,
        payload: {
          from,
          to: [values.email],
          subject: `Your registration is confirmed: ${eventTitle}`,
          attachments: emailLogoAttachments,
          text: [
            "Registration Confirmed",
            "",
            `Your spot is reserved for our upcoming Live Webinar, “${eventTitle}.”`,
            "",
            "Date: Thursday, September 10, 2026",
            "Time: 3:30 PM GST",
            "Platform: Microsoft Teams",
            "",
            "We will share the webinar link with you shortly.",
            "",
            "We look forward to having you join us online for this insightful session!",
            "",
            "Best regards,",
            "Dubai Business Group for Gold and Refinery",
          ].join("\n"),
          html: `
            <div style="margin:0;background:#f5f7f8;padding:32px 16px;font-family:Arial,sans-serif;color:#17233c">
              <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e3c36c;border-radius:16px;overflow:hidden">
                <div style="height:8px;background:#d5ad3e"></div>
                <div style="padding:32px">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;border-bottom:1px solid #eadcae">
                    <tr>
                      <td width="50%" align="center" valign="middle" style="padding:0 12px 22px">
                        <img src="cid:aurify-logo" width="112" alt="Aurify Technology" style="display:block;width:112px;max-width:100%;height:auto;margin:0 auto;border:0">
                      </td>
                      <td width="50%" align="center" valign="middle" style="padding:0 12px 22px">
                        <img src="cid:dbrg-logo" width="66" alt="DBRG" style="display:block;width:66px;max-width:100%;height:auto;margin:0 auto;border:0">
                        <p style="margin:8px auto 0;max-width:230px;font-size:12px;line-height:1.35;font-weight:600;color:#17233c">${dbrgWebinar.organisationName}</p>
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0;font-size:25px;line-height:1.25;color:#17233c">Registration Confirmed</h1>
                  <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#4b5563">Your spot is reserved for our upcoming Live Webinar, &ldquo;<strong>${eventTitle}</strong>.&rdquo;</p>
                  <div style="margin:24px 0;padding:20px;background:#f8f3e5;border-radius:12px;font-size:15px;line-height:1.8">
                    <strong>Date:</strong> Thursday, September 10, 2026<br>
                    <strong>Time:</strong> 3:30 PM GST<br>
                    <strong>Platform:</strong> Microsoft Teams
                  </div>
                  <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#4b5563">We will share the webinar link with you shortly.</p>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.6;color:#4b5563">We look forward to having you join us online for this insightful session!</p>
                  <p style="margin:24px 0 0;font-size:15px;line-height:1.6">Best regards,<br><strong>Dubai Business Group for Gold and Refinery</strong></p>
                </div>
              </div>
            </div>
          `,
        },
      }),
      sendEmail({
        apiKey,
        idempotencyKey: `dbrg-internal-${registrationId}`,
        payload: {
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
            `Phone country: ${values.phoneCountryCode}`,
            `Licence type: ${values.licenceType}`,
            `Free Zone: ${values.freeZone || "Not applicable"}`,
            `Nationality: ${values.nationality || "Not provided"}`,
            `Years in industry: ${values.yearsInIndustry || "Not provided"}`,
            `Business category: ${values.businessCategory}`,
            `Marketing consent: ${values.marketingConsent === "yes" ? "Yes" : "No"}`,
            `Registration reference: ${registrationId}`,
            `Submitted at: ${submittedAt}`,
          ].join("\n"),
        },
      }),
    ]);

  if (confirmationResult.status === "rejected" || !confirmationResult.value.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Registration was saved, but the confirmation email could not be sent. Please try again.",
      },
      { status: 502 }
    );
  }

  if (internalResult.status === "rejected" || !internalResult.value.ok) {
    console.error("DBRG registration saved and confirmed, but the internal notification failed.");
  }

  return NextResponse.json({ ok: true, registrationId });
}
