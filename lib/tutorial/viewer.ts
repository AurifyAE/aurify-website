import { cookies } from "next/headers";
import { sql } from "./db";
import { hmac } from "./crypto";
import { COOKIE } from "./cookies";

export type Viewer = {
  email: string;
  sessionId: number;
  deviceId: number;
  accessExpiresAt: Date;
};

export type ViewerResult =
  | { ok: true; viewer: Viewer }
  | { ok: false; reason: "none" | "expired" | "invalid" };

/**
 * The one server-side check behind every tutorial request: session, device
 * and email must all still be valid. A failed check ends the session.
 */
export async function getViewer(): Promise<ViewerResult> {
  const jar = await cookies();
  const token = jar.get(COOKIE.session)?.value;
  const deviceCookie = jar.get(COOKIE.device)?.value;
  if (!token) return { ok: false, reason: "none" };

  const [row] = await sql`
    select s.id as session_id, s.ended, s.expires_at, s.device_id,
           d.removed, d.device_hash,
           u.email, u.active, u.access_expires_at
    from sessions s
    join devices d on d.id = s.device_id
    join allowed_users u on u.email = s.email
    where s.token_hash = ${hmac(token)}
  `;
  if (!row) return { ok: false, reason: "invalid" };

  const now = new Date();
  const accessLive = row.access_expires_at !== null && row.access_expires_at > now;
  const sessionLive = !row.ended && row.expires_at > now;
  const deviceOk =
    !row.removed && deviceCookie !== undefined && row.device_hash === hmac(deviceCookie);

  if (!accessLive || !sessionLive || !deviceOk || !row.active) {
    if (!row.ended) await sql`update sessions set ended = true where id = ${row.session_id}`;
    return { ok: false, reason: row.active && !accessLive ? "expired" : "invalid" };
  }

  await sql`update sessions set last_active = now() where id = ${row.session_id}`;
  await sql`update devices set last_seen = now() where id = ${row.device_id}`;
  return {
    ok: true,
    viewer: {
      email: row.email,
      sessionId: row.session_id,
      deviceId: row.device_id,
      accessExpiresAt: row.access_expires_at,
    },
  };
}
