export const COOKIE = {
  device: "aurify_dev",
  session: "aurify_sess",
  admin: "aurify_admin",
} as const;

export const DEVICE_COOKIE_SECONDS = 365 * 86_400;

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: true,
    // Lax, not Strict: links opened from WhatsApp or email keep the login.
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function clientInfo(req: Request): { ip: string; userAgent: string } {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: req.headers.get("user-agent") ?? "",
  };
}
