import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizePaymentAccountInput } from "@/lib/business-documents";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId?: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "payment_accounts", record_id: recordId }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const response = await supabaseAdminFetch("/rest/v1/business_payment_accounts?select=*&order=is_default.desc,created_at.asc");
  if (!response.ok) return NextResponse.json({ error: "Data rekening belum dapat dimuat." }, { status: 502 });
  return NextResponse.json({ records: await response.json() });
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const record = normalizePaymentAccountInput(await request.json());
    if (record.is_default) await supabaseAdminFetch("/rest/v1/business_payment_accounts?is_default=eq.true", { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ is_default: false }) });
    const response = await supabaseAdminFetch("/rest/v1/business_payment_accounts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (!response.ok) throw new Error("Rekening belum dapat disimpan.");
    const rows = await response.json() as Array<{ id: string }>;
    await audit("create", rows[0]?.id);
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Rekening belum dapat disimpan." }, { status: 400 }); }
}
