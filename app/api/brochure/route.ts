import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { site } from "@/lib/content/site";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedSources = new Set(["header", "mobile-menu", "footer"]);

function readText(data: Record<string, unknown>, key: string, maxLength: number) {
  return typeof data[key] === "string"
    ? data[key].trim().slice(0, maxLength)
    : "";
}

function isSecureUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function createLeadId(email: string) {
  return createHash("sha256")
    .update(`aurify-brochure-2026:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const email = readText(data, "email", 254).toLowerCase();
  const honeypot = readText(data, "website", 200);
  const requestedSource = readText(data, "source", 40);
  const source = allowedSources.has(requestedSource) ? requestedSource : "unknown";
  const requestedPage = readText(data, "page", 500);
  const page = requestedPage.startsWith("/") ? requestedPage : "/";

  if (!email || !emailPattern.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid work email address." },
      { status: 400 }
    );
  }

  // Bots commonly fill this visually hidden field. Give them a neutral
  // response without writing anything to the Sheet.
  if (honeypot) {
    return NextResponse.json({ ok: true, downloadUrl: site.brochure.downloadUrl });
  }

  const webhookUrl = process.env.BROCHURE_GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.BROCHURE_GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !isSecureUrl(webhookUrl) || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Brochure delivery is not configured." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        leadId: createLeadId(email),
        submittedAt: new Date().toISOString(),
        email,
        source,
        page,
      }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean }
      | null;

    if (!response.ok || result?.ok !== true) {
      return NextResponse.json(
        { ok: false, error: "Unable to save your email. Please try again." },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to save your email. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    downloadUrl: site.brochure.downloadUrl,
  });
}
