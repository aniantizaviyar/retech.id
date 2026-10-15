import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { POST } from "../app/api/integrations/attendance/snapshot/route";
import {
  ATTENDANCE_SOURCE_PATH,
  signature,
} from "../lib/attendance-control-protocol";

const id = randomUUID(),
  backend = randomUUID(),
  key = "k".repeat(64),
  keyId = "retech-admin-v1";
const tenant = {
  id,
  display_name: "Synthetic",
  product: "attendance",
  status: "active",
  settings: {
    retendance_backend_tenant_uuid: backend,
    retendance_kind: "real",
  },
  updated_at: "2026-10-15T00:00:00Z",
};
function request(signed = true, overrides: object = {}) {
  const at = String(Math.floor(Date.now() / 1000)),
    nonce = randomUUID();
  const body = JSON.stringify({
    schema: 1,
    registry_tenant_id: id,
    backend_tenant_uuid: backend,
    ...overrides,
  });
  return new Request(`https://admin.retech.id${ATTENDANCE_SOURCE_PATH}`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "X-Retendance-Key-ID": keyId,
      "X-Retendance-Timestamp": at,
      "X-Retendance-Nonce": nonce,
      "X-Retendance-Signature": signed
        ? signature(
            `POST\n${ATTENDANCE_SOURCE_PATH}\n${at}\n${nonce}`,
            body,
            key,
          )
        : "invalid",
    },
  });
}
async function fixture(
  run: (calls: string[]) => Promise<void>,
  changed = false,
) {
  const original = globalThis.fetch,
    saved = { ...process.env },
    calls: string[] = [];
  let tenantReads = 0;
  Object.assign(process.env, {
    RETENDANCE_CONTROL_ENABLED: "true",
    RETENDANCE_CONTROL_HMAC_KEY: key,
    RETENDANCE_CONTROL_KEY_ID: keyId,
    SUPABASE_URL: "https://example.invalid",
    SUPABASE_SECRET_KEY: "synthetic",
  });
  globalThis.fetch = async (input, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    calls.push(String(input));
    if (String(input).includes("/saas_tenants?")) {
      tenantReads++;
      return Response.json([
        {
          ...tenant,
          updated_at:
            changed && tenantReads === 2
              ? "2026-10-15T00:01:00Z"
              : tenant.updated_at,
        },
      ]);
    }
    if (String(input).includes("/saas_subscriptions?"))
      return Response.json([]);
    throw new Error("Unexpected network request");
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = original;
    for (const name of Object.keys(process.env))
      if (!(name in saved)) delete process.env[name];
    Object.assign(process.env, saved);
  }
}
test("unsigned snapshot request reads no Supabase metadata", async () => {
  await fixture(async (calls) => {
    assert.equal((await POST(request(false))).status, 401);
    assert.equal(calls.length, 0);
  });
});
test("signed snapshot is verified by raw response bytes and contains only operational metadata", async () => {
  await fixture(async (calls) => {
    const req = request(),
      response = await POST(req),
      body = await response.text();
    assert.equal(response.status, 200);
    assert.equal(calls.length, 4);
    const nonce = req.headers.get("X-Retendance-Nonce"),
      at = response.headers.get("X-Retendance-Timestamp");
    assert.equal(response.headers.get("X-Retendance-Nonce"), nonce);
    assert.equal(
      response.headers.get("X-Retendance-Signature"),
      signature(`RESPONSE\n200\n${at}\n${nonce}`, body, key),
    );
    assert.equal(JSON.parse(body).plan, "free");
    assert.equal("settings" in JSON.parse(body), false);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  });
});
test("source edit during snapshot returns signed 409 instead of a mixed contract", async () => {
  await fixture(async () => {
    const response = await POST(request());
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error, "snapshot_unavailable");
    assert.ok(response.headers.get("X-Retendance-Signature"));
  }, true);
});
test("invalid signed UUID reads no registry and returns signed 422", async () => {
  await fixture(async (calls) => {
    const response = await POST(
      request(true, { backend_tenant_uuid: "wrong" }),
    );
    assert.equal(response.status, 422);
    assert.equal(calls.length, 0);
  });
});
test("PHP/Node signature vector is stable", () => {
  assert.equal(
    signature(
      "POST\n/api/integrations/attendance/snapshot\n1792065600\n12345678-1234-4234-8234-123456789abc",
      '{"schema":1}',
      key,
    ),
    "v1=505baaf4c42354e6e40814da0cb8ffb8f18f071e2d5a0b5c4d1eb6fba1a93987",
  );
});
