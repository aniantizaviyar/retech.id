import assert from "node:assert/strict";
import test from "node:test";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { ADMIN_COOKIE, createAdminSession } from "../lib/admin-auth";
import { isQuotationMailbox, parseQuotationCc } from "../lib/quotation-recipients";
import { type Quotation } from "../lib/quotations";
import { POST } from "../app/api/admin/business/quotations/[id]/send/route";

const primary = "pic@example.com";
const context = { params: Promise.resolve({ id: "e4569075-3220-460b-ae73-a73f83c1c088" }) };

test("CC is optional, supports commas and semicolons, and deduplicates against To", () => {
  assert.deepEqual(parseQuotationCc("", primary), []);
  assert.deepEqual(parseQuotationCc("Finance@example.com; PIC@example.com, finance@example.com; buyer@example.com;", primary), ["Finance@example.com", "buyer@example.com"]);
});

test("Quotation recipients reject lists in To, headers, mailbox formatting and oversized CC", () => {
  for (const value of ["a@example.com;", "a@example.com;b@example.com", "a@example.com,b@example.com", "Name <a@example.com>", "a@example.com\r\nBcc: x@example.com"]) {
    assert.equal(isQuotationMailbox(value), false);
  }
  for (const value of ["Team: a@example.com;", "broken", "a@example.com\r\nBcc: b@example.com", Array.from({ length: 11 }, (_, i) => `a${i}@example.com`).join(","), "a".repeat(3000)]) {
    assert.throws(() => parseQuotationCc(value, primary));
  }
});

test("Send route keeps To fixed and renders a real Cc header, without sending or writing externally", async (t) => {
  for (const [key, value] of Object.entries({ ADMIN_SESSION_SECRET: "unit-test-secret-not-for-production-cc", SUPABASE_URL: "https://db.test.invalid", SUPABASE_SECRET_KEY: "unit-test-cc", SMTP_HOST: "smtp.test.invalid", SMTP_PORT: "587", SMTP_USER: "test", SMTP_PASSWORD: "test" })) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const request = (body?: unknown, authenticated = true, origin = "https://admin.retech.id") => new Request("https://admin.retech.id/api/admin/business/quotations/test/send", {
    method: "POST",
    headers: { host: "admin.retech.id", origin, "Content-Type": "application/json", ...(authenticated ? { cookie: `${ADMIN_COOKIE}=${createAdminSession().value}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const record: Quotation = {
    id: (await context.params).id, quote_number: "RTD/QTN/2026/0099", status: "draft", issue_date: "2026-11-16", valid_until: "2026-12-16",
    customer_company: "Example Co", customer_name: "Example PIC", customer_email: primary, customer_address: "", customer_phone: "", subject: "Example Backup NAS",
    items: [{ name: "Example service", description: "Example only", quantity: 1, unit: "paket", unitPrice: 1000 }],
    discount_amount: 0, timeline: "", payment_terms: "", scope_included: [], scope_excluded: [], notes: "",
  };
  const updates: Record<string, unknown>[] = [];
  let failNextTrackingWrite = false;
  const database = t.mock.method(globalThis, "fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = new URL(String(input));
    assert.equal(url.host, "db.test.invalid");
    if (!init?.method) return Response.json([record]);
    if (init.method === "PATCH") {
      const update = JSON.parse(String(init.body));
      updates.push(update);
      if (failNextTrackingWrite) {
        failNextTrackingWrite = false;
        return new Response(null, { status: 500 });
      }
      return Response.json([{ ...record, ...update }]);
    }
    return new Response(null, { status: 201 });
  });
  const stream = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
  const messages: string[] = [];
  let accepted: string[] = [primary, "finance@example.com"];
  const transport = t.mock.method(nodemailer, "createTransport", () => ({
    async sendMail(mail: SendMailOptions) {
      const result = await stream.sendMail(mail);
      messages.push(result.message.toString());
      return { messageId: result.messageId, accepted };
    },
  }));

  assert.equal((await POST(request({cc:"",expectedTo:primary}, false), context)).status, 401);
  assert.equal((await POST(request({cc:"",expectedTo:primary}, true, "https://example.com"), context)).status, 401);
  assert.equal((await POST(request({cc:"",expectedTo:primary,bcc:"x@example.com"}), context)).status, 400);
  assert.equal((await POST(request({cc:"x".repeat(5000),expectedTo:primary}), context)).status, 413);
  assert.equal(database.mock.callCount(), 0);
  assert.equal((await POST(request({cc:"",expectedTo:"other@example.com"}), context)).status, 409);
  assert.equal((await POST(request({cc:"broken",expectedTo:primary}), context)).status, 400);
  assert.equal(transport.mock.callCount(), 0);

  const success = await POST(request({cc:"finance@example.com; PIC@example.com",expectedTo:primary}), context);
  assert.equal(success.status, 200);
  assert.equal((await success.json()).ok, true);
  assert.match(messages[0], /^To: Example PIC <pic@example\.com>/mi);
  assert.match(messages[0], /^Cc: finance@example\.com\r?$/mi);
  assert.match(messages[0], /^From: RETECH Digital Solution <sales@retech\.id>/mi);
  assert.match(messages[0], /Content-Type: application\/pdf/i);
  assert.equal(updates[0].last_email_recipient, primary);

  accepted = [primary];
  const partial = await POST(request({cc:"finance@example.com",expectedTo:primary}), context);
  assert.match((await partial.json()).message, /CC tidak diterima SMTP/);
  assert.equal(updates[1].delivery_status, "submitted");

  accepted = ["finance@example.com"];
  const rejected = await POST(request({cc:"finance@example.com",expectedTo:primary}), context);
  const result = await rejected.json();
  assert.equal(result.ok, false);
  assert.equal(result.warning, true);
  assert.equal(updates[2].delivery_status, "error");
  assert.equal(updates[2].status, undefined);

  accepted = [primary];
  const legacy = await POST(request(), context);
  assert.equal((await legacy.json()).ok, true);
  assert.doesNotMatch(messages[3], /^Cc:/mi);

  failNextTrackingWrite = true;
  t.mock.method(console, "error", () => {});
  const trackingFailed = await POST(request({cc:"",expectedTo:primary}), context);
  assert.equal(trackingFailed.status, 200);
  assert.match((await trackingFailed.json()).message, /sudah diserahkan ke Brevo/);
  assert.equal(updates.length, 5, "An accepted send must not be overwritten as failed if tracking breaks");
});
