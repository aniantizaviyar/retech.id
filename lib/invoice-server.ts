import "server-only";
import { accountSnapshot, invoiceTotal, type Invoice, type PaymentAccount } from "./business-documents";
import { supabaseAdminFetch } from "./supabase-admin";

export async function loadPaymentAccount(id: string) {
  const response = await supabaseAdminFetch(`/rest/v1/business_payment_accounts?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!response.ok) throw new Error("Rekening pembayaran belum dapat dimuat.");
  const rows = await response.json() as PaymentAccount[];
  if (!rows.length || !rows[0].is_active) throw new Error("Rekening pembayaran tidak ditemukan atau sudah nonaktif.");
  return rows[0];
}

export async function paymentAccountSnapshot(id: string) {
  return accountSnapshot(await loadPaymentAccount(id));
}

export async function syncInvoicePaymentStatus(invoiceId: string) {
  const invoiceResponse = await supabaseAdminFetch(`/rest/v1/business_invoices?select=*&id=eq.${encodeURIComponent(invoiceId)}&limit=1`);
  if (!invoiceResponse.ok) return;
  const invoices = await invoiceResponse.json() as Invoice[];
  const invoice = invoices[0];
  if (!invoice || invoice.status === "cancelled") return;
  const paymentResponse = await supabaseAdminFetch(`/rest/v1/business_payments?select=amount,status&invoice_id=eq.${encodeURIComponent(invoiceId)}`);
  if (!paymentResponse.ok) return;
  const payments = await paymentResponse.json() as Array<{ amount: number; status: string }>;
  const paid = payments.filter((payment) => payment.status === "confirmed").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const total = invoiceTotal({ ...invoice, discount_amount: Number(invoice.discount_amount), items: invoice.items.map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) });
  const today = new Date().toISOString().slice(0, 10);
  const nextStatus = paid >= total && total > 0 ? "paid" : paid > 0 ? "partially_paid" : invoice.due_date < today ? "overdue" : invoice.status === "draft" ? "draft" : "sent";
  if (nextStatus !== invoice.status) {
    await supabaseAdminFetch(`/rest/v1/business_invoices?id=eq.${encodeURIComponent(invoiceId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: nextStatus }) });
  }
}
