import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import {
  buildAttendanceSnapshot,
  normalizeAttendanceSubscription,
  preserveAttendanceBinding,
  provisioningProduct,
  signature,
  signedResponse,
  verifySignature,
} from "../lib/attendance-control-protocol";
import type { SaasSubscription, SaasTenant } from "../lib/saas";
const uuid = randomUUID();
const backend = randomUUID();
const key = "k".repeat(64);
const keyId = "retech-admin-v1";
const tenant: SaasTenant = {
  id: uuid,
  customer_id: null,
  slug: "attendance-test",
  display_name: "Synthetic Company",
  product: "attendance",
  status: "active",
  primary_contact_email: null,
  primary_contact_phone: null,
  settings: {
    retendance_backend_tenant_uuid: backend,
    retendance_kind: "real",
  },
};
const sub: SaasSubscription = {
  id: randomUUID(),
  tenant_id: uuid,
  product: "attendance",
  plan_code: "pro",
  billing_cycle: "monthly",
  amount: 25000,
  currency: "IDR",
  status: "active",
  seat_quantity: 2,
  current_period_start: "2026-10-15T00:00:00Z",
  current_period_end: "2026-11-15T00:00:00Z",
  grace_until: null,
  auto_renew: false,
  payment_provider: null,
  external_reference: null,
  last_payment_at: null,
  entitlements: {},
};
test("attendance must never select POS provisioning", () => {
  assert.equal(provisioningProduct(tenant), "attendance");
  assert.equal(provisioningProduct({ product: "qr-order-pos" }), "pos");
  assert.throws(() => provisioningProduct({ product: undefined }));
});
test("ordinary tenant writes cannot forge or erase a backend binding", () => {
  assert.deepEqual(
    preserveAttendanceBinding(
      { retendance_backend_tenant_uuid: backend, other: 1 },
      {
        retendance_backend_tenant_uuid: randomUUID(),
        retendance_kind: "legacy",
        color: "blue",
      },
    ),
    { color: "blue", retendance_backend_tenant_uuid: backend },
  );
});
test("signed request binds method, path, timestamp, nonce and exact bytes", () => {
  const path = "/api/integrations/attendance/snapshot";
  const body = JSON.stringify({ registry_tenant_id: uuid });
  const nonce = randomUUID();
  const at = "1792065600";
  const h = new Headers({
    "X-Retendance-Key-ID": keyId,
    "X-Retendance-Timestamp": at,
    "X-Retendance-Nonce": nonce,
    "X-Retendance-Signature": signature(
      `POST\n${path}\n${at}\n${nonce}`,
      body,
      key,
    ),
  });
  assert.equal(
    verifySignature("POST", path, body, h, key, keyId, Number(at) * 1000),
    nonce,
  );
  for (const [method, p, b, time] of [
    ["GET", path, body, Number(at) * 1000],
    ["POST", "/other", body, Number(at) * 1000],
    ["POST", path, body + " ", Number(at) * 1000],
    ["POST", path, body, (Number(at) + 301) * 1000],
  ] as const)
    assert.throws(() => verifySignature(method, p, b, h, key, keyId, time));
});
test("response MAC matches PHP protocol and echoes nonce", () => {
  const n = randomUUID();
  const h = signedResponse('{"ok":true}', n, 200, key, keyId, 1792065600000);
  assert.equal(h.get("X-Retendance-Nonce"), n);
  assert.equal(
    h.get("X-Retendance-Signature"),
    signature(`RESPONSE\n200\n1792065600\n${n}`, '{"ok":true}', key),
  );
});
test("Pro price is Rp12500 per slot; arbitrary browser entitlements are discarded", () => {
  assert.deepEqual(
    normalizeAttendanceSubscription(
      { ...sub, entitlements: { employees: 99999 } },
      tenant,
    ).entitlements,
    {},
  );
  assert.throws(() =>
    normalizeAttendanceSubscription({ ...sub, amount: 4000 }, tenant),
  );
});
test("business price is Rp20000 per slot", () => {
  assert.equal(
    normalizeAttendanceSubscription(
      { ...sub, plan_code: "business", amount: 40000 },
      tenant,
    ).amount,
    40000,
  );
});
test("annual billing, cross-tenant records, real-data trial and long grace are rejected", () => {
  for (const extra of [
    { billing_cycle: "annual" },
    { tenant_id: randomUUID() },
    { status: "trialing" },
    { status: "grace_period", grace_until: "2026-11-24T00:00:00Z" },
  ])
    assert.throws(() =>
      normalizeAttendanceSubscription(
        { ...sub, ...extra } as SaasSubscription,
        tenant,
      ),
    );
});
test("Free has ten employees and no paid period", () => {
  const free = normalizeAttendanceSubscription(
    {
      ...sub,
      plan_code: "free",
      amount: 0,
      seat_quantity: 1,
      current_period_start: null,
      current_period_end: null,
    },
    tenant,
  );
  assert.equal(free.seat_quantity, 10);
});
test("missing subscription resolves to canonical Free, not paid access", () => {
  const s = buildAttendanceSnapshot(tenant, [], backend);
  assert.equal(s.plan, "free");
  assert.equal(s.seats, 10);
  assert.equal(s.monthly_amount_idr, 0);
});
test("snapshot rejects a mismatched UUID, POS tenant, and ambiguous subscriptions", () => {
  assert.throws(() => buildAttendanceSnapshot(tenant, [], randomUUID()));
  assert.throws(() =>
    buildAttendanceSnapshot(
      { ...tenant, product: "qr-order-pos" },
      [],
      backend,
    ),
  );
  assert.throws(() =>
    buildAttendanceSnapshot(
      tenant,
      [sub, { ...sub, id: randomUUID() }],
      backend,
    ),
  );
});
test("legacy remains unbilled and cannot receive a paid subscription", () => {
  const t = {
    ...tenant,
    settings: { ...tenant.settings, retendance_kind: "legacy" },
  };
  assert.equal(buildAttendanceSnapshot(t, [], backend).plan, "legacy");
  assert.throws(() => buildAttendanceSnapshot(t, [sub], backend));
  assert.throws(() =>
    buildAttendanceSnapshot({ ...t, status: "suspended" }, [], backend),
  );
});
test("snapshot carries no contact, identity, employee, or face data", () => {
  const s = buildAttendanceSnapshot(
    { ...tenant, primary_contact_email: "private@example.invalid" },
    [sub],
    backend,
  );
  for (const key of [
    "primary_contact_email",
    "password",
    "employees",
    "photos",
    "settings",
    "entitlements",
  ])
    assert.equal(key in s, false);
});
