export const SAAS_PRODUCTS = ["qr-order-pos", "attendance"] as const;
export const TENANT_STATUSES = ["trialing", "active", "suspended", "cancelled"] as const;
export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "grace_period", "suspended", "cancelled"] as const;

export type SaasProduct = typeof SAAS_PRODUCTS[number];
export type TenantStatus = typeof TENANT_STATUSES[number];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[number];

export type SaasTenant = {
  id: string; customer_id: string | null; slug: string; display_name: string; product: SaasProduct; status: TenantStatus;
  primary_contact_email: string | null; primary_contact_phone: string | null; settings: Record<string, unknown>;
  created_at?: string; updated_at?: string;
};

export type SaasSubscription = {
  id: string; tenant_id: string; product: SaasProduct; plan_code: string; billing_cycle: "monthly" | "annual"; amount: number;
  currency: string; status: SubscriptionStatus; seat_quantity: number; current_period_start: string | null; current_period_end: string | null;
  grace_until: string | null; auto_renew: boolean; payment_provider: string | null; external_reference: string | null;
  last_payment_at: string | null; entitlements: Record<string, unknown>; created_at?: string; updated_at?: string;
};

function object(input: unknown) { return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function text(value: unknown, max = 500) { return typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) : ""; }
function optional(value: unknown, max = 500) { return text(value, max) || null; }
function enumValue<T extends readonly string[]>(value: unknown, values: T, fallback: T[number]) { const normalized = text(value, 50); return (values as readonly string[]).includes(normalized) ? normalized as T[number] : fallback; }
function json(value: unknown) { const normalized = object(value); if (JSON.stringify(normalized).length > 50_000) throw new Error("Konfigurasi terlalu besar."); return normalized; }

export function normalizeTenantInput(input: unknown) {
  const record = object(input);
  const slug = text(record.slug, 80).toLowerCase();
  const displayName = text(record.display_name, 200);
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug)) throw new Error("Slug tenant tidak valid.");
  if (displayName.length < 2) throw new Error("Nama tenant wajib diisi.");
  const email = optional(record.primary_contact_email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email tenant tidak valid.");
  return {
    customer_id: optional(record.customer_id, 80), slug, display_name: displayName,
    product: enumValue(record.product, SAAS_PRODUCTS, "qr-order-pos"), status: enumValue(record.status, TENANT_STATUSES, "trialing"),
    primary_contact_email: email, primary_contact_phone: optional(record.primary_contact_phone, 40), settings: json(record.settings),
  };
}
export function normalizeSubscriptionInput(input: unknown) {
  const record = object(input);
  const tenantId = text(record.tenant_id, 80);
  const planCode = text(record.plan_code, 80).toLowerCase();
  const amount = Number(record.amount);
  const seats = Number(record.seat_quantity);
  if (!tenantId) throw new Error("Tenant wajib dipilih.");
  if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(planCode)) throw new Error("Kode paket tidak valid.");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Nilai subscription tidak valid.");
  if (!Number.isInteger(seats) || seats < 1 || seats > 100000) throw new Error("Jumlah seat tidak valid.");
  const date = (value: unknown) => { const normalized = optional(value, 50); return normalized ? new Date(normalized).toISOString() : null; };
  return {
    tenant_id: tenantId, product: enumValue(record.product, SAAS_PRODUCTS, "qr-order-pos"), plan_code: planCode,
    billing_cycle: enumValue(record.billing_cycle, ["monthly", "annual"] as const, "monthly"), amount,
    currency: "IDR", status: enumValue(record.status, SUBSCRIPTION_STATUSES, "trialing"), seat_quantity: seats,
    current_period_start: date(record.current_period_start), current_period_end: date(record.current_period_end), grace_until: date(record.grace_until),
    auto_renew: record.auto_renew !== false, payment_provider: optional(record.payment_provider, 80), external_reference: optional(record.external_reference, 200),
    last_payment_at: date(record.last_payment_at), entitlements: json(record.entitlements),
  };
}
