import assert from "node:assert/strict";
import test from "node:test";
import { ensurePrimaryTenantOwner } from "../lib/pos-members";
test("attendance tenant creates no POS identity even when contact email exists", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Unexpected network call");
  };
  try {
    await ensurePrimaryTenantOwner({
      id: "synthetic",
      display_name: "Synthetic Company",
      primary_contact_email: "owner@example.invalid",
      product: "attendance",
    });
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});
test("POS provisioning is preserved and writes only the POS membership endpoint", async () => {
  const original = globalThis.fetch;
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SECRET_KEY = "synthetic-not-a-real-credential";
  const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push(String(input));
    assert.equal(init?.method, "POST");
    return new Response(null, { status: 204 });
  };
  try {
    await ensurePrimaryTenantOwner({
      id: "synthetic",
      display_name: "Synthetic POS",
      primary_contact_email: "owner@example.invalid",
      product: "qr-order-pos",
    });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].includes("/rest/v1/pos_tenant_members?"));
  } finally {
    globalThis.fetch = original;
    if (envUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = envUrl;
    if (envKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = envKey;
  }
});
