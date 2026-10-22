import { sql } from "./db";
import { hmac, randomCode, randomToken } from "./crypto";
import { logActivity } from "./log";
import {
  accessGrantedEmail,
  adminEmails,
  codeEmail,
  deviceLimitAdminEmail,
  newDeviceEmail,
  sendMail,
  signedOutEmail,
} from "./mail";
import {
  LIMITS,
  accessWindow,
  canRequestCode,
  deviceDecision,
  deviceLabel,
  normalizeEmail,
  sessionExpiry,
  sessionsToEnd,
} from "./rules";

/**
 * One-time code login for clients ("viewer") and admins. Every rule from the
 * access plan is enforced here, server side; the routes only move cookies.
 */

export type Scope = "viewer" | "admin";
type ClientInfo = { ip: string; userAgent: string };
type Mail = { to: string[]; subject: string; text: string };

export type VerifyResult =
  | { ok: true; token: string; maxAgeSeconds: number }
  | { ok: false; reason: "invalid" | "device_limit" };

// Admin codes are keyed apart so a client code can never open the admin page.
const codeKey = (scope: Scope, email: string) => (scope === "admin" ? `admin:${email}` : email);

async function isEligible(scope: Scope, email: string): Promise<boolean> {
  if (scope === "admin") return adminEmails().includes(email);
  const rows = await sql`
    select 1 from allowed_users
    where email = ${email} and active
      and (access_expires_at is null or access_expires_at > now())
  `;
  return rows.length > 0;
}

async function deliver(outbox: Mail[]) {
  const results = await Promise.allSettled(outbox.map((m) => sendMail(m.to, m.subject, m.text)));
  for (const r of results) if (r.status === "rejected") console.error("[tutorial mail]", r.reason);
}

export async function requestCode(
  scope: Scope,
  rawEmail: string,
  deviceId: string,
  info: ClientInfo
): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email.includes("@")) return;
  const key = codeKey(scope, email);
  const now = new Date();

  // Refused requests count toward the network limit too: they are the probes.
  const [counts] = await sql`
    select
      (select max(created_at) from login_codes where email = ${key}) as email_last_at,
      (select count(*)::int from login_codes
        where email = ${key} and created_at > now() - interval '1 hour') as email_last_hour,
      (select count(*)::int from activity_log
        where ip = ${info.ip} and action in ('code requested', 'code refused')
          and at > now() - interval '1 hour') as ip_last_hour
  `;
  const allowed = canRequestCode(
    {
      emailLastAt: counts.email_last_at,
      emailLastHour: counts.email_last_hour,
      ipLastHour: counts.ip_last_hour,
    },
    now
  );
  if (!allowed) return;

  const details = scope === "admin" ? { scope } : undefined;
  if (!(await isEligible(scope, email))) {
    await logActivity({ email, action: "code refused", ...info, details });
    return;
  }

  const code = randomCode();
  await sql.begin(async (tx) => {
    await tx`update login_codes set used = true where email = ${key} and not used`;
    await tx`
      insert into login_codes (email, code_hash, device_hash, expires_at)
      values (${key}, ${hmac(code)}, ${hmac(deviceId)}, ${new Date(now.getTime() + LIMITS.codeTtlMs)})
    `;
  });
  const mail = codeEmail(code);
  await sendMail([email], mail.subject, mail.text);
  await logActivity({ email, action: "code requested", ...info, details });
}

export async function verifyCode(
  scope: Scope,
  rawEmail: string,
  code: string,
  deviceId: string,
  info: ClientInfo
): Promise<VerifyResult> {
  const email = normalizeEmail(rawEmail);
  const key = codeKey(scope, email);
  const now = new Date();
  const outbox: Mail[] = [];
  const fail = async (reason: string): Promise<VerifyResult> => {
    await logActivity({ email, action: "login failed", ...info, details: { reason, scope } });
    return { ok: false, reason: "invalid" };
  };

  const result = (await sql.begin(async (tx): Promise<VerifyResult> => {
    const [row] = await tx`
      select id, code_hash, device_hash from login_codes
      where email = ${key} and not used and expires_at > now()
      order by created_at desc limit 1
      for update
    `;
    if (!row) return fail("no active code");
    if (row.code_hash !== hmac(code) || row.device_hash !== hmac(deviceId)) {
      await tx`
        update login_codes
        set wrong_attempts = wrong_attempts + 1,
            used = wrong_attempts + 1 >= ${LIMITS.maxWrongTries}
        where id = ${row.id}
      `;
      return fail(row.code_hash === hmac(code) ? "different browser" : "wrong code");
    }
    await tx`update login_codes set used = true where id = ${row.id}`;
    const token = randomToken();

    if (scope === "admin") {
      await tx`
        insert into admin_sessions (token_hash, email, expires_at)
        values (${hmac(token)}, ${email}, ${new Date(now.getTime() + LIMITS.sessionMs)})
      `;
      await logActivity({ email, action: "login success", ...info, details: { scope } });
      return { ok: true, token, maxAgeSeconds: LIMITS.sessionMs / 1000 };
    }

    // Row lock serialises parallel logins, so two new devices can't both take slot 3.
    const [user] = await tx`
      select access_days, access_started_at, access_expires_at, active
      from allowed_users where email = ${email}
      for update
    `;
    if (!user || !user.active || (user.access_expires_at && user.access_expires_at <= now)) {
      return fail("no access");
    }

    const deviceHash = hmac(deviceId);
    const label = deviceLabel(info.userAgent);
    const [known] = await tx`
      select id from devices where email = ${email} and device_hash = ${deviceHash} and not removed
    `;
    const [{ n: deviceCount }] = await tx`
      select count(*)::int as n from devices where email = ${email} and not removed
    `;
    const decision = deviceDecision(Boolean(known), deviceCount);
    if (decision === "blocked") {
      await logActivity({ email, action: "device limit blocked", ...info, details: { label } });
      const alert = deviceLimitAdminEmail(email, label);
      if (adminEmails().length) outbox.push({ to: adminEmails(), ...alert });
      return { ok: false, reason: "device_limit" };
    }

    let deviceRowId: number;
    if (decision === "add") {
      const [added] = await tx`
        insert into devices (email, device_hash, label) values (${email}, ${deviceHash}, ${label})
        returning id
      `;
      deviceRowId = added.id;
      outbox.push({ to: [email], ...newDeviceEmail(label) });
      await logActivity({ email, action: "new device", ...info, details: { label } });
    } else {
      deviceRowId = known.id;
      await tx`update devices set last_seen = now() where id = ${deviceRowId}`;
    }

    const active = await tx`
      select id from sessions
      where email = ${email} and not ended and expires_at > now()
      order by created_at asc
    `;
    for (const s of active.slice(0, sessionsToEnd(active.length))) {
      await tx`update sessions set ended = true where id = ${s.id}`;
      outbox.push({ to: [email], ...signedOutEmail() });
      await logActivity({ email, action: "session replaced", ...info, details: { sessionId: s.id } });
    }

    let accessEnd: Date = user.access_expires_at;
    if (!user.access_started_at) {
      const window = accessWindow(now, user.access_days);
      await tx`
        update allowed_users
        set access_started_at = ${window.start}, access_expires_at = ${window.end}
        where email = ${email}
      `;
      accessEnd = window.end;
      outbox.push({ to: [email], ...accessGrantedEmail(window.end) });
    }

    const expires = sessionExpiry(now, accessEnd);
    await tx`
      insert into sessions (token_hash, email, device_id, expires_at)
      values (${hmac(token)}, ${email}, ${deviceRowId}, ${expires})
    `;
    await logActivity({ email, action: "login success", ...info, details: { label } });
    return {
      ok: true,
      token,
      maxAgeSeconds: Math.floor((expires.getTime() - now.getTime()) / 1000),
    };
  })) as VerifyResult;

  await deliver(outbox);
  return result;
}

export async function endSession(scope: Scope, token: string): Promise<void> {
  if (scope === "admin") {
    await sql`update admin_sessions set ended = true where token_hash = ${hmac(token)}`;
  } else {
    await sql`update sessions set ended = true where token_hash = ${hmac(token)}`;
  }
}
