"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";

const inputCls =
  "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none";

async function post(path: string, body: Record<string, string>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
}

/** Two-step email + one-time code form, shared by client and admin login. */
export default function LoginForm({ scope }: { scope: "viewer" | "admin" }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const data = await post("/api/tutorial/request-code", { email, scope });
    setBusy(false);
    setMessage(data.message ?? data.error);
    if (data.ok) setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const data = await post("/api/tutorial/verify-code", { email, code, scope });
    if (data.ok) {
      // Full load: the tutorial pages use a different root layout.
      window.location.href = data.redirect;
      return;
    }
    setBusy(false);
    setMessage(data.error);
  }

  return (
    <div className="w-full max-w-sm">
      {step === "email" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <label className="block text-sm text-white/70" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@company.com"
          />
          <Button type="submit" variant="light" disabled={busy} className="w-full">
            {busy ? "Sending..." : "Send login code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <label className="block text-sm text-white/70" htmlFor="login-code">
            6-digit code sent to {email}
          </label>
          <input
            id="login-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputCls} tracking-[0.5em]`}
          />
          <Button type="submit" variant="light" disabled={busy} className="w-full">
            {busy ? "Checking..." : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setMessage("");
            }}
            className="w-full text-sm text-white/60 underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
      <p aria-live="polite" className="mt-4 min-h-[1.5rem] text-sm text-white/80">
        {message}
      </p>
    </div>
  );
}
