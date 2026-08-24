import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizeInvoiceInput } from "@/lib/business-documents";
import { paymentAccountSnapshot } from "@/lib/invoice-server";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId?: string, details: Record<string, unknown> = {}) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "invoices", record_id: recordId, details }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const response = await supabaseAdminFetch("/rest/v1/business_invoices?select=*&order=created_at.desc");
  if (!response.ok) return NextResponse.json({ error: "Data invoice belum dapat dimuat." }, { status: 502 });
  return NextResponse.json({ records: await response.json() });
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const record = normalizeInvoiceInput(await request.json());
    const snapshot = await paymentAccountSnapshot(record.payment_account_id || "");
    const numberResponse = await supabaseAdminFetch("/rest/v1/rpc/next_invoice_number", { method: "POST", body: "{}" });
    if (!numberResponse.ok) throw new Error("Nomor invoice belum dapat dibuat.");
    const invoiceNumber = await numberResponse.json() as string;
    const response = await supabaseAdminFetch("/rest/v1/business_invoices", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...record, invoice_number: invoiceNumber, payment_account_snapshot: snapshot }) });
    if (!response.ok) throw new Error("Invoice belum dapat disimpan.");
    const rows = await response.json() as Array<{ id: string; invoice_number: string }>;
    await audit("create", rows[0]?.id, { invoice_number: rows[0]?.invoice_number });
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invoice belum dapat disimpan." }, { status: 400 }); }
}
