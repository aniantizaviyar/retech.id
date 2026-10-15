import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseAdminFetch } from "./supabase-admin";
import {
  ATTENDANCE_BIND_PATH,
  equal,
  signature,
  UUID,
} from "./attendance-control-protocol";
import type { SaasSubscription, SaasTenant } from "./saas";

export function controlConfig() {
  const key = process.env.RETENDANCE_CONTROL_HMAC_KEY ?? "";
  const keyId = process.env.RETENDANCE_CONTROL_KEY_ID ?? "retech-admin-v1";
  if (process.env.RETENDANCE_CONTROL_ENABLED !== "true" || key.length < 64)
    throw new Error("control_not_configured");
  return { key, keyId };
}
export async function registryTenant(id: string): Promise<SaasTenant | null> {
  if (!UUID.test(id)) throw new Error("Tenant ID tidak valid.");
  const r = await supabaseAdminFetch(
    `/rest/v1/saas_tenants?id=eq.${id}&select=*&limit=1`,
  );
  if (!r.ok) throw new Error("Registry tenant belum dapat dimuat.");
  return ((await r.json()) as SaasTenant[])[0] ?? null;
}
export async function registrySubscriptions(
  id: string,
): Promise<SaasSubscription[]> {
  if (!UUID.test(id)) throw new Error("Tenant ID tidak valid.");
  const r = await supabaseAdminFetch(
    `/rest/v1/saas_subscriptions?tenant_id=eq.${id}&product=eq.attendance&select=*&order=updated_at.desc&limit=100`,
  );
  if (!r.ok) throw new Error("Subscription belum dapat dimuat.");
  const rows = (await r.json()) as SaasSubscription[];
  if (rows.length >= 100)
    throw new Error(
      "Riwayat subscription melebihi batas snapshot; perlu rekonsiliasi operator.",
    );
  return rows.map((s) => ({ ...s, amount: Number(s.amount) }));
}
export async function bindAttendanceTenant(tenant: SaasTenant, uuid: string) {
  if (tenant.product !== "attendance" || !UUID.test(uuid))
    throw new Error("Mapping hanya untuk tenant attendance yang sah.");
  const existing = tenant.settings.retendance_backend_tenant_uuid;
  if (existing && existing !== uuid)
    throw new Error(
      "Tenant sudah terhubung; perubahan mapping memerlukan audit khusus.",
    );
  const { key, keyId } = controlConfig();
  const nonce = randomUUID();
  const at = String(Math.floor(Date.now() / 1000));
  const body = JSON.stringify({
    registry_tenant_id: tenant.id,
    backend_tenant_uuid: uuid,
  });
  const r = await fetch(`https://absensi.retech.id${ATTENDANCE_BIND_PATH}`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Retendance-Key-ID": keyId,
      "X-Retendance-Timestamp": at,
      "X-Retendance-Nonce": nonce,
      "X-Retendance-Signature": signature(
        `POST\n${ATTENDANCE_BIND_PATH}\n${at}\n${nonce}`,
        body,
        key,
      ),
    },
    body,
  });
  const text = await r.text();
  const responseAt = r.headers.get("X-Retendance-Timestamp") ?? "";
  if (
    !r.ok ||
    Buffer.byteLength(text) > 16384 ||
    r.headers.get("X-Retendance-Key-ID") !== keyId ||
    r.headers.get("X-Retendance-Nonce") !== nonce ||
    !/^\d{10}$/.test(responseAt) ||
    Math.abs(Date.now() / 1000 - Number(responseAt)) > 300 ||
    !equal(
      signature(`RESPONSE\n${r.status}\n${responseAt}\n${nonce}`, text, key),
      r.headers.get("X-Retendance-Signature") ?? "",
    )
  )
    throw new Error(
      "Backend belum dapat mengonfirmasi mapping. Tidak ada akun/absensi yang dibuat.",
    );
  const result = JSON.parse(text) as {
    backend_tenant_uuid: string;
    registry_tenant_id: string;
    kind: string;
  };
  if (
    result.backend_tenant_uuid !== uuid ||
    result.registry_tenant_id !== tenant.id ||
    !["real", "legacy"].includes(result.kind)
  )
    throw new Error("Respons mapping tidak sesuai.");
  const settings = {
    ...tenant.settings,
    retendance_backend_tenant_uuid: uuid,
    retendance_kind: result.kind,
  };
  if (!tenant.updated_at)
    throw new Error("Registry tidak memiliki versi timestamp.");
  const saved = await supabaseAdminFetch(
    `/rest/v1/saas_tenants?id=eq.${tenant.id}&product=eq.attendance&updated_at=eq.${encodeURIComponent(tenant.updated_at)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ settings }),
    },
  );
  if (!saved.ok)
    throw new Error(
      "Mapping backend dikonfirmasi, penyimpanan registry perlu dicoba ulang dengan UUID yang sama.",
    );
  const record = ((await saved.json()) as SaasTenant[])[0];
  if (!record)
    throw new Error(
      "Registry berubah saat mapping. Muat ulang lalu ulangi dengan UUID yang sama.",
    );
  return record;
}
