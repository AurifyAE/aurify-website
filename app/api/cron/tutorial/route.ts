import { NextResponse } from "next/server";
import { sql } from "@/lib/tutorial/db";
import { logActivity } from "@/lib/tutorial/log";
import { reminderEmail, sendMail } from "@/lib/tutorial/mail";
import { LIMITS } from "@/lib/tutorial/rules";

/**
 * Daily Vercel Cron job (vercel.json): reminds clients ~2 days before access
 * ends, then marks ended sessions and expired access. Nothing is deleted.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [fromHours, toHours] = LIMITS.reminderLeadHours;
  // One reminder per access period: none since this period started.
  const due = await sql`
    select u.email, u.access_expires_at from allowed_users u
    where u.active
      and u.access_expires_at between now() + make_interval(hours => ${fromHours})
                                  and now() + make_interval(hours => ${toHours})
      and not exists (
        select 1 from activity_log a
        where a.email = u.email and a.action = 'reminder sent' and a.at >= u.access_started_at
      )
  `;
  let reminded = 0;
  for (const u of due) {
    const mail = reminderEmail(u.access_expires_at);
    try {
      await sendMail([u.email], mail.subject, mail.text);
      await logActivity({ email: u.email, action: "reminder sent" });
      reminded++;
    } catch (e) {
      console.error("[tutorial cron]", u.email, e);
    }
  }

  const ended = await sql`
    update sessions set ended = true where not ended and expires_at < now() returning id
  `;
  const expired = await sql`
    select u.email from allowed_users u
    where u.access_expires_at < now()
      and not exists (
        select 1 from activity_log a
        where a.email = u.email and a.action = 'access expired' and a.at >= u.access_started_at
      )
  `;
  for (const u of expired) await logActivity({ email: u.email, action: "access expired" });

  return NextResponse.json({
    ok: true,
    reminded,
    sessionsEnded: ended.length,
    accessExpired: expired.length,
  });
}
