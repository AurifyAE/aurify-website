# Client Video Access Plan

Oct 21, 2026 · @Minhaj

## Overview

Only approved client emails can watch the confidential tutorial, for 14 days each, on up to 3 devices and 3 logins at a time. The page lives in our Next.js site; the video sits in a private Cloudflare R2 bucket and is only reachable through short-lived signed links. Login is by email one-time code, so there are no passwords to share. The whole setup runs on free tiers.

| Rule | Value |
| --- | --- |
| Who can log in | Exact emails on our approved list only |
| Login method | Email + 6-digit one-time code (no passwords) |
| Access period | 14 days from first successful login (changeable per person) |
| Device limit | 3 per email; a 4th is blocked until an admin removes one |
| Session limit | 3 active per email; a 4th login signs out the oldest |
| Session length | 12 h, or until access ends, whichever is sooner |
| Login code | Valid 10 min, single use, 5 wrong tries then cancelled, works only in the browser that requested it |
| Code request limit | 1 per 60 s, 5 per hour per email, plus a limit per network address |
| Signed video link | Video length + 30 min, never past the access end |
| Watermark | Viewer's email, moving position every 30–60 s |
| Time zone | Stored in UTC; shown to clients in Gulf time (UTC+4) |

## Architecture and data

The Next.js server is the only thing that talks to the database, the email sender and R2; the browser only ever receives a session cookie and a signed video link.

| Component | Role |
| --- | --- |
| Next.js site (VPS or Vercel) | Login pages, tutorial page, video-link route, admin page |
| Database (existing Postgres, or SQLite on a VPS) | Approved users, devices, sessions, login codes, activity log |
| Cloudflare R2 | Private bucket holding the MP4; read-only API token |
| Email sender (company SMTP or a free service such as Resend) | Login codes and alert emails; SPF/DKIM set on our domain |
| Daily scheduled job (server cron or Vercel Cron) | Reminder emails before access ends |

**Database tables**

| Table | Fields |
| --- | --- |
| allowed\_users | email, name, active on/off, access\_days (14), access\_started\_at, access\_expires\_at, notes, created\_at |
| devices | id, email, hashed device ID, label (e.g. "Chrome · Windows"), first\_seen, last\_seen, removed on/off |
| sessions | id, hashed token, email, device id, created\_at, last\_active, expires\_at, ended on/off |
| login\_codes | id, email, hashed code, device id, expires\_at, wrong attempts, used on/off |
| activity\_log | time, email, action, network address, browser, details |

Logged actions: code requested, code refused, login success, login failed, new device, device limit blocked, session replaced, video opened, link refreshed, access expired, admin changes. Tokens and codes are stored hashed, so a leaked database can't be used to log in.

## Flows

Every request runs the same server-side checks: approved email, valid session, registered device, access not expired.

&#91;embedded content: login flow · 3 checks before the video plays\]

A refused email gets no code, a 4th device is blocked, and a 4th login signs out the oldest session.

### A. Login

1. Visitor opens `/tutorial` without a valid session and is sent to `/login`. If the browser has no device ID, it gets one (random value, 1-year HttpOnly cookie).
2. They enter their email; the server trims and lowercases it.
3. The server checks the email is on the approved list, active, and not expired.
   - Passes: create a code, store it hashed, email it.
   - Fails: send nothing, log the refusal.
   - Either way the page says: "If this email has access, a code has been sent."
4. They enter the code. It must be correct, unexpired, unused, for this email, and from this browser; otherwise it counts as a wrong try.
5. Device check:
   - Already registered: continue.
   - New device, fewer than 3: register it, email "New device added".
   - New device, already 3: block with "Device limit reached. Contact support." and alert the admin.
6. Session check:
   - Fewer than 3 active: continue.
   - Already 3: end the oldest, email "Signed out on another device".
7. First login only: set access start = now, end = now + 14 days; email "You have access until \<date, Gulf time>".
8. Create the session cookie (HttpOnly, Secure, SameSite=Lax) and send them to `/tutorial`. Lax, not Strict, so links opened from WhatsApp or email keep the login.

### B. Watching

1. On every load of `/tutorial` the server checks session (exists, not ended, not expired), device (registered, not removed, matches the session) and email (active, before access end).
2. Any check fails: end the session and redirect to `/login`. If access has expired, show "Your access has ended. Contact us to renew."
3. All pass:
   - Create a signed R2 link ending at video length + 30 min, or at the access end if sooner.
   - Render the player with the moving email watermark.
   - Send noindex and no-store headers, no referrer, and load no analytics scripts.
4. If the link expires mid-video, the player asks a protected route for a fresh one. The same checks run and playback resumes from the same position.

### C. Logout

The session ends; the device stays registered.

### D. Daily reminder job

- Email users whose access ends in about 2 days: "Your access ends on \<date>".
- Mark ended sessions and expired access in the log. Nothing is deleted.

### E. Admin page (admin only, behind its own login)

- **Users:** add, disable or delete an email; see status (not started, active with days left, expired) and end date; filter by expiring soon or expired.
- **Extend:** add days to the current end date.
- **Renew:** give 14 fresh days, clear devices, end sessions.
- **Devices:** see each person's devices; removing one frees a slot and ends that device's sessions.
- **Sessions:** see active sessions and end any of them.
- **Activity log:** search by email; spot refused emails, device-limit blocks, and many locations on one email.

Only the admin can remove devices, so users can't keep swapping in other people's browsers.

## Security checklist

The video is never publicly reachable; every check runs on the server.

- [ ] Bucket has no public access, no `r2.dev` link and no custom domain
- [ ] R2 token is read-only and limited to this one bucket; keys live only on the server
- [ ] Bucket CORS allows only our domain, `GET`/`HEAD`, and the `Range` header
- [ ] All checks run server-side; nothing relies on browser code
- [ ] Email matching is exact; free email domains are never allowed
- [ ] Code requests are rate-limited; codes are cancelled after 5 wrong tries
- [ ] Login message is identical whether or not the email is approved
- [ ] Tokens and codes stored hashed; cookies HttpOnly and Secure
- [ ] Video page sends no referrer, loads no analytics, is not indexed or cached
- [ ] Emergency stop documented: rotating the R2 token kills every video link at once

## Work plan

About 9 working days in total, in this order.

| # | Phase | Tasks | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | Video and R2 | Make the MP4 stream-friendly (ffmpeg faststart); create the private bucket; upload as `video/mp4`; read-only token; CORS | 0.5 day | Not started |
| 2 | Database | Create the 5 tables; index email, token hash and expiry | 0.5 day | Not started |
| 3 | Email | SMTP or sending service; SPF/DKIM; templates: code, new device, signed out, access granted, reminder | 0.5 day | Not started |
| 4 | Login | Device cookie, email form, allowlist and expiry check, rate limits, code send and verify, device limit, session limit, start of 14 days, logout | 2 days | Not started |
| 5 | Protected video | Shared check helper; signed R2 link capped at access end; refresh route; player with moving watermark; security headers | 1 day | Not started |
| 6 | Access period and alerts | Expiry checks everywhere; daily reminder job; alert emails | 1 day | Not started |
| 7 | Admin page | Admin login; users (add, extend, renew), devices, sessions, log | 1.5 days | Not started |
| 8 | Testing | Run the testing checklist below | 1 day | Not started |
| 9 | Launch | Load approved emails; delete or make private the YouTube video; send clients the page link and instructions | 0.5 day | Not started |

## Testing checklist

All items must pass before clients get access.

**Login**

- [ ] Approved email gets a code; unapproved gets nothing, sees the same message, and is logged
- [ ] 5 wrong codes cancel the code; expired and used codes fail
- [ ] A code fails in a different browser from the one that requested it

**Devices and sessions**

- [ ] Devices 1–3 log in; device 4 is blocked, and works after the admin removes a device
- [ ] With 3 sessions open, a 4th login ends the oldest, which is redirected on its next load

**Access period**

- [ ] First login sets an end date 14 days later
- [ ] Days 1–14 work; day 15 is blocked, including mid-video at the next link refresh
- [ ] Reminder email arrives about 2 days before the end
- [ ] Expired email gets no code
- [ ] Extend and renew restore access; renew frees the device slots

**Admin controls**

- [ ] Disabling an email locks it out on the next request

**Video protection**

- [ ] Signed link fails after it expires
- [ ] Opening the bucket address directly is refused

**Playback and privacy**

- [ ] Plays and seeks on Chrome, Safari and iPhone
- [ ] Link refreshes mid-video without restarting playback
- [ ] No analytics requests and no referrer on the page
- [ ] Watermark stays visible in fullscreen (fullscreen the player container, not the `<video>` element)

## Client instructions and known limits

**Send with each client's access:**

- "Your access is personal and lasts 14 days from your first login."
- "You can use up to 3 devices. Private or incognito windows and clearing browser data count as a new device."
- "Sharing the video, page or login code is not permitted. Viewing is watermarked and logged."

**Known limits:**

- Nothing can stop screen recording; the moving email watermark makes a leak traceable to one person.
- A client can forward a login code in real time. The device and session limits and the activity log make that limited and visible.
- Lost device slots (incognito or cleared browser data) will be the main support request; the admin fixes them from the admin page.
