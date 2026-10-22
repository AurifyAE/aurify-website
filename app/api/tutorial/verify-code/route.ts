import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, clientInfo, cookieOptions } from "@/lib/tutorial/cookies";
import { verifyCode, type VerifyResult } from "@/lib/tutorial/login";

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof data.email === "string" ? data.email : "";
  const code = typeof data.code === "string" ? data.code.trim() : "";
  const scope = data.scope === "admin" ? "admin" : "viewer";
  const jar = await cookies();
  const deviceId = jar.get(COOKIE.device)?.value;

  // No device cookie means this isn't the browser that asked for the code.
  const result: VerifyResult =
    deviceId && /^\d{6}$/.test(code)
      ? await verifyCode(scope, email, code, deviceId, clientInfo(req))
      : { ok: false, reason: "invalid" };

  if (!result.ok) {
    return result.reason === "device_limit"
      ? NextResponse.json({ ok: false, error: "Device limit reached. Contact support." }, { status: 403 })
      : NextResponse.json({ ok: false, error: "Invalid or expired code." }, { status: 400 });
  }

  jar.set(scope === "admin" ? COOKIE.admin : COOKIE.session, result.token, cookieOptions(result.maxAgeSeconds));
  return NextResponse.json({ ok: true, redirect: scope === "admin" ? "/admin" : "/tutorial" });
}
