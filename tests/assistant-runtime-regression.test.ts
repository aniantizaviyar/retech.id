import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { POST as logout } from "../app/api/admin/auth/logout/route";
import { GET as sessionState } from "../app/api/admin/auth/session/route";
import { GET as invoices } from "../app/api/admin/business/invoices/route";
import { GET as quotations } from "../app/api/admin/business/quotations/route";
import { ADMIN_COOKIE, createAdminSession } from "../lib/admin-auth";
import { newSession, sign } from "../lib/assistant/security";
const before = { ...process.env },
  nativeFetch = globalThis.fetch;
let reads = 0;
beforeEach(() => {
  Object.assign(process.env, {
    NODE_ENV: "production",
    ADMIN_SESSION_SECRET: "regression-test-only-".repeat(4),
    RATE_LIMIT_SALT: "regression-public-salt-".repeat(3),
    SUPABASE_URL: "https://supabase.example.invalid",
    SUPABASE_SECRET_KEY: "regression-only",
  });
  reads = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (/\/business_(?:invoices|quotations)\?/.test(url)) {
      reads++;
      return Response.json([]);
    }
    throw new Error("Unexpected external call in regression fixture");
  };
});
after(() => {
  globalThis.fetch = nativeFetch;
  for (const key of Object.keys(process.env))
    if (!(key in before)) delete process.env[key];
  Object.assign(process.env, before);
});
function request(
  path: string,
  token?: string,
  origin = "https://admin.retech.id",
  method = "GET",
) {
  return new Request(`https://admin.retech.id${path}`, {
    method,
    headers: {
      host: "admin.retech.id",
      origin,
      ...(token ? { cookie: `${ADMIN_COOKIE}=${token}` } : {}),
    },
  });
}
test("admin session remains authenticated only by its original signed admin cookie", async () => {
  const valid = await sessionState(
    request("/api/admin/auth/session", createAdminSession().value),
  );
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).authenticated, true);
  const anonymous = await sessionState(request("/api/admin/auth/session"));
  assert.equal(anonymous.status, 401);
});
test("public assistant session cannot authenticate admin invoice or quotation reads", async () => {
  const publicToken = sign(newSession());
  for (const endpoint of [invoices, quotations])
    assert.equal(
      (await endpoint(request("/api/admin/business/invoices", publicToken)))
        .status,
      401,
    );
  assert.equal(reads, 0);
});
test("authenticated invoice and quotation list reads retain original authorization", async () => {
  const token = createAdminSession().value;
  for (const endpoint of [invoices, quotations])
    assert.equal(
      (await endpoint(request("/api/admin/business/invoices", token))).status,
      200,
    );
  assert.equal(reads, 2);
});
test("logout retains Secure HttpOnly SameSite cookie deletion and Origin checks", async () => {
  const token = createAdminSession().value;
  const bad = await logout(
    request("/api/admin/auth/logout", token, "https://evil.example", "POST"),
  );
  assert.equal(bad.status, 401);
  const good = await logout(
    request("/api/admin/auth/logout", token, "https://admin.retech.id", "POST"),
  );
  assert.equal(good.status, 200);
  const cookie = good.headers.get("set-cookie")!;
  assert.match(cookie, /Max-Age=0/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=strict/i);
});
test("updated mailer produces text/HTML and buffered attachments without external SMTP", async () => {
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "unix",
  });
  const info = await transport.sendMail({
    from: "sales@example.invalid",
    to: "recipient@example.invalid",
    subject: "Synthetic regression only",
    text: "Synthetic content",
    html: "<p>Synthetic content</p>",
    attachments: [
      { filename: "fixture.txt", content: Buffer.from("Synthetic attachment") },
    ],
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  const raw = info.message.toString();
  assert.match(raw, /multipart\/mixed/);
  assert.match(raw, /fixture\.txt/);
  assert.match(raw, /Synthetic regression only/);
});
