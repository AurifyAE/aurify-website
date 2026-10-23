import { test } from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET = "test";
const { hmac, randomCode, randomToken } = await import("./crypto.ts");

test("randomCode is always 6 digits", () => {
  for (let i = 0; i < 1000; i++) assert.match(randomCode(), /^\d{6}$/);
});
test("hmac is stable and distinct", () => {
  assert.equal(hmac("a"), hmac("a"));
  assert.notEqual(hmac("a"), hmac("b"));
});
test("randomToken has 32 bytes of entropy", () => assert.ok(randomToken().length >= 43));
