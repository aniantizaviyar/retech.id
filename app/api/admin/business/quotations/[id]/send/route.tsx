import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import { readAdminSessionFromRequest } from "@/lib/admin-auth";
import { companyContact } from "@/lib/company";
import { quotationEmailHtml, quotationEmailSubject, quotationEmailText } from "@/lib/quotation-email";
import { QuotationPdf } from "@/lib/quotation-pdf";
import type { Quotation } from "@/lib/quotations";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 30;

function coerceQuotation(record: Quotation): Quotation {
  return { ...record, discount_amount: Number(record.discount_amount || 0), items: (record.items || []).map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) };
}

async function recordEvent(quotationId: string, event: string, recipient: string, messageId: string | null, reason: string | null) {
  await supabaseAdminFetch("/rest/v1/business_quotation_email_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ quotation_id: quotationId, event, recipient, provider_message_id: messageId, reason }) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const response = await supabaseAdminFetch(`/rest/v1/business_quotations?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!response.ok) return Response.json({ error: "Quotation belum dapat dimuat." }, { status: 502 });
  const records = await response.json() as Quotation[];
  if (!records.length) return Response.json({ error: "Quotation tidak ditemukan." }, { status: 404 });
  const quotation = coerceQuotation(records[0]);
  if (!quotation.customer_email) return Response.json({ error: "Email PIC customer belum diisi." }, { status: 400 });
  if (["accepted", "rejected", "expired"].includes(quotation.status)) return Response.json({ error: `Quotation berstatus ${quotation.status} tidak dapat dikirim ulang.` }, { status: 409 });

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return Response.json({ error: "Konfigurasi SMTP Brevo belum lengkap." }, { status: 503 });

  try {
    const [logo, signature, stamp] = await Promise.all([
      readFile(path.join(process.cwd(), "public", "retech-logo-transparent.png")),
      readFile(path.join(process.cwd(), "public", "documents", "retech-signature.png")),
      readFile(path.join(process.cwd(), "public", "documents", "retech-stamp-transparent.png")),
    ]);
    const pdf = await renderToBuffer(<QuotationPdf quotation={quotation} logoSrc={`data:image/png;base64,${logo.toString("base64")}`} signatureSrc={`data:image/png;base64,${signature.toString("base64")}`} stampSrc={`data:image/png;base64,${stamp.toString("base64")}`} />);
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth: { user, pass } });
    const filename = `RETECH-Quotation-${quotation.quote_number.replace(/[^A-Za-z0-9_-]+/g, "-")}.pdf`;
    const result = await transporter.sendMail({
      from: `"RETECH Digital Solution" <${companyContact.email}>`,
      to: { name: quotation.customer_name, address: quotation.customer_email },
      replyTo: companyContact.email,
      subject: quotationEmailSubject(quotation),
      html: quotationEmailHtml(quotation),
      text: quotationEmailText(quotation),
      headers: { "X-Mailin-Custom": `quotation_id=${quotation.id}`, "X-Mailin-Tag": "retech-quotation" },
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });
    const now = new Date().toISOString();
    const messageId = String(result.messageId || "");
    const update = await supabaseAdminFetch(`/rest/v1/business_quotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "sent", delivery_status: "submitted", last_email_recipient: quotation.customer_email, brevo_message_id: messageId || null, email_attempts: Number(quotation.email_attempts || 0) + 1, sent_at: quotation.sent_at || now, last_email_at: now, last_email_event_at: now, bounce_reason: null }) });
    if (!update.ok) throw new Error("Status pengiriman belum dapat disimpan.");
    await recordEvent(id, "submitted", quotation.customer_email, messageId || null, null);
    await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: companyContact.email, action: "quotation_email_submitted", resource: "quotations", record_id: id, details: { recipient: quotation.customer_email, message_id: messageId || null } }) });
    const updated = await update.json() as Quotation[];
    return Response.json({ ok: true, record: updated[0], message: `Quotation diserahkan ke Brevo untuk ${quotation.customer_email}.` });
  } catch (error) {
    console.error("Quotation email failed", error);
    const now = new Date().toISOString();
    await supabaseAdminFetch(`/rest/v1/business_quotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ delivery_status: "error", last_email_recipient: quotation.customer_email, last_email_at: now, last_email_event_at: now, bounce_reason: "Email belum dapat diserahkan ke provider." }) });
    await recordEvent(id, "error", quotation.customer_email, null, "Email belum dapat diserahkan ke provider.");
    return Response.json({ error: "Email quotation belum dapat dikirim. Periksa konfigurasi Brevo atau coba lagi." }, { status: 502 });
  }
}
