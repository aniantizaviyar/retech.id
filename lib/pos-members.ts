import "server-only";

import { supabaseAdminFetch } from "@/lib/supabase-admin";
import { provisioningProduct } from "@/lib/attendance-control-protocol";

export async function ensurePrimaryTenantOwner(tenant: { id: string; display_name: string; primary_contact_email: string | null; product: unknown }) {
  if (provisioningProduct(tenant) !== "pos") return; // Attendance membership is owned exclusively by Laravel.
  const email = tenant.primary_contact_email?.trim().toLowerCase();
  if (!email) return;
  const response = await supabaseAdminFetch("/rest/v1/pos_tenant_members?on_conflict=tenant_id,email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      tenant_id: tenant.id,
      email,
      display_name: `${tenant.display_name} Owner`,
      role: "owner",
      status: "active",
    }),
  });
  if (!response.ok) throw new Error("Akun owner POS belum dapat disinkronkan.");
}
