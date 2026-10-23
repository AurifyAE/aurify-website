import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { hmac } from "./crypto";
import { COOKIE } from "./cookies";
import { adminEmails } from "./mail";

/** Guard for every admin page and action; anyone else goes to the admin login. */
export async function requireAdmin(): Promise<{ email: string }> {
  const token = (await cookies()).get(COOKIE.admin)?.value;
  if (token) {
    const [row] = await sql`
      select email from admin_sessions
      where token_hash = ${hmac(token)} and not ended and expires_at > now()
    `;
    // Re-checked against ADMIN_EMAILS so removing someone there locks them out at once.
    if (row && adminEmails().includes(row.email)) return { email: row.email };
  }
  redirect("/admin/login");
}
