import { sql } from "./db";

export type ActivityAction =
  | "code requested"
  | "code refused"
  | "login success"
  | "login failed"
  | "new device"
  | "device limit blocked"
  | "session replaced"
  | "video opened"
  | "link refreshed"
  | "access expired"
  | "reminder sent"
  | "admin change";

export async function logActivity(a: {
  email?: string;
  action: ActivityAction;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  await sql`
    insert into activity_log (email, action, ip, user_agent, details)
    values (${a.email ?? null}, ${a.action}, ${a.ip ?? null}, ${a.userAgent ?? null},
            ${a.details ? sql.json(a.details as never) : null})
  `;
}
