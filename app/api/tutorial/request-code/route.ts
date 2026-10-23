import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { randomToken } from "@/lib/tutorial/crypto";
import { COOKIE, DEVICE_COOKIE_SECONDS, clientInfo, cookieOptions } from "@/lib/tutorial/cookies";
import { requestCode } from "@/lib/tutorial/login";

/**
 * Always answers the same way, and does the work after responding, so neither
 * the body nor the timing reveals whether an email is approved.
 */
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof data.email === "string" ? data.email : "";
  const scope = data.scope === "admin" ? "admin" : "viewer";
  const jar = await cookies();
  let deviceId = jar.get(COOKIE.device)?.value;
  if (!deviceId) {
    deviceId = randomToken();
    jar.set(COOKIE.device, deviceId, cookieOptions(DEVICE_COOKIE_SECONDS));
  }

  const info = clientInfo(req.headers);
  const id = deviceId;
  after(() => requestCode(scope, email, id, info).catch((e) => console.error("[tutorial]", e)));

  return NextResponse.json({ ok: true, message: "If this email has access, a code has been sent." });
}
