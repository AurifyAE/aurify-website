import { NextResponse } from "next/server";
import { validateContact, type ContactValues } from "@/lib/contact-validation";
import { countries } from "@/lib/content/countries";
import { isZohoConfigured, upsertZohoLead } from "@/lib/zoho";

/**
 * Contact form - validates, then upserts the lead into Zoho CRM and emails it
 * via Resend. Succeeds if either delivery lands, so a lead is never lost when
 * one provider is down.
 */

// Keyed by ContactForm's idPrefix, which each form posts as `form`.
const leadSources: Record<string, string> = {
  contact: "Website - Contact Page",
  "demo-modal": "Website - Demo Popup",
  "homepage-demo": "Website - Homepage Demo",
};

function upsertContactLead(values: ContactValues, form: string) {
  const { name, email, company, phone, phoneCountryCode, message } = values;
  const [first, ...rest] = name.split(/\s+/);

  return upsertZohoLead({
    // Zoho requires Last_Name; a single-word name goes there.
    First_Name: rest.length ? first : undefined,
    Last_Name: rest.length ? rest.join(" ") : first,
    Email: email,
    Company: company || "Not provided",
    Country: countries.find((c) => c.code === phoneCountryCode)?.name,
    Mobile: phone,
    Phone: phone,
    Description: message,
    Lead_Source: leadSources[form] ?? "Website Enquiry",
  });
}

async function sendResendEmail(values: ContactValues) {
  const { name, email, company, phone, message } = values;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL ?? "info@aurify.ae"],
      reply_to: email,
      subject: `Contact form: ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "Not provided"}`,
        `Phone: ${phone}`,
        "",
        message,
      ].join("\n"),
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { values, errors } = validateContact(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Please correct the highlighted fields.", fields: errors },
      { status: 400 }
    );
  }

  const deliveries: Promise<void>[] = [];
  if (isZohoConfigured()) {
    deliveries.push(upsertContactLead(values, String(data.form ?? "")));
  }
  if (process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL) {
    deliveries.push(sendResendEmail(values));
  }

  if (deliveries.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Contact delivery is not configured." },
      { status: 503 }
    );
  }

  const results = await Promise.allSettled(deliveries);
  for (const r of results) {
    if (r.status === "rejected") console.error("[contact]", r.reason);
  }

  if (!results.some((r) => r.status === "fulfilled")) {
    return NextResponse.json(
      { ok: false, error: "Unable to send your message. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
