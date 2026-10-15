import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { SaasSubscription, SaasTenant } from "./saas";

export const ATTENDANCE_SOURCE_PATH = "/api/integrations/attendance/snapshot";
export const ATTENDANCE_BIND_PATH = "/api/integrations/retendance/tenant-bind";
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function signature(prefix: string, body: string, key: string) {
  return `v1=${createHmac("sha256", key)
    .update(`${prefix}\n${createHash("sha256").update(body).digest("hex")}`)
    .digest("hex")}`;
}
export function equal(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function verifySignature(
  method: string,
  path: string,
  body: string,
  headers: Headers,
  key: string,
  keyId: string,
  now = Date.now(),
): string {
  const at = headers.get("X-Retendance-Timestamp") ?? "";
  const nonce = headers.get("X-Retendance-Nonce") ?? "";
  const mac = headers.get("X-Retendance-Signature") ?? "";
  if (
    key.length < 64 ||
    headers.get("X-Retendance-Key-ID") !== keyId ||
    !/^\d{10}$/.test(at) ||
    Math.abs(Math.floor(now / 1000) - Number(at)) > 300 ||
    !UUID.test(nonce) ||
    !/^v1=[a-f0-9]{64}$/.test(mac) ||
    Buffer.byteLength(body) > 16384 ||
    !equal(signature(`${method}\n${path}\n${at}\n${nonce}`, body, key), mac)
  )
    throw new Error("invalid_signature");
  return nonce;
}
export function signedResponse(
  body: string,
  nonce: string,
  status: number,
  key: string,
  keyId: string,
  now = Date.now(),
): Headers {
  const at = String(Math.floor(now / 1000));
  return new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "private, no-store",
    "X-Retendance-Key-ID": keyId,
    "X-Retendance-Nonce": nonce,
    "X-Retendance-Timestamp": at,
    "X-Retendance-Signature": signature(
      `RESPONSE\n${status}\n${at}\n${nonce}`,
      body,
      key,
    ),
  });
}
export function provisioningProduct(tenant: {
  product: unknown;
}): "pos" | "attendance" {
  if (tenant.product === "qr-order-pos") return "pos";
  if (tenant.product === "attendance") return "attendance";
  throw new Error("Produk tenant tidak valid.");
}
export function preserveAttendanceBinding(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...incoming };
  for (const key of Object.keys(out))
    if (key.startsWith("retendance_")) delete out[key];
  for (const [key, value] of Object.entries(existing))
    if (key.startsWith("retendance_")) out[key] = value;
  return out;
}
export function normalizeAttendanceSubscription(
  record: SaasSubscription,
  tenant: SaasTenant,
): SaasSubscription {
  if (
    tenant.product !== "attendance" ||
    record.product !== "attendance" ||
    record.tenant_id !== tenant.id
  )
    throw new Error("Produk/tenant subscription tidak sesuai.");
  if (!["free", "pro", "business"].includes(record.plan_code))
    throw new Error("Paket attendance harus free, pro, atau business.");
  if (record.billing_cycle !== "monthly")
    throw new Error("ReTendance tahap ini hanya mendukung periode bulanan.");
  const rate =
    record.plan_code === "pro"
      ? 12500
      : record.plan_code === "business"
        ? 20000
        : 0;
  const seats = record.plan_code === "free" ? 10 : record.seat_quantity;
  if (
    !Number.isInteger(seats) ||
    seats < 1 ||
    seats > 100000 ||
    record.amount !== rate * seats
  )
    throw new Error(
      "Nilai billing harus sesuai harga katalog dikali slot. Tidak ada pembelian slot otomatis.",
    );
  const a = record.current_period_start
    ? new Date(record.current_period_start).getTime()
    : NaN;
  const b = record.current_period_end
    ? new Date(record.current_period_end).getTime()
    : NaN;
  if (
    rate &&
    (!Number.isFinite(a) ||
      !Number.isFinite(b) ||
      a >= b ||
      b - a > 32 * 86400000)
  )
    throw new Error("Periode bulanan wajib diisi dengan benar.");
  if (rate && record.status === "trialing")
    throw new Error(
      "Trial ReTendance hanya melalui demo dummy, bukan tenant pelanggan nyata.",
    );
  if (
    !rate &&
    (record.current_period_start ||
      record.current_period_end ||
      record.grace_until)
  )
    throw new Error("Free tidak memakai periode tagihan.");
  if (record.status === "grace_period") {
    const g = record.grace_until ? new Date(record.grace_until).getTime() : NaN;
    if (!rate || !Number.isFinite(g) || g <= b || g > b + 7 * 86400000)
      throw new Error("Grace maksimal 7 hari setelah periode.");
  }
  return { ...record, seat_quantity: seats, entitlements: {} }; // Laravel enforces the canonical catalog; never trust browser quota overrides.
}
export function buildAttendanceSnapshot(
  tenant: SaasTenant,
  subscriptions: SaasSubscription[],
  backendUuid: string,
) {
  if (
    tenant.product !== "attendance" ||
    !UUID.test(tenant.id) ||
    !UUID.test(backendUuid) ||
    tenant.settings.retendance_backend_tenant_uuid !== backendUuid
  )
    throw new Error("unbound_tenant");
  const base = {
    schema: 1,
    registry_tenant_id: tenant.id,
    backend_tenant_uuid: backendUuid,
    tenant_name: tenant.display_name,
    tenant_status: tenant.status,
  };
  if (tenant.settings.retendance_kind === "legacy") {
    if (tenant.status !== "active" || subscriptions.length)
      throw new Error("legacy_protected");
    return {
      ...base,
      plan: "legacy",
      seats: 0,
      subscription_status: "active",
      subscription_uuid: null,
      monthly_amount_idr: 0,
      period_start: null,
      period_end: null,
      grace_until: null,
    };
  }
  const open = subscriptions.filter((s) => s.status !== "cancelled");
  if (open.length > 1) throw new Error("ambiguous_subscription");
  const raw =
    open[0] ??
    [...subscriptions].sort((a, b) =>
      String(b.updated_at).localeCompare(String(a.updated_at)),
    )[0];
  if (!raw)
    return {
      ...base,
      plan: "free",
      seats: 10,
      subscription_status: "active",
      subscription_uuid: null,
      monthly_amount_idr: 0,
      period_start: null,
      period_end: null,
      grace_until: null,
    };
  const s = normalizeAttendanceSubscription(raw, tenant);
  return {
    ...base,
    plan: s.plan_code,
    seats: s.seat_quantity,
    subscription_status: s.status,
    subscription_uuid: s.id,
    monthly_amount_idr: s.amount,
    period_start: s.current_period_start,
    period_end: s.current_period_end,
    grace_until: s.grace_until,
  };
}
