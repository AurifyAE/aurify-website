import { NextResponse } from "next/server";

/**
 * Contact form stub — validates and acknowledges. Wire an email/CRM
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

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  // TODO: forward to the delivery provider. Logged for now so submissions
  // are visible in server logs during development.
  console.log("[contact] submission", {
    name,
    email,
    company: data.company ?? "",
    message: message.slice(0, 1000),
  });

  return NextResponse.json({ ok: true });
}
