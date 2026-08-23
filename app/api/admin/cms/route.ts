import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { ensureCmsSeeded } from "@/lib/cms-data";
import { isCmsResource, normalizeCmsRecord, type CmsResource } from "@/lib/cms-validation";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

const tableByResource: Record<CmsResource, string> = {
  pages: "cms_pages", services: "cms_services", faqs: "cms_faqs", pricing: "cms_pricing", projects: "portfolio_projects",
};

function refreshPublicContent() {
  revalidateTag("cms-content", "max");
  revalidatePath("/", "layout");
}

async function audit(action: string, resource: string, recordId?: string, details: Record<string, unknown> = {}) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource, record_id: recordId, details }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    await ensureCmsSeeded();
    const resource = new URL(request.url).searchParams.get("resource") || "";
    if (!isCmsResource(resource)) return NextResponse.json({ error: "Resource tidak valid." }, { status: 400 });
    const order = resource === "pages" ? "label.asc" : "sort_order.asc";
    const response = await supabaseAdminFetch(`/rest/v1/${tableByResource[resource]}?select=*&order=${order}`);
    if (!response.ok) throw new Error(await response.text());
    return NextResponse.json({ resource, records: await response.json() });
  } catch (error) {
    console.error("CMS list failed", error);
    return NextResponse.json({ error: "Data CMS belum dapat dimuat." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json() as { resource?: unknown; record?: unknown };
    const resource = typeof body.resource === "string" ? body.resource : "";
    if (!isCmsResource(resource)) return NextResponse.json({ error: "Resource tidak valid." }, { status: 400 });
    const record = normalizeCmsRecord(resource, body.record);
    const response = await supabaseAdminFetch(`/rest/v1/${tableByResource[resource]}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (!response.ok) return NextResponse.json({ error: `Gagal menyimpan: ${await response.text()}` }, { status: 400 });
    const rows = await response.json() as Array<{ id?: string | number; slug?: string }>;
    const id = String(rows[0]?.id ?? rows[0]?.slug ?? "");
    await audit("create", resource, id, { slug: "slug" in record ? record.slug : undefined });
    refreshPublicContent();
    return NextResponse.json({ ok: true, record: rows[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Data tidak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
