import test, { beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chatInput, type Answer } from "../lib/assistant/contracts";
import { recordExchange } from "../lib/assistant/history";
import { listHistory, detailHistory, deleteHistory } from "../lib/assistant/history-admin";
import { redactHistoryText } from "../lib/assistant/history-policy";
import { ADMIN_COOKIE, createAdminSession } from "../lib/admin-auth";
import { newSession } from "../lib/assistant/security";
const nativeFetch = globalThis.fetch, prior = { ...process.env };
let calls: Array<{ url: string; body: Record<string, unknown> }> = [], fail = false;
const id = "a26fdc58-4356-4b9a-8ba1-0a3c2e9fe014";
beforeEach(() => {
  Object.assign(process.env, { NODE_ENV: "production", ADMIN_SESSION_SECRET: "history-test-only-".repeat(4), RATE_LIMIT_SALT: "history-rate-test-only-".repeat(4), SUPABASE_URL: "https://history.example.invalid", SUPABASE_SECRET_KEY: "history-test-key" });
  calls = []; fail = false;
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), body: JSON.parse(String(init?.body || "{}")) });
    if (fail) return Response.json({ error: "secret storage error" }, { status: 500 });
    return Response.json(true);
  };
});
after(() => { globalThis.fetch = nativeFetch; for (const key of Object.keys(process.env)) if (!(key in prior)) delete process.env[key]; Object.assign(process.env, prior); });
function admin(method="GET", body?: unknown, origin="https://admin.retech.id", token=createAdminSession().value) {
  return new Request(`https://admin.retech.id/api/admin/assistant/conversations/${id}`, { method, headers: { host: "admin.retech.id", origin, cookie: `${ADMIN_COOKIE}=${token}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
const answer: Answer = { text: "Lihat layanan resmi.", skill: "search_information", sources: [{ title: "Layanan", href: "/services/web-development" }], provider: "guided" };
test("history consent is separate, opt-in and defaults off", async () => {
  const input = chatInput.parse({ message: "Layanan VPS", locale: "id", aiConsent: true });
  assert.equal(input.historyConsent, false);
  assert.equal(await recordExchange(input, answer, newSession()), false);
  assert.equal(calls.length, 0);
});
test("only the current redacted exchange is persisted, not supplied history or raw metadata", async () => {
  const input = chatInput.parse({ message: "Hubungi user@example.invalid, 081123456789. password=hunter2", locale: "id", historyConsent: true, history: [{ role: "user", text: "FORGED PRIOR HISTORY" }] });
  assert.equal(await recordExchange(input, { ...answer, sources: [...answer.sources, { title: "Unsafe", href: "javascript:alert(1)" }] }, newSession()), true);
  assert.equal(calls.length, 1);
  const serialized = JSON.stringify(calls[0].body);
  assert.doesNotMatch(serialized, /user@example|081123456789|hunter2|FORGED|javascript|turnstile|cookie|userAgent/);
  assert.match(serialized, /EMAIL DISAMARKAN/);
  assert.equal(calls[0].body.p_answer, answer.text);
});
test("redaction bounds text and strips private keys, common credentials and controls", () => {
  const value = redactHistoryText("-----BEGIN RSA PRIVATE KEY-----abc-----END RSA PRIVATE KEY-----\nAuthorization: Bearer private\napi_key=secret\nuser@test.invalid\u0000" + "x".repeat(7000));
  assert.ok(value.length <= 6000);
  assert.doesNotMatch(value, /BEGIN|Bearer|api_key=|@test|\u0000/);
});
test("storage failure never fails a public answer or exposes database errors", async () => {
  fail = true;
  assert.equal(await recordExchange(chatInput.parse({ message: "VPS", locale: "id", historyConsent: true }), answer, newSession()), false);
});
test("anonymous, public-session and cross-origin mutations cannot reach storage", async () => {
  assert.equal((await listHistory(admin("GET", undefined, undefined, ""))).status, 401);
  assert.equal((await detailHistory(admin("GET", undefined, undefined, "public-token"), id)).status, 401);
  assert.equal((await deleteHistory(admin("DELETE", { confirmation: "HAPUS" }, "https://evil.example"), id)).status, 401);
  assert.equal(calls.length, 0);
});
test("admin validation rejects invalid IDs, pagination and deletion without exact confirmation", async () => {
  assert.equal((await detailHistory(admin(), "not-an-id")).status, 400);
  const req = admin(); const invalidPage = new Request(`${req.url}?page=9999`, req);
  assert.equal((await listHistory(invalidPage)).status, 400);
  assert.equal((await deleteHistory(admin("DELETE", { confirmation: "yes" }), id)).status, 400);
  assert.equal((await deleteHistory(admin("DELETE", { confirmation: "HAPUS", everything: true }), id)).status, 400);
  assert.equal(calls.length, 0);
});
test("authorized deletion targets exactly one ID through a fixed RPC and is not cached", async () => {
  const response = await deleteHistory(admin("DELETE", { confirmation: "HAPUS" }), id);
  assert.equal(response.status, 200);
  assert.deepEqual(calls[0].body, { p_id: id });
  assert.match(calls[0].url, /rpc\/assistant_history_delete$/);
  assert.match(response.headers.get("cache-control")!, /no-store/);
});
test("expired detail returns 404 and storage errors remain generic", async () => {
  globalThis.fetch = async () => Response.json(null);
  assert.equal((await detailHistory(admin(), id)).status, 404);
  globalThis.fetch = async () => Response.json({ error: "secret" }, { status: 500 });
  const response = await listHistory(admin());
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /secret/);
});
test("UI is masked, text-only, paginated and deletion requires a native confirmation dialog", async () => {
  const ui = await readFile(new URL("../app/admin/AssistantHistoryPanel.tsx", import.meta.url), "utf8");
  assert.match(ui, /data-clarity-mask/); assert.match(ui, /showModal/); assert.match(ui, /confirmation !== "HAPUS"/);
  assert.doesNotMatch(ui, /dangerouslySetInnerHTML|localStorage|sessionStorage/);
  assert.match(ui, /noopener noreferrer/); assert.match(ui, /page=\$\{page\}/);
});
