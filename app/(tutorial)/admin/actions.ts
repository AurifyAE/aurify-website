"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/tutorial/admin";
import { sql } from "@/lib/tutorial/db";
import { logActivity } from "@/lib/tutorial/log";
import {
  DEFAULT_ACCESS_DAYS,
  extendedEnd,
  isFreeMailDomain,
  normalizeEmail,
} from "@/lib/tutorial/rules";

/** Admin changes. Each one checks the admin session and lands in the activity log. */

async function audit(target: string, op: string, extra?: Record<string, unknown>) {
  const { email: by } = await requireAdmin();
  return () =>
    logActivity({ email: target, action: "admin change", details: { by, op, target, ...extra } });
}

function done() {
  revalidatePath("/admin", "layout");
}

export async function addUser(form: FormData) {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const name = String(form.get("name") ?? "").trim() || null;
  const notes = String(form.get("notes") ?? "").trim() || null;
  const log = await audit(email, "add user");

  let error = "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = "Enter a valid email.";
  else if (isFreeMailDomain(email)) error = "Free email domains are not allowed. Use the client's company email.";
  if (!error) {
    const added = await sql`
      insert into allowed_users (email, name, notes) values (${email}, ${name}, ${notes})
      on conflict (email) do nothing
      returning email
    `;
    if (!added.length) error = `${email} is already on the list.`;
  }
  if (error) redirect(`/admin?error=${encodeURIComponent(error)}`);

  await log();
  done();
}

export async function setActive(email: string, active: boolean) {
  const log = await audit(email, active ? "enable" : "disable");
  await sql`update allowed_users set active = ${active} where email = ${email}`;
  await log();
  done();
}

export async function deleteUser(email: string) {
  const log = await audit(email, "delete user");
  await sql`delete from allowed_users where email = ${email}`;
  await log();
  done();
}

export async function extendAccess(email: string, form: FormData) {
  const days = Math.trunc(Number(form.get("days")));
  if (!Number.isFinite(days) || days < 1 || days > 365) return;
  const log = await audit(email, "extend", { days });
  const [user] = await sql`select access_expires_at from allowed_users where email = ${email}`;
  if (!user) return;
  const end = extendedEnd(user.access_expires_at, new Date(), days);
  // Not started yet: lengthen the period the first login will grant instead.
  await sql`
    update allowed_users
    set access_expires_at = ${end},
        access_days = case when access_started_at is null then access_days + ${days} else access_days end
    where email = ${email}
  `;
  await log();
  done();
}

export async function renewAccess(email: string) {
  const log = await audit(email, "renew");
  await sql.begin(async (tx) => {
    await tx`
      update allowed_users
      set access_started_at = null, access_expires_at = null, access_days = ${DEFAULT_ACCESS_DAYS}
      where email = ${email}
    `;
    await tx`update devices set removed = true where email = ${email}`;
    await tx`update sessions set ended = true where email = ${email}`;
  });
  await log();
  done();
}

export async function removeDevice(id: number) {
  const [device] = await sql`select email, label from devices where id = ${id}`;
  if (!device) return;
  const log = await audit(device.email, "remove device", { label: device.label });
  await sql.begin(async (tx) => {
    await tx`update devices set removed = true where id = ${id}`;
    await tx`update sessions set ended = true where device_id = ${id}`;
  });
  await log();
  done();
}

export async function endSessionById(id: number) {
  const [session] = await sql`select email from sessions where id = ${id}`;
  if (!session) return;
  const log = await audit(session.email, "end session", { sessionId: id });
  await sql`update sessions set ended = true where id = ${id}`;
  await log();
  done();
}
