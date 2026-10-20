import { NextResponse } from "next/server";
import { validateContact, type ContactValues } from "@/lib/contact-validation";
import { countries } from "@/lib/content/countries";

/**
 * Contact form - validates, then upserts the lead into Zoho CRM (UAE data
 * centre) and emails it via Resend. Succeeds if either delivery lands, so a
 * lead is never lost when one provider is down.
 */

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.ae";
const ZOHO_API_URL = "https://www.zohoapis.ae";

// Zoho access tokens live 1h; reuse one per server instance.
let zohoToken: { value: string; expiresAt: number } | null = null;

async function getZohoAccessToken() {
  if (zohoToken && zohoToken.expiresAt > Date.now()) return zohoToken.value;

  const res = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }

  zohoToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return zohoToken.value;
}

async function upsertZohoLead(values: ContactValues) {
  const { name, email, company, phone, phoneCountryCode, message } = values;
  const [first, ...rest] = name.split(/\s+/);
  const country = countries.find((c) => c.code === phoneCountryCode)?.name;

  const lead = {
    // Zoho requires Last_Name; a single-word name goes there.
    First_Name: rest.length ? first : undefined,
    Last_Name: rest.length ? rest.join(" ") : first,
    Email: email,
    Company: company || "Not provided",
    Country: country,
    Mobile: phone,
    Phone: phone,
    Description: message,
    Lead_Source: "Website Enquiry",
    Lead_Status: "Not Contacted",
    Tag: [{ name: "Website Enquiry" }],
  };

  const res = await fetch(`${ZOHO_API_URL}/crm/v8/Leads/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${await getZohoAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [lead],
      duplicate_check_fields: ["Email"],
      trigger: [],
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.data?.[0]?.status !== "success") {
    throw new Error(`Zoho lead upsert failed: ${JSON.stringify(json)}`);
  }
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
  if (
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REFRESH_TOKEN
  ) {
    deliveries.push(upsertZohoLead(values));
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
