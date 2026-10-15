import { readAdminSessionFromRequest, ADMIN_EMAIL } from "@/lib/admin-auth";
import { bindAttendanceTenant, registryTenant } from "@/lib/attendance-control";
import { UUID } from "@/lib/attendance-control-protocol";
import { supabaseAdminFetch } from "@/lib/supabase-admin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const d = await request.json();
    if (
      typeof d.registry_tenant_id !== "string" ||
      !UUID.test(d.registry_tenant_id) ||
      typeof d.backend_tenant_uuid !== "string" ||
      !UUID.test(d.backend_tenant_uuid)
    )
      return Response.json(
        { error: "UUID mapping tidak valid." },
        { status: 422 },
      );
    const tenant = await registryTenant(d.registry_tenant_id);
    if (!tenant)
      return Response.json(
        { error: "Tenant tidak ditemukan." },
        { status: 404 },
      );
    const record = await bindAttendanceTenant(tenant, d.backend_tenant_uuid);
    await supabaseAdminFetch("/rest/v1/cms_audit_log", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        actor_email: ADMIN_EMAIL,
        action: "bind-attendance",
        resource: "saas-tenants",
        record_id: tenant.id,
      }),
    });
    return Response.json({
      ok: true,
      record,
      synchronization: "pending_next_poll",
    });
  } catch (e) {
    return Response.json(
      {
        error: e instanceof Error ? e.message : "Mapping belum dapat disimpan.",
      },
      { status: 409 },
    );
  }
}
