import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminHeader, { adminBtn } from "@/components/tutorial/AdminHeader";
import { requireAdmin } from "@/lib/tutorial/admin";
import { sql } from "@/lib/tutorial/db";
import { formatGulf } from "@/lib/tutorial/rules";
import { endSessionById, removeDevice } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client" };

export default async function AdminUserPage({ params }: { params: Promise<{ email: string }> }) {
  const admin = await requireAdmin();
  const email = decodeURIComponent((await params).email);

  const [user] = await sql`select email, name from allowed_users where email = ${email}`;
  if (!user) notFound();

  const [devices, sessions, log] = await Promise.all([
    sql`select id, label, first_seen, last_seen from devices
        where email = ${email} and not removed order by first_seen`,
    sql`select s.id, s.created_at, s.last_active, d.label from sessions s
        join devices d on d.id = s.device_id
        where s.email = ${email} and not s.ended and s.expires_at > now()
        order by s.created_at`,
    sql`select at, action, ip, user_agent, details from activity_log
        where email = ${email} order by at desc limit 50`,
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8">
      <AdminHeader email={admin.email} />
      <div>
        <h1 className="text-xl font-medium">{user.email}</h1>
        {user.name && <p className="text-sm text-white/60">{user.name}</p>}
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Devices</h2>
        {devices.length === 0 && <p className="text-sm text-white/50">No devices.</p>}
        <ul className="divide-y divide-white/10 text-sm">
          {devices.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                {d.label} <span className="text-white/50">· first {formatGulf(d.first_seen)} · last {formatGulf(d.last_seen)}</span>
              </span>
              <form action={removeDevice.bind(null, d.id)}>
                <button type="submit" className={adminBtn}>
                  Remove device
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Active sessions</h2>
        {sessions.length === 0 && <p className="text-sm text-white/50">No active sessions.</p>}
        <ul className="divide-y divide-white/10 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                {s.label} <span className="text-white/50">· signed in {formatGulf(s.created_at)} · active {formatGulf(s.last_active)}</span>
              </span>
              <form action={endSessionById.bind(null, s.id)}>
                <button type="submit" className={adminBtn}>
                  End session
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Recent activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <tbody>
              {log.map((l, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="py-2 pr-4 text-white/60">{formatGulf(l.at)}</td>
                  <td className="py-2 pr-4">{l.action}</td>
                  <td className="py-2 pr-4 text-white/60">{l.ip}</td>
                  <td className="py-2 text-xs text-white/40">{l.details ? JSON.stringify(l.details) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
