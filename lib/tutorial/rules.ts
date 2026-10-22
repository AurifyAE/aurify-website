/**
 * Client tutorial access rules. Pure functions with no imports, so
 * `node --test` can load them directly; every server path decides from here.
 */

export const DEFAULT_ACCESS_DAYS = 14;

export const LIMITS = {
  codeTtlMs: 600_000,
  maxWrongTries: 5,
  emailGapMs: 60_000,
  emailPerHour: 5,
  ipPerHour: 20,
  maxDevices: 3,
  maxSessions: 3,
  sessionMs: 43_200_000,
  linkGraceSeconds: 1800,
  reminderLeadHours: [36, 60],
} as const;

const DAY_MS = 86_400_000;

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "yandex.com",
  "mail.com",
  "zoho.com",
]);

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isFreeMailDomain(email: string): boolean {
  return FREE_MAIL_DOMAINS.has(normalizeEmail(email).split("@").pop() ?? "");
}

export function accessWindow(now: Date, days: number): { start: Date; end: Date } {
  return { start: now, end: new Date(now.getTime() + days * DAY_MS) };
}

export function sessionExpiry(now: Date, accessEnd: Date): Date {
  return new Date(Math.min(now.getTime() + LIMITS.sessionMs, accessEnd.getTime()));
}

export function signedUrlTtl(now: Date, accessEnd: Date, videoSeconds: number): number {
  const untilEnd = Math.floor((accessEnd.getTime() - now.getTime()) / 1000);
  return Math.max(0, Math.min(videoSeconds + LIMITS.linkGraceSeconds, untilEnd));
}

export function canRequestCode(
  r: { emailLastAt: Date | null; emailLastHour: number; ipLastHour: number },
  now: Date
): boolean {
  if (r.emailLastAt && now.getTime() - r.emailLastAt.getTime() < LIMITS.emailGapMs) return false;
  return r.emailLastHour < LIMITS.emailPerHour && r.ipLastHour < LIMITS.ipPerHour;
}

export function deviceDecision(known: boolean, activeDevices: number): "ok" | "add" | "blocked" {
  if (known) return "ok";
  return activeDevices < LIMITS.maxDevices ? "add" : "blocked";
}

/** How many of the oldest active sessions to end before creating a new one. */
export function sessionsToEnd(activeSessions: number): number {
  return Math.max(0, activeSessions - LIMITS.maxSessions + 1);
}

export function deviceLabel(userAgent: string): string {
  const ua = userAgent;
  // Order matters: Edge and Opera also say Chrome, and Chrome also says Safari.
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox|FxiOS/.test(ua)
        ? "Firefox"
        : /Chrome|CriOS/.test(ua)
          ? "Chrome"
          : /Safari/.test(ua)
            ? "Safari"
            : null;
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : null;
  if (!browser && !os) return "Unknown browser";
  return `${browser ?? "Browser"} · ${os ?? "Unknown OS"}`;
}

const gulfFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatGulf(date: Date): string {
  return gulfFormat.format(date);
}

export function accessStatus(
  u: { active: boolean; accessStartedAt: Date | null; accessExpiresAt: Date | null },
  now: Date
): { status: "disabled" | "not_started" | "active" | "expired"; daysLeft: number } {
  if (!u.active) return { status: "disabled", daysLeft: 0 };
  if (!u.accessStartedAt || !u.accessExpiresAt) {
    return { status: "not_started", daysLeft: DEFAULT_ACCESS_DAYS };
  }
  const left = u.accessExpiresAt.getTime() - now.getTime();
  if (left <= 0) return { status: "expired", daysLeft: 0 };
  return { status: "active", daysLeft: Math.ceil(left / DAY_MS) };
}
