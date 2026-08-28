import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizeTenantInput } from "@/lib/saas";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";
async function audit(action: string, id?: string) { await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "saas-tenants", record_id: id }) }); }
export async function GET(request: Request) { if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const response = await supabaseAdminFetch("/rest/v1/saas_tenants?select=*&order=created_at.desc"); return response.ok ? NextResponse.json({ records: await response.json() }) : NextResponse.json({ error: "Tenant belum dapat dimuat." }, { status: 502 }); }
export async function POST(request: Request) { if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const record = normalizeTenantInput(await request.json()); const response = await supabaseAdminFetch("/rest/v1/saas_tenants", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) }); if (!response.ok) throw new Error(`Tenant belum dapat disimpan: ${await response.text()}`); const rows = await response.json() as Array<{id:string}>; await audit("create", rows[0]?.id); return NextResponse.json({ ok: true, record: rows[0] }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Tenant belum dapat disimpan." }, { status: 400 }); } }
