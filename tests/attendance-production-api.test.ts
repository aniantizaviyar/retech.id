import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { POST } from "../app/api/admin/saas/tenants/route";
import { PATCH, DELETE } from "../app/api/admin/saas/tenants/[id]/route";
import { ADMIN_COOKIE, createAdminSession } from "../lib/admin-auth";

const id = randomUUID(), backend = randomUUID();
const old = { id, slug: "synthetic", display_name: "Synthetic Company", product: "attendance", status: "active", customer_id: null, primary_contact_email: "owner@example.invalid", primary_contact_phone: null, settings: { retendance_backend_tenant_uuid: backend, retendance_kind: "real" }, updated_at: "2026-10-15T00:00:00Z" };
type Call = { url: string; method: string; body: Record<string, unknown> | null };
async function fixture(run: (calls: Call[]) => Promise<void>) {
  const original = globalThis.fetch, saved = { ...process.env }, calls: Call[] = [];
  Object.assign(process.env, { SUPABASE_URL: "https://example.invalid", SUPABASE_SECRET_KEY: "k".repeat(64), ADMIN_SESSION_SECRET: "s".repeat(64) });
  globalThis.fetch = async (input, init) => {
    const call = { url: String(input), method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : null }; calls.push(call);
    assert.ok(!call.url.includes("pos_tenant_members"), "Production baseline must not gain POS provisioning");
    if (call.url.includes("/saas_tenants?") && call.method === "GET") return Response.json([old]);
    if (call.url.includes("/saas_tenants") && ["POST", "PATCH"].includes(call.method)) return Response.json([{ ...old, ...call.body }]);
    if (call.url.includes("/cms_audit_log")) return new Response(null, { status: 204 });
    throw new Error("Unexpected network request");
  };
  try { await run(calls); } finally { globalThis.fetch = original; for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name]; Object.assign(process.env, saved); }
}
function request(method: string, body: unknown, options: { cookie?: boolean; origin?: string; host?: string } = {}) {
  const headers = new Headers({ "Content-Type": "application/json", host: options.host ?? "admin.retech.id", origin: options.origin ?? "https://admin.retech.id" });
  if (options.cookie !== false) headers.set("cookie", `${ADMIN_COOKIE}=${createAdminSession().value}`);
  return new Request(`https://admin.retech.id/api/admin/saas/tenants${method === "POST" ? "" : "/" + id}`, { method, headers, ...(method === "DELETE" ? {} : { body: JSON.stringify(body) }) });
}
test("production attendance create strips forged mapping and never provisions POS", async () => { await fixture(async calls => {
  const r = await POST(request("POST", old)); assert.equal(r.status, 200); assert.deepEqual(calls[0].body?.settings, {}); assert.equal(calls.length, 2);
}); });
test("production POS create keeps existing registry-only behavior", async () => { await fixture(async calls => {
  const r = await POST(request("POST", { ...old, product: "qr-order-pos", settings: {} })); assert.equal(r.status, 200); assert.equal(calls.length, 2);
}); });
test("production PATCH preserves binding and uses timestamp compare-and-swap", async () => { await fixture(async calls => {
  const r = await PATCH(request("PATCH", { ...old, settings: { retendance_backend_tenant_uuid: randomUUID(), color: "blue" } }), { params: Promise.resolve({ id }) });
  assert.equal(r.status, 200); assert.deepEqual(calls[1].body?.settings, { color: "blue", retendance_backend_tenant_uuid: backend, retendance_kind: "real" }); assert.ok(calls[1].url.includes("updated_at=eq."));
}); });
test("anonymous, foreign-origin and wrong-host mutations read no registry", async () => { await fixture(async calls => {
  for (const options of [{ cookie: false }, { origin: "https://foreign.example" }, { host: "retech.id" }]) assert.equal((await POST(request("POST", old, options))).status, 401);
  assert.equal(calls.length, 0);
}); });
test("attendance hard delete is blocked before any DELETE request", async () => { await fixture(async calls => {
  assert.equal((await DELETE(request("DELETE", null), { params: Promise.resolve({ id }) })).status, 409); assert.equal(calls.length, 1); assert.equal(calls[0].method, "GET");
}); });
