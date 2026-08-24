import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { normalizePaymentInput } from "@/lib/business-documents";
import { syncInvoicePaymentStatus } from "@/lib/invoice-server";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, recordId: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "payments", record_id: recordId }) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params;
    const previousResponse = await supabaseAdminFetch(`/rest/v1/business_payments?select=invoice_id&id=eq.${encodeURIComponent(id)}&limit=1`);
    const previous = previousResponse.ok ? await previousResponse.json() as Array<{ invoice_id: string }> : [];
    const record = normalizePaymentInput(await request.json());
    const response = await supabaseAdminFetch(`/rest/v1/business_payments?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (!response.ok) throw new Error("Pembayaran belum dapat diperbarui.");
    const rows = await response.json() as Array<{ id: string }>;
    if (!rows.length) return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    await syncInvoicePaymentStatus(record.invoice_id);
    if (previous[0]?.invoice_id && previous[0].invoice_id !== record.invoice_id) await syncInvoicePaymentStatus(previous[0].invoice_id);
    await audit("update", id);
    return NextResponse.json({ ok: true, record: rows[0] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Pembayaran belum dapat diperbarui." }, { status: 400 }); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const response = await supabaseAdminFetch(`/rest/v1/business_payments?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  if (!response.ok) return NextResponse.json({ error: "Pembayaran belum dapat dihapus." }, { status: 502 });
  const rows = await response.json() as Array<{ id: string; invoice_id: string }>;
  if (!rows.length) return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
  await syncInvoicePaymentStatus(rows[0].invoice_id);
  await audit("delete", id);
  return NextResponse.json({ ok: true });
}
