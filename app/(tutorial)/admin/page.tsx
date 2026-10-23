import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader, { adminBtn, adminInput } from "@/components/tutorial/AdminHeader";
import ConfirmButton from "@/components/tutorial/ConfirmButton";
import { requireAdmin } from "@/lib/tutorial/admin";
import { sql } from "@/lib/tutorial/db";
import { LIMITS, accessStatus, formatGulf } from "@/lib/tutorial/rules";
import { addUser, deleteUser, extendAccess, renewAccess, setActive } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

const EXPIRING_MS = 3 * 86_400_000;

const statusLabel = {
  disabled: "Disabled",
  not_started: "Not started",
  active: "Active",
  expired: "Expired",
} as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  const { filter, error } = await searchParams;
  const now = new Date();

  const rows = await sql<
    {
      email: string;
      name: string | null;
      active: boolean;
      access_days: number;
      access_started_at: Date | null;
      access_expires_at: Date | null;
      notes: string | null;
      devices: number;
      sessions: number;
    }[]
  >`
    select u.email, u.name, u.active, u.access_days, u.access_started_at, u.access_expires_at, u.notes,
      (select count(*)::int from devices d where d.email = u.email and not d.removed) as devices,
      (select count(*)::int from sessions s
        where s.email = u.email and not s.ended and s.expires_at > now()) as sessions
    from allowed_users u
    order by u.created_at desc
  `;
  const users = rows
    .map((u) => {
      const s = accessStatus(
        { active: u.active, accessStartedAt: u.access_started_at, accessExpiresAt: u.access_expires_at },
        now
      );
      return { ...u, ...s, daysLeft: s.status === "not_started" ? u.access_days : s.daysLeft };
    })
    .filter((u) => {
      if (filter === "expired") return u.status === "expired";
      if (filter === "expiring") {
        return (
          u.status === "active" &&
          u.access_expires_at !== null &&
          u.access_expires_at.getTime() - now.getTime() <= EXPIRING_MS
        );
      }
      return true;
    });

  const filters = [
    ["All", "/admin"],
    ["Expiring in 3 days", "/admin?filter=expiring"],
    ["Expired", "/admin?filter=expired"],
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8">
      <AdminHeader email={admin.email} />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Add client</h2>
        <form action={addUser} className="flex flex-wrap gap-2">
          <input name="email" type="email" required placeholder="client@company.com" className={adminInput} />
          <input name="name" placeholder="Name" className={adminInput} />
          <input name="notes" placeholder="Notes" className={adminInput} />
          <button type="submit" className="rounded-full bg-white px-5 py-2 text-sm text-navy">
            Add
          </button>
        </form>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-3 text-lg font-medium">Clients</h2>
          {filters.map(([label, href]) => (
            <Link key={href} href={href} className={adminBtn}>
              {label}
            </Link>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-xs text-white/50">
              <tr>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Ends (Gulf)</th>
                <th className="py-2 pr-4">Devices</th>
                <th className="py-2 pr-4">Sessions</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-t border-white/10 align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${encodeURIComponent(u.email)}`} className="underline-offset-4 hover:underline">
                      {u.email}
                    </Link>
                    {u.name && <div className="text-xs text-white/50">{u.name}</div>}
                    {u.notes && <div className="text-xs text-white/40">{u.notes}</div>}
                  </td>
                  <td className="py-3 pr-4">
                    {statusLabel[u.status]}
                    {(u.status === "active" || u.status === "not_started") && (
                      <span className="text-white/50"> · {u.daysLeft} days</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">{u.access_expires_at ? formatGulf(u.access_expires_at) : "-"}</td>
                  <td className="py-3 pr-4">
                    {u.devices}/{LIMITS.maxDevices}
                  </td>
                  <td className="py-3 pr-4">{u.sessions}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={setActive.bind(null, u.email, !u.active)}>
                        <button type="submit" className={adminBtn}>
                          {u.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={extendAccess.bind(null, u.email)} className="flex items-center gap-1">
                        <input
                          name="days"
                          type="number"
                          min={1}
                          max={365}
                          defaultValue={7}
                          aria-label={`Days to extend ${u.email}`}
                          className={`${adminInput} w-16 py-1 text-xs`}
                        />
                        <button type="submit" className={adminBtn}>
                          Extend
                        </button>
                      </form>
                      <form action={renewAccess.bind(null, u.email)}>
                        <ConfirmButton
                          className={adminBtn}
                          message={`Renew ${u.email}? This gives 14 fresh days from their next login, clears their devices and signs them out.`}
                        >
                          Renew
                        </ConfirmButton>
                      </form>
                      <form action={deleteUser.bind(null, u.email)}>
                        <ConfirmButton
                          className={`${adminBtn} border-red-300/40 text-red-200`}
                          message={`Delete ${u.email}? Their devices and sessions are removed. The activity log is kept.`}
                        >
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/50">
                    No clients here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
