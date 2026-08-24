import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizeInvoiceInput } from "@/lib/business-documents";
import { paymentAccountSnapshot } from "@/lib/invoice-server";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "invoices", record_id: recordId }) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const record = normalizeInvoiceInput(await request.json());
    const snapshot = await paymentAccountSnapshot(record.payment_account_id || "");
    const response = await supabaseAdminFetch(`/rest/v1/business_invoices?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...record, payment_account_snapshot: snapshot }) });
    if (!response.ok) throw new Error("Invoice belum dapat diperbarui.");
    const rows = await response.json() as Array<{ id: string }>;
    if (!rows.length) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
    await audit("update", id);
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invoice belum dapat diperbarui." }, { status: 400 }); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const response = await supabaseAdminFetch(`/rest/v1/business_invoices?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  if (!response.ok) return NextResponse.json({ error: "Invoice yang memiliki pembayaran tidak dapat dihapus. Batalkan invoice sebagai gantinya." }, { status: 409 });
  const rows = await response.json() as Array<{ id: string }>;
  if (!rows.length) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  await audit("delete", id);
  return NextResponse.json({ ok: true });
}
