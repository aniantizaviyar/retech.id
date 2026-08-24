import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizePaymentInput } from "@/lib/business-documents";
import { syncInvoicePaymentStatus } from "@/lib/invoice-server";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId?: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "payments", record_id: recordId }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const response = await supabaseAdminFetch("/rest/v1/business_payments?select=*&order=payment_date.desc,created_at.desc");
  if (!response.ok) return NextResponse.json({ error: "Data pembayaran belum dapat dimuat." }, { status: 502 });
  return NextResponse.json({ records: await response.json() });
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const record = normalizePaymentInput(await request.json());
    const response = await supabaseAdminFetch("/rest/v1/business_payments", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (!response.ok) throw new Error("Pembayaran belum dapat disimpan.");
    const rows = await response.json() as Array<{ id: string }>;
    await syncInvoicePaymentStatus(record.invoice_id);
    await audit("create", rows[0]?.id);
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Pembayaran belum dapat disimpan." }, { status: 400 }); }
}
