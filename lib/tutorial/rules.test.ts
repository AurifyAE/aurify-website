import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  isFreeMailDomain,
  accessWindow,
  sessionExpiry,
  signedUrlTtl,
  canRequestCode,
  deviceDecision,
  sessionsToEnd,
  deviceLabel,
  formatGulf,
  accessStatus,
} from "./rules.ts";

const now = new Date("2026-10-22T08:00:00Z");
const h = (n: number) => new Date(now.getTime() + n * 3_600_000);

test("normalizeEmail", () => assert.equal(normalizeEmail("  Ali@Client.AE "), "ali@client.ae"));
test("free mail", () => {
  assert.equal(isFreeMailDomain("x@Gmail.com"), true);
  assert.equal(isFreeMailDomain("x@client.ae"), false);
});
test("accessWindow 14 days", () =>
  assert.deepEqual(accessWindow(now, 14), { start: now, end: new Date("2026-11-05T08:00:00Z") }));
test("sessionExpiry 12h", () => assert.deepEqual(sessionExpiry(now, h(100)), h(12)));
test("sessionExpiry capped at access end", () => assert.deepEqual(sessionExpiry(now, h(2)), h(2)));
test("ttl = video + 30 min", () => assert.equal(signedUrlTtl(now, h(100), 1200), 3000));
test("ttl capped at access end", () => assert.equal(signedUrlTtl(now, h(0.5), 7200), 1800));
test("ttl never negative", () => assert.equal(signedUrlTtl(now, h(-1), 1200), 0));
test("code gap 60s", () =>
  assert.equal(
    canRequestCode({ emailLastAt: new Date(now.getTime() - 59_000), emailLastHour: 1, ipLastHour: 1 }, now),
    false
  ));
test("code 5/hour", () =>
  assert.equal(canRequestCode({ emailLastAt: h(-0.5), emailLastHour: 5, ipLastHour: 5 }, now), false));
test("code ip 20/hour", () =>
  assert.equal(canRequestCode({ emailLastAt: null, emailLastHour: 0, ipLastHour: 20 }, now), false));
test("code allowed", () =>
  assert.equal(canRequestCode({ emailLastAt: h(-0.5), emailLastHour: 4, ipLastHour: 19 }, now), true));
test("devices", () => {
  assert.equal(deviceDecision(true, 3), "ok");
  assert.equal(deviceDecision(false, 2), "add");
  assert.equal(deviceDecision(false, 3), "blocked");
});
test("sessions", () => {
  assert.equal(sessionsToEnd(2), 0);
  assert.equal(sessionsToEnd(3), 1);
  assert.equal(sessionsToEnd(4), 2);
});
test("label", () =>
  assert.equal(
    deviceLabel(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    ),
    "Chrome · Windows"
  ));
test("label iPhone", () =>
  assert.equal(
    deviceLabel(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
    ),
    "Safari · iPhone"
  ));
test("gulf time", () => assert.equal(formatGulf(now), "22 Oct 2026, 12:00"));
test("status not started", () =>
  assert.deepEqual(accessStatus({ active: true, accessStartedAt: null, accessExpiresAt: null }, now), {
    status: "not_started",
    daysLeft: 14,
  }));
test("status active", () =>
  assert.deepEqual(accessStatus({ active: true, accessStartedAt: h(-24), accessExpiresAt: h(36) }, now), {
    status: "active",
    daysLeft: 2,
  }));
test("status expired", () =>
  assert.equal(
    accessStatus({ active: true, accessStartedAt: h(-400), accessExpiresAt: h(-1) }, now).status,
    "expired"
  ));
test("status disabled wins", () =>
  assert.equal(accessStatus({ active: false, accessStartedAt: null, accessExpiresAt: null }, now).status, "disabled"));
