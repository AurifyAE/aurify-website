import type { Metadata } from "next";
import AdminHeader, { adminBtn, adminInput } from "@/components/tutorial/AdminHeader";
import { requireAdmin } from "@/lib/tutorial/admin";
import { sql } from "@/lib/tutorial/db";
import { deviceLabel, formatGulf, normalizeEmail } from "@/lib/tutorial/rules";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Activity log" };

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; action?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const email = params.email ? normalizeEmail(params.email) : "";
  const action = params.action ?? "";

  const rows = await sql`
    select at, email, action, ip, user_agent, details from activity_log
    where (${email} = '' or email = ${email})
      and (${action} = '' or action = ${action})
    order by at desc
    limit 200
  `;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <AdminHeader email={admin.email} />
      <form className="flex flex-wrap gap-2">
        <input name="email" defaultValue={email} placeholder="Filter by email" className={adminInput} />
        <select name="action" defaultValue={action} className={adminInput}>
          <option value="">All actions</option>
          {[
            "code requested",
            "code refused",
            "login success",
            "login failed",
            "new device",
            "device limit blocked",
            "session replaced",
            "video opened",
            "link refreshed",
            "access expired",
            "reminder sent",
            "admin change",
          ].map((a) => (
            <option key={a} value={a} className="text-navy">
              {a}
            </option>
          ))}
        </select>
        <button type="submit" className={adminBtn}>
          Filter
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="text-xs text-white/50">
            <tr>
              <th className="py-2 pr-4">Time (Gulf)</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">IP</th>
              <th className="py-2 pr-4">Browser</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10 align-top">
                <td className="py-2 pr-4 text-white/60">{formatGulf(r.at)}</td>
                <td className="py-2 pr-4">{r.email}</td>
                <td className="py-2 pr-4">{r.action}</td>
                <td className="py-2 pr-4 text-white/60">{r.ip}</td>
                <td className="py-2 pr-4 text-white/60">{r.user_agent ? deviceLabel(r.user_agent) : ""}</td>
                <td className="py-2 text-xs text-white/40">{r.details ? JSON.stringify(r.details) : ""}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-white/50">
                  No activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
