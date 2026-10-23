import { createHmac, randomBytes, randomInt } from "node:crypto";

/** Keyed hash for tokens, codes and device IDs; a leaked DB can't log anyone in. */
export function hmac(value: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function randomCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
