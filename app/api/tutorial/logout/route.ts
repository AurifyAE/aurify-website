import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE } from "@/lib/tutorial/cookies";
import { endSession } from "@/lib/tutorial/login";

// A plain <form method="post"> works: the device stays registered, the session ends.
export async function POST(req: Request) {
  const scope = new URL(req.url).searchParams.get("scope") === "admin" ? "admin" : "viewer";
  const name = scope === "admin" ? COOKIE.admin : COOKIE.session;
  const jar = await cookies();
  const token = jar.get(name)?.value;
  if (token) await endSession(scope, token);
  jar.delete(name);
  return NextResponse.redirect(new URL(scope === "admin" ? "/admin/login" : "/login", req.url), 303);
}
