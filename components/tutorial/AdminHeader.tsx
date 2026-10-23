import Link from "next/link";

export const adminBtn =
  "rounded-full border border-white/25 px-3 py-1 text-xs hover:border-white/60 whitespace-nowrap";
export const adminInput =
  "rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none";

export default function AdminHeader({ email }: { email: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <nav className="flex items-center gap-5 text-sm">
        <span className="font-medium">Tutorial admin</span>
        <Link href="/admin" className="text-white/70 hover:text-white">
          Users
        </Link>
        <Link href="/admin/log" className="text-white/70 hover:text-white">
          Activity log
        </Link>
      </nav>
      <form action="/api/tutorial/logout?scope=admin" method="post" className="flex items-center gap-3">
        <span className="text-xs text-white/50">{email}</span>
        <button type="submit" className={adminBtn}>
          Sign out
        </button>
      </form>
    </header>
  );
}
