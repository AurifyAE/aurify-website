import { formatGulf } from "./rules";

/** Tutorial emails, sent through the same Resend account as the contact form. */
export async function sendMail(to: string[], subject: string, text: string): Promise<void> {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    // Local development without Resend: print instead of sending.
    console.info(`[tutorial mail] to=${to.join(",")} subject=${subject}\n${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL, to, subject, text }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const gulf = (d: Date) => `${formatGulf(d)} (Gulf time)`;

export const codeEmail = (code: string) => ({
  subject: `Your Aurify login code: ${code}`,
  text: `Your login code is ${code}.\n\nIt works for 10 minutes, only in the browser where you requested it. Do not share it.`,
});

export const newDeviceEmail = (label: string) => ({
  subject: "New device added to your Aurify tutorial access",
  text: `A new device (${label}) was just added to your access. You can use up to 3 devices.\n\nIf this wasn't you, contact us right away.`,
});

export const signedOutEmail = () => ({
  subject: "Signed out on another device",
  text: "You signed in on a new device, so your oldest session was signed out. Up to 3 sessions can be active at a time.",
});

export const accessGrantedEmail = (end: Date) => ({
  subject: "Your Aurify tutorial access has started",
  text: `You have access until ${gulf(end)}.\n\nYour access is personal. Sharing the video, page or login code is not permitted. Viewing is watermarked and logged.`,
});

export const reminderEmail = (end: Date) => ({
  subject: "Your Aurify tutorial access ends soon",
  text: `Your access ends on ${gulf(end)}. Contact us if you need more time.`,
});

export const deviceLimitAdminEmail = (email: string, label: string) => ({
  subject: `Device limit reached: ${email}`,
  text: `${email} tried to sign in on a 4th device (${label}) and was blocked. Remove a device in the admin page to free a slot.`,
});
