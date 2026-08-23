import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizeQuotationInput } from "@/lib/quotations";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId?: string, details: Record<string, unknown> = {}) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "quotations", record_id: recordId, details }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const response = await supabaseAdminFetch("/rest/v1/business_quotations?select=*&order=created_at.desc");
  if (!response.ok) return NextResponse.json({ error: "Data quotation belum dapat dimuat." }, { status: 502 });
  return NextResponse.json({ records: await response.json() });
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const record = normalizeQuotationInput(await request.json());
    const numberResponse = await supabaseAdminFetch("/rest/v1/rpc/next_quotation_number", { method: "POST", body: "{}" });
    if (!numberResponse.ok) throw new Error("Nomor quotation belum dapat dibuat.");
    const quoteNumber = await numberResponse.json() as string;
    const response = await supabaseAdminFetch("/rest/v1/business_quotations", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...record, quote_number: quoteNumber }) });
    if (!response.ok) throw new Error("Quotation belum dapat disimpan.");
    const rows = await response.json() as Array<{ id: string; quote_number: string }>;
    await audit("create", rows[0]?.id, { quote_number: rows[0]?.quote_number });
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Quotation belum dapat disimpan." }, { status: 400 });
  }
}
