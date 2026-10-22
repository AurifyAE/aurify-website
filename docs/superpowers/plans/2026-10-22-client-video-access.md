# Client Video Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A private `/tutorial` page on aurify.global where only approved client emails can watch a confidential video. Access is by one-time code, for 14 days, on up to 3 devices and 3 sessions per person. An admin page manages users, devices, sessions and the activity log.

**Architecture:** The Next.js app router is split into two root layouts. `app/(site)` holds the marketing site with its analytics. `app/(tutorial)` holds login, tutorial and admin pages, and loads no analytics. Neon Postgres stores the data through the `postgres` client. Every protected request goes through one server-side guard. The MP4 sits in a private Cloudflare R2 bucket. The browser only gets short-lived presigned URLs from `@aws-sdk/s3-request-presigner`. Email reuses the existing Resend account.

**Tech Stack:** Next 15.5 (app router, route handlers, server actions), React 19, Tailwind 3, `postgres` (porsager), `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, Resend REST API (same `fetch` pattern as `app/api/contact/route.ts`), Vercel Cron, `node --test` with Node 24 native type stripping.

**Spec:** `docs/superpowers/specs/2026-10-21-client-video-access.md`

## Global Constraints

- Allowlist login only, with exact email match after trim and lowercase. Free-mail domains can never be added.
- Login code: 6 digits, valid 10 min, single use, cancelled after 5 wrong tries, valid only in the browser (device cookie) that requested it.
- Code requests: at most 1 per 60 s and 5 per hour per email, and 20 per hour per IP.
- Access period: `access_days` (default 14), starting at the first successful login.
- Devices: 3 per email. A 4th device is blocked with `Device limit reached. Contact support.`, and the admins get an email.
- Sessions: 3 active per email. A 4th login ends the oldest one and emails "Signed out on another device".
- Session length: `min(now + 12 h, access_expires_at)`.
- Signed video URL TTL: `min(VIDEO_SECONDS + 1800, seconds until access end)`.
- Watermark: the viewer's email, moving to a new position every 30–60 s, visible in fullscreen. The player fullscreens the container, not the `<video>`.
- Times are stored in UTC (`timestamptz`) and shown to clients in `Asia/Dubai`.
- Fixed copy: `If this email has access, a code has been sent.` / `Device limit reached. Contact support.` / `Your access has ended. Contact us to renew.`
- Tokens, codes and device IDs are stored only as `HMAC-SHA256(AUTH_SECRET, value)`.
- Cookies: `aurify_dev` (1 year), `aurify_sess`, `aurify_admin`. All are `HttpOnly; Secure; SameSite=Lax; Path=/`.
- Tutorial, login and admin pages: no GTM, GA or Meta Pixel, plus `Referrer-Policy: no-referrer`, `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
- Activity actions, exact strings: `code requested`, `code refused`, `login success`, `login failed`, `new device`, `device limit blocked`, `session replaced`, `video opened`, `link refreshed`, `access expired`, `reminder sent`, `admin change`.
- Nothing is ever deleted by jobs. Only the admin can delete a user.
- Free-tier budget: Resend 100 emails/day and 3,000/month, shared with the contact form. Neon 0.5 GB and 100 CU-hours/month. R2 10 GB, 10M reads/month, free egress. Vercel cron runs once per day.

## Review Focus

1. **Two new devices log in at the same moment when the user already has 2.** Only one may take slot 3. `verifyCode` locks the `allowed_users` row with `select … for update` (Task 5). Manual test in Task 11.
2. **An email added with capitals or spaces in admin, then typed differently at login.** Both paths use `normalizeEmail`. Test in Task 2.
3. **Access ends during playback or before the session's 12 h.** Session expiry and URL TTL are both capped at the access end, and a TTL is never negative. Tests in Task 2.
4. **A second code is requested before the first is used.** Only the newest code works, because requesting a code marks older unused codes `used`. Manual test in Task 11.
5. **A renewed user logs in again.** `access_started_at` is reset to null, so the next login starts a fresh window and `accessStatus` reports `not_started`. Test in Task 2.

---

### Task 1: Cloud accounts and env (manual, the person does this)

**Files:**
- Modify: `.env` (local) and the Vercel project env

- [ ] **Step 1: Prepare the video:** run `ffmpeg -i original.mp4 -c copy -movflags +faststart tutorial.mp4` and note its length in seconds.
- [ ] **Step 2: R2:** create bucket `aurify-tutorial`, then confirm that public access, the `r2.dev` URL and custom domains are all off.
- [ ] **Step 3: Upload:** run `npx wrangler r2 object put aurify-tutorial/tutorial.mp4 --file tutorial.mp4 --content-type video/mp4 --remote`.
- [ ] **Step 4: R2 token:** create an API token with "Object Read only", scoped to `aurify-tutorial`.
- [ ] **Step 5: CORS:** allow origin `https://aurify.global`, methods `GET` and `HEAD`, header `Range`.
- [ ] **Step 6: Neon:** create a free project in region `aws-ap-southeast-1` or the nearest one to `bom1`. Copy the **pooled** connection string.
- [ ] **Step 7: Resend:** confirm the domain in `CONTACT_FROM_EMAIL` shows Verified (SPF + DKIM).
- [ ] **Step 8: Add env vars** locally and in Vercel (Production + Preview):

```
DATABASE_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=aurify-tutorial
R2_OBJECT_KEY=tutorial.mp4
VIDEO_SECONDS=
AUTH_SECRET=        # node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
ADMIN_EMAILS=       # comma-separated
CRON_SECRET=        # same generator as AUTH_SECRET
```

`RESEND_API_KEY` and `CONTACT_FROM_EMAIL` already exist, so reuse them.

---

### Task 2: Test runner and pure access rules

**Files:**
- Modify: `package.json` (scripts), `tsconfig.json` (compilerOptions)
- Create: `lib/tutorial/rules.ts`, `lib/tutorial/rules.test.ts`

**Interfaces:**
- Produces, all in `lib/tutorial/rules.ts`. No imports are allowed, so `node --test` can load the file. Only erasable TS syntax (no enums).
  - `LIMITS = { codeTtlMs: 600_000, maxWrongTries: 5, emailGapMs: 60_000, emailPerHour: 5, ipPerHour: 20, maxDevices: 3, maxSessions: 3, sessionMs: 43_200_000, linkGraceSeconds: 1800, reminderLeadHours: [36, 60] }`
  - `normalizeEmail(raw: string): string`
  - `isFreeMailDomain(email: string): boolean`: gmail.com, googlemail.com, outlook.com, hotmail.com, live.com, yahoo.com, icloud.com, me.com, aol.com, proton.me, protonmail.com, gmx.com, yandex.com, mail.com, zoho.com
  - `accessWindow(now: Date, days: number): { start: Date; end: Date }`
  - `sessionExpiry(now: Date, accessEnd: Date): Date`
  - `signedUrlTtl(now: Date, accessEnd: Date, videoSeconds: number): number` (whole seconds, never below 0)
  - `canRequestCode(r: { emailLastAt: Date | null; emailLastHour: number; ipLastHour: number }, now: Date): boolean`
  - `deviceDecision(known: boolean, activeDevices: number): "ok" | "add" | "blocked"`
  - `sessionsToEnd(activeSessions: number): number` (how many of the oldest to end before creating one)
  - `deviceLabel(userAgent: string): string`, for example `"Chrome · Windows"`, `"Safari · iPhone"`, falling back to `"Unknown browser"`
  - `formatGulf(date: Date): string`, using `Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" })`
  - `accessStatus(u: { active: boolean; accessStartedAt: Date | null; accessExpiresAt: Date | null }, now: Date): { status: "disabled" | "not_started" | "active" | "expired"; daysLeft: number }`

- [ ] **Step 1: Wire up the runner.** Add `"test": "node --test \"lib/**/*.test.ts\""` to `package.json` scripts, and `"allowImportingTsExtensions": true` to `tsconfig.json` compilerOptions. Node needs the explicit `.ts` import, and `noEmit` is already on.

- [ ] **Step 2: Write the failing tests** in `lib/tutorial/rules.test.ts`, using `import { test } from "node:test"`, `import assert from "node:assert/strict"` and `import { … } from "./rules.ts"`:

```ts
const now = new Date("2026-10-22T08:00:00Z");
const h = (n: number) => new Date(now.getTime() + n * 3_600_000);

test("normalizeEmail", () => assert.equal(normalizeEmail("  Ali@Client.AE "), "ali@client.ae"));
test("free mail", () => { assert.equal(isFreeMailDomain("x@Gmail.com"), true); assert.equal(isFreeMailDomain("x@client.ae"), false); });
test("accessWindow 14 days", () => assert.deepEqual(accessWindow(now, 14), { start: now, end: new Date("2026-11-05T08:00:00Z") }));
test("sessionExpiry 12h", () => assert.deepEqual(sessionExpiry(now, h(100)), h(12)));
test("sessionExpiry capped at access end", () => assert.deepEqual(sessionExpiry(now, h(2)), h(2)));
test("ttl = video + 30 min", () => assert.equal(signedUrlTtl(now, h(100), 1200), 3000));
test("ttl capped at access end", () => assert.equal(signedUrlTtl(now, h(0.5), 7200), 1800));
test("ttl never negative", () => assert.equal(signedUrlTtl(now, h(-1), 1200), 0));
test("code gap 60s", () => assert.equal(canRequestCode({ emailLastAt: new Date(now.getTime() - 59_000), emailLastHour: 1, ipLastHour: 1 }, now), false));
test("code 5/hour", () => assert.equal(canRequestCode({ emailLastAt: h(-0.5), emailLastHour: 5, ipLastHour: 5 }, now), false));
test("code ip 20/hour", () => assert.equal(canRequestCode({ emailLastAt: null, emailLastHour: 0, ipLastHour: 20 }, now), false));
test("code allowed", () => assert.equal(canRequestCode({ emailLastAt: h(-0.5), emailLastHour: 4, ipLastHour: 19 }, now), true));
test("devices", () => { assert.equal(deviceDecision(true, 3), "ok"); assert.equal(deviceDecision(false, 2), "add"); assert.equal(deviceDecision(false, 3), "blocked"); });
test("sessions", () => { assert.equal(sessionsToEnd(2), 0); assert.equal(sessionsToEnd(3), 1); assert.equal(sessionsToEnd(4), 2); });
test("label", () => assert.equal(deviceLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"), "Chrome · Windows"));
test("label iPhone", () => assert.equal(deviceLabel("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"), "Safari · iPhone"));
test("gulf time", () => assert.equal(formatGulf(now), "22 Oct 2026, 12:00"));
test("status not started", () => assert.deepEqual(accessStatus({ active: true, accessStartedAt: null, accessExpiresAt: null }, now), { status: "not_started", daysLeft: 14 }));
test("status active", () => assert.deepEqual(accessStatus({ active: true, accessStartedAt: h(-24), accessExpiresAt: h(36) }, now), { status: "active", daysLeft: 2 }));
test("status expired", () => assert.equal(accessStatus({ active: true, accessStartedAt: h(-400), accessExpiresAt: h(-1) }, now).status, "expired"));
test("status disabled wins", () => assert.equal(accessStatus({ active: false, accessStartedAt: null, accessExpiresAt: null }, now).status, "disabled"));
```

`daysLeft` is `Math.ceil` of the remaining days. For `not_started` it is the default 14, which the caller overrides with `access_days`.

- [ ] **Step 3: Run `npm test`.** Expected: FAIL, because `./rules.ts` cannot be found.
- [ ] **Step 4: Implement `lib/tutorial/rules.ts`** with the signatures above. `deviceLabel` checks Edge before Chrome and Chrome before Safari, and iPhone/iPad/Android before Mac/Windows.
- [ ] **Step 5: Run `npm test`.** Expected: all pass. Then run `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 6: Commit:** `git add package.json tsconfig.json lib/tutorial/rules.ts lib/tutorial/rules.test.ts && git commit -m "feat(tutorial): access rules with node test runner"`

---

### Task 3: Split root layouts so tutorial pages load no analytics

The root `app/layout.tsx` injects GTM, GA4 and Meta Pixel into every page. The spec forbids analytics on the video page. Two root layouts fix this, and navigating between them forces a full page load, so the scripts never carry over.

**Files:**
- Move with `git mv` into `app/(site)/`: `layout.tsx`, `page.tsx`, `opengraph-image.tsx`, `about/`, `blogs/`, `connect/`, `contact/`, `e-invoicing/`, `events/`, `privacy-policy/`, `products/`, `services/`
- Keep at `app/`: `api/`, `globals.css`, `icon.svg`, `robots.ts`, `sitemap.ts`
- Modify: `app/(site)/layout.tsx` (change `import "./globals.css"` to `"../globals.css"`), `app/robots.ts`, `next.config.ts`
- Create: `app/(tutorial)/layout.tsx`

**Interfaces:**
- Produces: `app/(tutorial)/layout.tsx`, a root layout with `<html lang="en">`, the same Poppins `--font-sans` setup and `globals.css`, and no `Script`, `SiteShell` or `AppProviders`. It exports `metadata = { title: { default: "Client Tutorial", template: "%s - Aurify" }, robots: { index: false, follow: false }, referrer: "no-referrer" }`.

- [ ] **Step 1: Run the `git mv` commands** listed above. Then confirm that `app/layout.tsx` no longer exists.
- [ ] **Step 2: Create `app/(tutorial)/layout.tsx`** as described in Interfaces. Use `<body className="min-h-screen bg-navy text-white antialiased">`.
- [ ] **Step 3: In `app/robots.ts`,** change `rules` to `{ userAgent: "*", allow: "/", disallow: ["/tutorial", "/login", "/admin", "/api/"] }`.
- [ ] **Step 4: In `next.config.ts`,** add `async headers()` returning one entry per source `"/tutorial"`, `"/login"`, `"/admin/:path*"` and `"/api/tutorial/:path*"`. Each sets `Cache-Control: no-store`, `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`.
- [ ] **Step 5: Run `npm run build`.** Expected: success, with every existing route still listed. A temporary `app/(tutorial)/login/page.tsx` that returns `<p>login</p>` is enough to prove the second root works.
- [ ] **Step 6: Check in the preview.** `/` and `/contact` render as before, and their HTML contains `googletagmanager`. `/login` HTML contains none of `googletagmanager`, `fbevents` or `gtag`, and its response headers include `x-robots-tag: noindex, nofollow`.
- [ ] **Step 7: Commit:** `git commit -am "refactor: split site and tutorial root layouts"`. Include the new files with `git add app`.

---

### Task 4: Database, crypto, activity log and mail

**Files:**
- Modify: `package.json` (deps)
- Create: `lib/tutorial/schema.sql`, `lib/tutorial/db.ts`, `lib/tutorial/crypto.ts`, `lib/tutorial/crypto.test.ts`, `lib/tutorial/log.ts`, `lib/tutorial/mail.ts`

**Interfaces:**
- Produces:
  - `sql` from `lib/tutorial/db.ts`: `postgres(process.env.DATABASE_URL!, { ssl: "require", prepare: false })`. `prepare: false` is needed because the Neon pooler runs in transaction mode.
  - `lib/tutorial/crypto.ts` uses only `node:crypto`, so its test runs under `node --test`. It exports `hmac(value: string): string` (hex, keyed by `AUTH_SECRET`; throws if it is unset), `randomToken(): string` (32 bytes base64url) and `randomCode(): string` (`crypto.randomInt(0, 1e6)` padded to 6 digits).
  - `lib/tutorial/log.ts` exports `type ActivityAction`, a union of the Global Constraints action strings, and `logActivity(a: { email?: string; action: ActivityAction; ip?: string; userAgent?: string; details?: Record<string, unknown> }): Promise<void>`.
  - `lib/tutorial/mail.ts` exports `sendMail(to: string[], subject: string, text: string): Promise<void>`, which copies the `fetch` call in `app/api/contact/route.ts:39-58` with `from: process.env.CONTACT_FROM_EMAIL`. It also exports `adminEmails(): string[]`, which parses `ADMIN_EMAILS`, and the templates, each returning `{ subject: string; text: string }`: `codeEmail(code)`, `newDeviceEmail(label)`, `signedOutEmail()`, `accessGrantedEmail(end: Date)`, `reminderEmail(end: Date)` and `deviceLimitAdminEmail(email, label)`. Dates use `formatGulf` followed by ` (Gulf time)`.
  - `lib/tutorial/schema.sql` contains the spec's 5 tables, with these exact column names: `allowed_users(email pk, name, active, access_days default 14, access_started_at, access_expires_at, notes, created_at)`, `devices(id, email fk cascade, device_hash, label, first_seen, last_seen, removed)` with a unique index `(email, device_hash) where not removed`, `sessions(id, token_hash unique, email fk cascade, device_id fk, created_at, last_active, expires_at, ended)`, `login_codes(id, email, code_hash, device_hash, expires_at, wrong_attempts, used, created_at)` and `activity_log(id, at, email, action, ip, user_agent, details jsonb)` with indexes `(email, at)` and `(ip, action, at)`. It adds one more table, `admin_sessions(id, token_hash unique, email, created_at, expires_at, ended)`, because admins are not in `allowed_users`.

- [ ] **Step 1: Install dependencies:** `npm i postgres @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
- [ ] **Step 2: Write `lib/tutorial/crypto.test.ts`.** Set `process.env.AUTH_SECRET = "test"` first. Assert: `randomCode()` matches `/^\d{6}$/` over 1000 runs; `hmac("a") === hmac("a")`; `hmac("a") !== hmac("b")`; `randomToken().length >= 43`.
- [ ] **Step 3: Run `npm test`.** Expected: FAIL, because the module is missing.
- [ ] **Step 4: Implement `crypto.ts`, `db.ts`, `log.ts`, `mail.ts` and `schema.sql`** as described in Interfaces.
- [ ] **Step 5: Run `npm test`** (expected: pass) and `npx tsc --noEmit` (expected: no errors).
- [ ] **Step 6: Run `schema.sql`** in the Neon SQL editor. Expected: 6 tables listed.
- [ ] **Step 7: Commit:** `git add package.json package-lock.json lib/tutorial && git commit -m "feat(tutorial): db, crypto, activity log, mail"`

---

### Task 5: Login service and API routes

**Files:**
- Create: `lib/tutorial/login.ts`, `lib/tutorial/cookies.ts`, `app/api/tutorial/request-code/route.ts`, `app/api/tutorial/verify-code/route.ts`, `app/api/tutorial/logout/route.ts`

**Interfaces:**
- Consumes: Task 2 `rules`, Task 4 `sql`, `hmac`, `randomToken`, `randomCode`, `logActivity`, `sendMail`, the templates and `adminEmails`.
- Produces:
  - `lib/tutorial/cookies.ts` exports `COOKIE = { device: "aurify_dev", session: "aurify_sess", admin: "aurify_admin" }`, `cookieOptions(maxAgeSeconds: number)` (returns `{ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge }`) and `clientInfo(req: Request): { ip: string; userAgent: string }`. The IP is the first value of `x-forwarded-for`.
  - `type Scope = "viewer" | "admin"`
  - `requestCode(scope: Scope, email: string, deviceId: string, info: { ip: string; userAgent: string }): Promise<void>`. It never reveals whether the email is allowed.
  - `verifyCode(scope: Scope, email: string, code: string, deviceId: string, info): Promise<{ ok: true; token: string; maxAgeSeconds: number } | { ok: false; reason: "invalid" | "device_limit" }>`
  - `endSession(scope: Scope, token: string): Promise<void>`
  - Each route takes `POST` JSON `{ scope?: Scope, email, code? }`. `scope` defaults to `"viewer"`.

- [ ] **Step 1: Implement `requestCode`.**
  1. Normalize the email.
  2. Read the rate-limit counts: the latest `login_codes.created_at` and the last-hour count for this email, plus the last-hour count of `code requested` rows in `activity_log` for this IP.
  3. If `canRequestCode` fails, return silently.
  4. Check eligibility. For `viewer`: an `allowed_users` row exists, `active`, and `access_expires_at` is null or later than now. For `admin`: the email is in `adminEmails()`.
  5. If eligible: mark older unused codes for this email `used`, insert `{ code_hash: hmac(code), device_hash: hmac(deviceId), expires_at: now + codeTtlMs }`, send `codeEmail`, and log `code requested` with the IP.
  6. If not eligible: log `code refused`.
- [ ] **Step 2: Implement `verifyCode`.** Run the whole thing in `sql.begin(async (tx) => …)`.
  1. Load the newest unused, unexpired code for the email.
  2. If the `code_hash` or `device_hash` does not match: increment `wrong_attempts`, set `used = true` when it reaches `maxWrongTries`, log `login failed`, and return `invalid`.
  3. For `admin`: mark the code used, insert `admin_sessions` with `expires_at = now + sessionMs`, and return.
  4. For `viewer`, first run `select … from allowed_users where email = $1 for update`. This lock serialises parallel logins.
  5. Device step: apply `deviceDecision`. On `add`: insert the device with `deviceLabel(userAgent)`, send `newDeviceEmail`, and log `new device`. On `blocked`: log `device limit blocked`, send `deviceLimitAdminEmail` to `adminEmails()`, and return `device_limit`.
  6. Session step: end the `sessionsToEnd(active)` oldest active sessions, and for each send `signedOutEmail` and log `session replaced`.
  7. If `access_started_at` is null: set it from `accessWindow(now, access_days)` and send `accessGrantedEmail`.
  8. Insert the session with `sessionExpiry`, mark the code used, log `login success`, and return the raw token.
- [ ] **Step 3: Write `request-code/route.ts`.** Read or create the `aurify_dev` cookie (`randomToken()`, 1-year max age) and call `requestCode`. Always return `{ ok: true, message: "If this email has access, a code has been sent." }`, unless the JSON is invalid, which returns 400.
- [ ] **Step 4: Write `verify-code/route.ts`.** If the device cookie is missing, treat the code as `invalid`. On `ok`, set `aurify_sess`, or `aurify_admin` for the admin scope. The response is `{ ok: true, redirect: "/tutorial" | "/admin" }`. For `device_limit` it is `{ ok: false, error: "Device limit reached. Contact support." }` with 403, and for `invalid` it is `{ ok: false, error: "Invalid or expired code." }` with 400.
- [ ] **Step 5: Write `logout/route.ts`.** Call `endSession` for the cookie that is present, delete it, and return `{ ok: true }`.
- [ ] **Step 6: Run `npx tsc --noEmit && npm run lint`.** Expected: clean.
- [ ] **Step 7: Run a manual smoke test** with `npm run dev`, after inserting your own email into `allowed_users`. A curl or REST client request to `/api/tutorial/request-code` must make a code email arrive and a `code requested` row appear. A request with an unknown email must return the same body and create a `code refused` row.
- [ ] **Step 8: Commit:** `git add lib/tutorial app/api/tutorial && git commit -m "feat(tutorial): one-time code login with device and session limits"`

---

### Task 6: Login page

**Files:**
- Create: `app/(tutorial)/login/page.tsx` (replaces the Task 3 placeholder), `components/tutorial/LoginForm.tsx`

**Interfaces:**
- Consumes: the Task 5 routes.
- Produces: `LoginForm({ scope }: { scope: "viewer" | "admin" })`, a client component. Step 1 asks for the email and posts to `request-code`, then shows the server message. Step 2 asks for a 6-digit code (`inputMode="numeric"`, `autoComplete="one-time-code"`) and posts to `verify-code`, then sends the browser to `window.location.href = redirect`, which forces a full load across root layouts. It has a "Use a different email" link back to step 1.

- [ ] **Step 1: Build `LoginForm`.** Use the existing `components/ui/Button.tsx` and the Tailwind `navy` tokens. Errors go in an `aria-live="polite"` region.
- [ ] **Step 2: Build `login/page.tsx`.** It renders `LoginForm scope="viewer"`. When `searchParams.expired === "1"`, it shows `Your access has ended. Contact us to renew.` above the form.
- [ ] **Step 3: Check in the preview.** The full flow works with your allowlisted email and lands on `/tutorial` (a 404 is fine until Task 7). Check at 375 px width.
- [ ] **Step 4: Commit:** `git add "app/(tutorial)/login" components/tutorial && git commit -m "feat(tutorial): login page"`

---

### Task 7: Viewer guard, signed video link and player

**Files:**
- Create: `lib/tutorial/viewer.ts`, `lib/tutorial/r2.ts`, `app/(tutorial)/tutorial/page.tsx`, `app/api/tutorial/video-link/route.ts`, `components/tutorial/TutorialPlayer.tsx`

**Interfaces:**
- Consumes: `sql`, `hmac`, `COOKIE`, `logActivity`, `signedUrlTtl`.
- Produces:
  - `type Viewer = { email: string; sessionId: number; deviceId: number; accessExpiresAt: Date }`
  - `getViewer(): Promise<{ ok: true; viewer: Viewer } | { ok: false; reason: "none" | "expired" | "invalid" }>` in `viewer.ts`. It reads cookies with `next/headers`. It joins `sessions`, `devices` and `allowed_users` by `token_hash = hmac(cookie)`, and checks: the session is not ended and `expires_at > now`; the device is not removed, its `device_hash = hmac(aurify_dev)` and its id equals `sessions.device_id`; the user is `active` and `access_expires_at > now`. On failure it sets the session `ended`, and returns `"expired"` when the only failed check is the access end. On success it updates `sessions.last_active` and `devices.last_seen`.
  - `signVideoUrl(ttlSeconds: number): Promise<string>` in `r2.ts`. It uses `S3Client({ region: "auto", endpoint: \`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com\` })` and `getSignedUrl(GetObjectCommand({ Bucket: R2_BUCKET, Key: R2_OBJECT_KEY }), { expiresIn })`.
  - `GET /api/tutorial/video-link` returns `{ url }`, or 401 `{ reason }`.
  - `TutorialPlayer({ src, email }: { src: string; email: string })`

- [ ] **Step 1: Implement `getViewer` and `signVideoUrl`.**
- [ ] **Step 2: Build `tutorial/page.tsx`** with `export const dynamic = "force-dynamic"`. Call `getViewer()`. For `expired`, redirect to `/login?expired=1`; for other failures, redirect to `/login`. Otherwise compute `signVideoUrl(signedUrlTtl(now, accessExpiresAt, Number(VIDEO_SECONDS)))`, log `video opened`, and render the heading, `<TutorialPlayer>`, a "Sign out" button that posts to `/api/tutorial/logout`, and "Access until {formatGulf(end)} (Gulf time)".
- [ ] **Step 3: Write `video-link/route.ts`.** Run the same guard, return a fresh URL, and log `link refreshed`.
- [ ] **Step 4: Build `TutorialPlayer`.**
  - The outer `div` is `relative`, wraps the `<video controls controlsList="nodownload noremoteplayback" disablePictureInPicture playsInline preload="metadata" onContextMenu={preventDefault}>`, and holds a custom fullscreen button that calls `div.requestFullscreen()`. On iOS Safari, which lacks it, the button is hidden.
  - Watermark: an absolute `<span>` with `pointer-events-none select-none text-white/35`. Its `top` and `left` are random values in 5–85%, changed by a `setTimeout` of `30_000 + Math.random() * 30_000` that reschedules itself.
  - On the video `error` event, run at most once per 10 s: save `currentTime` and the paused state, fetch `/api/tutorial/video-link`. On 401, go to `/login?expired=1`. Otherwise set `src`, and on `loadedmetadata` seek to the saved time and resume if it was playing.
- [ ] **Step 5: Check in the preview.** The page plays and seeks. No requests go to `googletagmanager` or `facebook` (`read_network_requests`). The watermark moves and stays visible in container fullscreen. To force a mid-play refresh, temporarily set `VIDEO_SECONDS=-1740` (TTL 60 s), play past 1 min, and seek. Playback must resume at the same position. Then restore the value.
- [ ] **Step 6: Commit:** `git add lib/tutorial "app/(tutorial)/tutorial" app/api/tutorial/video-link components/tutorial && git commit -m "feat(tutorial): protected player with signed R2 links and watermark"`

---

### Task 8: Daily reminder and expiry job

**Files:**
- Create: `app/api/cron/tutorial/route.ts`, `vercel.json`

**Interfaces:**
- Consumes: `sql`, `logActivity`, `sendMail`, `reminderEmail`, `LIMITS.reminderLeadHours`.

- [ ] **Step 1: Write the `GET` handler.** Return 401 unless the header equals `` `Bearer ${process.env.CRON_SECRET}` ``. Then:
  - Send `reminderEmail` to every active user whose `access_expires_at` is between now + 36 h and now + 60 h, and who has no `reminder sent` row since `access_started_at`. Log `reminder sent`.
  - Set `ended = true` on sessions where `expires_at < now`.
  - Log `access expired` once for each user whose end has passed and who has no such row since `access_started_at`.
  - Delete nothing.
  - Return the counts as JSON.
- [ ] **Step 2: Add `vercel.json`:** `{ "crons": [{ "path": "/api/cron/tutorial", "schedule": "0 5 * * *" }] }`. That is 09:00 Gulf time. Hobby fires within that hour.
- [ ] **Step 3: Check locally.** Set one user's `access_expires_at` to now + 2 days, then call the route with the bearer header. Expected: one reminder sent; a second call sends none.
- [ ] **Step 4: Commit:** `git add app/api/cron vercel.json && git commit -m "feat(tutorial): daily reminder and expiry job"`

---

### Task 9: Admin login and guard

**Files:**
- Create: `lib/tutorial/admin.ts`, `app/(tutorial)/admin/login/page.tsx`

**Interfaces:**
- Produces: `requireAdmin(): Promise<{ email: string }>`. It reads `aurify_admin`, checks `admin_sessions` (not ended, not expired) and that the email is still in `adminEmails()`, and otherwise calls `redirect("/admin/login")`.

- [ ] **Step 1: Implement `requireAdmin`.**
- [ ] **Step 2: Build `admin/login/page.tsx`,** which renders `LoginForm scope="admin"`.
- [ ] **Step 3: Check.** An email not in `ADMIN_EMAILS` gets no code and sees the same message. An admin email lands on `/admin`.
- [ ] **Step 4: Commit:** `git commit -m "feat(tutorial): admin login"` (stage the files explicitly).

---

### Task 10: Admin pages and actions

**Files:**
- Create: `app/(tutorial)/admin/page.tsx`, `app/(tutorial)/admin/users/[email]/page.tsx`, `app/(tutorial)/admin/log/page.tsx`, `app/(tutorial)/admin/actions.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `sql`, `logActivity`, `normalizeEmail`, `isFreeMailDomain`, `accessStatus`, `formatGulf`.
- Produces: server actions in `actions.ts`. Each one first calls `requireAdmin()`, logs `admin change` with `{ by, op, target }`, then calls `revalidatePath("/admin")`.
  - `addUser(form: FormData)`: takes name, email and notes, and rejects free-mail domains and duplicates with a message.
  - `setActive(email: string, active: boolean)`
  - `deleteUser(email: string)`: deletes the row, which cascades to devices and sessions. The UI asks for confirmation first.
  - `extendAccess(email: string, days: number)`: `access_expires_at += days`. If access has not started, it adds to `access_days` instead.
  - `renewAccess(email: string)`: sets `access_started_at` and `access_expires_at` to null and `access_days` to 14, sets `removed = true` on all devices, and ends all sessions.
  - `removeDevice(id: number)`: sets `removed = true` and ends that device's sessions.
  - `endSessionById(id: number)`

- [ ] **Step 1: Build `admin/page.tsx`,** the users table: email, name, status and days left from `accessStatus`, end date with `formatGulf`, devices `n/3`, active sessions. Filters come from `?filter=expiring|expired`, where `expiring` means ending within 3 days. There is an add-user form and per-row controls for disable/enable, extend (a days input), renew and delete.
- [ ] **Step 2: Build `users/[email]/page.tsx`,** showing devices (label, first and last seen, a remove button), active sessions (created, last active, an end button) and the latest 50 log rows for that email.
- [ ] **Step 3: Build `admin/log/page.tsx`,** with `?email=` and `?action=` filters, 200 rows newest first, and columns time (Gulf), email, action, IP, browser and details.
- [ ] **Step 4: Run `npx tsc --noEmit && npm run lint`.** Expected: clean.
- [ ] **Step 5: Check in the preview.** Add, extend, renew, remove a device and end a session, and confirm each shows in the log as `admin change`.
- [ ] **Step 6: Commit:** `git add "app/(tutorial)/admin" && git commit -m "feat(tutorial): admin users, devices, sessions, log"`

---

### Task 11: Acceptance testing (manual)

- [ ] **Step 1:** Run every item in the spec's "Testing checklist", on a Vercel preview deployment with the real env vars.
- [ ] **Step 2:** Test Review Focus 1. With 2 devices registered, submit valid codes from two new browsers at the same time (two terminals running curl with different `aurify_dev` cookies). Expected: one success and one `Device limit reached. Contact support.`
- [ ] **Step 3:** Test Review Focus 4. Request code A, wait 61 s, request code B, then submit A. Expected: `Invalid or expired code.` B works.
- [ ] **Step 4:** Open `https://<ACCOUNT_ID>.r2.cloudflarestorage.com/aurify-tutorial/tutorial.mp4` unsigned. Expected: 400 or 403.
- [ ] **Step 5:** Run `npm test && npm run build`. Expected: pass.

### Task 12: Launch (manual)

- [ ] **Step 1:** Merge to `main` and confirm the cron appears under Vercel → Settings → Cron Jobs.
- [ ] **Step 2:** Add the client emails in `/admin`.
- [ ] **Step 3:** Delete the YouTube video or set it to Private.
- [ ] **Step 4:** Send each client the `https://aurify.global/tutorial` link with the three instruction lines from the spec.
- [ ] **Step 5:** Add an "Emergency stop" note to `README.md`: roll the R2 token in Cloudflare, then update `R2_SECRET_ACCESS_KEY` in Vercel and redeploy. Every signed link dies.
