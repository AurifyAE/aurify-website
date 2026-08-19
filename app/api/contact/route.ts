import { NextResponse } from "next/server";
import { validateContact } from "@/lib/contact-validation";

/**
 * Contact form stub - validates and acknowledges. Wire an email/CRM
 * provider here (Resend, SES, HubSpot…) without touching the UI.
 */
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

  const { name, email, company, phone, message } = values;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL ?? "info@aurify.ae";

  if (!apiKey || !from) {
    return NextResponse.json(
      { ok: false, error: "Contact delivery is not configured." },
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

  if (!delivery.ok) {
    return NextResponse.json(
      { ok: false, error: "Unable to send your message. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
