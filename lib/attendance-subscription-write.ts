import "server-only";
import { normalizeSubscriptionInput, type SaasSubscription } from "./saas";
import {
  normalizeAttendanceSubscription,
  UUID,
} from "./attendance-control-protocol";
import { registrySubscriptions, registryTenant } from "./attendance-control";
import { supabaseAdminFetch } from "./supabase-admin";
export async function prepareSubscription(
  input: unknown,
  current?: SaasSubscription,
) {
  if (
    current &&
    (!input ||
      typeof input !== "object" ||
      (input as Record<string, unknown>).updated_at !== current.updated_at)
  )
    throw new Error(
      "Subscription sudah berubah. Muat ulang sebelum menyimpan.",
    );
  const normalized = normalizeSubscriptionInput(input);
  const tenant = await registryTenant(normalized.tenant_id);
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  if (
    normalized.product !== tenant.product ||
    (current &&
      (current.product !== normalized.product ||
        current.tenant_id !== normalized.tenant_id))
  )
    throw new Error(
      "Subscription tidak dapat dipindah ke produk atau tenant lain.",
    );
  if (tenant.product !== "attendance") return normalized;
  if (!tenant.settings.retendance_backend_tenant_uuid)
    throw new Error(
      "Tautkan UUID tenant ReTendance sebelum mengatur subscription.",
    );
  if (tenant.settings.retendance_kind === "legacy")
    throw new Error(
      "Tenant legacy tidak dikenakan subscription atau perubahan kuota pada tahap ini.",
    );
  const record = normalizeAttendanceSubscription(
    { ...normalized, id: current?.id ?? "" },
    tenant,
  );
  if (
    record.status !== "cancelled" &&
    (await registrySubscriptions(tenant.id)).some(
      (s) => s.id !== current?.id && s.status !== "cancelled",
    )
  )
    throw new Error(
      "Selesaikan subscription sebelumnya. Satu tenant hanya boleh memiliki satu subscription berjalan.",
    );
  const { id: _id, ...body } = record;
  return body;
}
export async function subscriptionRecord(
  id: string,
): Promise<SaasSubscription | null> {
  if (!UUID.test(id)) throw new Error("ID subscription tidak valid.");
  const r = await supabaseAdminFetch(
    `/rest/v1/saas_subscriptions?id=eq.${id}&select=*&limit=1`,
  );
  if (!r.ok) throw new Error("Subscription belum dapat dimuat.");
  const row = ((await r.json()) as SaasSubscription[])[0];
  return row ? { ...row, amount: Number(row.amount) } : null;
}
