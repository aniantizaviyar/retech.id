import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizeCustomerInput } from "@/lib/business-documents";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";
async function audit(action: string, id?: string) { await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "customers", record_id: id }) }); }
export async function GET(request: Request) { if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const response = await supabaseAdminFetch("/rest/v1/business_customers?select=*&order=company_name.asc"); return response.ok ? NextResponse.json({ records: await response.json() }) : NextResponse.json({ error: "Customer belum dapat dimuat." }, { status: 502 }); }
export async function POST(request: Request) { if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const record = normalizeCustomerInput(await request.json()); const response = await supabaseAdminFetch("/rest/v1/business_customers", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) }); if (!response.ok) throw new Error("Customer belum dapat disimpan."); const rows = await response.json() as Array<{id:string}>; await audit("create", rows[0]?.id); return NextResponse.json({ ok: true, record: rows[0] }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Customer belum dapat disimpan." }, { status: 400 }); } }
