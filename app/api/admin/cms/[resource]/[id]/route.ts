import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { isCmsResource, normalizeCmsRecord, type CmsResource } from "@/lib/cms-validation";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

const tableByResource: Record<CmsResource, string> = { pages: "cms_pages", services: "cms_services", faqs: "cms_faqs", pricing: "cms_pricing", projects: "portfolio_projects" };

async function audit(action: string, resource: string, recordId: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource, record_id: recordId }) });
}

function refresh() {
  revalidateTag("cms-content", "max");
  revalidatePath("/", "layout");
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { resource, id } = await context.params;
  if (!isCmsResource(resource) || !id) return NextResponse.json({ error: "Resource tidak valid." }, { status: 400 });
  try {
    const body = await request.json() as { record?: unknown };
    const record = normalizeCmsRecord(resource, body.record);
    const response = await supabaseAdminFetch(`/rest/v1/${tableByResource[resource]}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (!response.ok) return NextResponse.json({ error: `Gagal memperbarui: ${await response.text()}` }, { status: 400 });
    const rows = await response.json() as unknown[];
    if (!rows.length) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    await audit("update", resource, id);
    refresh();
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Data tidak valid." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { resource, id } = await context.params;
  if (!isCmsResource(resource) || !id) return NextResponse.json({ error: "Resource tidak valid." }, { status: 400 });
  const response = await supabaseAdminFetch(`/rest/v1/${tableByResource[resource]}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  if (!response.ok) return NextResponse.json({ error: `Gagal menghapus: ${await response.text()}` }, { status: 400 });
  const rows = await response.json() as unknown[];
  if (!rows.length) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  await audit("delete", resource, id);
  refresh();
  return NextResponse.json({ ok: true });
}
