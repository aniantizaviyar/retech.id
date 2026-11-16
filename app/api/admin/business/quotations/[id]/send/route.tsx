import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import { readAdminSessionFromRequest } from "@/lib/admin-auth";
import { AssistantError, boundedJson } from "@/lib/assistant/security";
import { companyContact } from "@/lib/company";
import { quotationEmailHtml, quotationEmailSubject, quotationEmailText } from "@/lib/quotation-email";
import { QuotationPdf } from "@/lib/quotation-pdf";
import { isQuotationMailbox, parseQuotationCc } from "@/lib/quotation-recipients";
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
  if (!readAdminSessionFromRequest(request, true)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let ccInput = "";
  let expectedTo: string | undefined;
  if (request.body) {
    try {
      const input = await boundedJson(request, 4096);
      if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => key !== "cc" && key !== "expectedTo") || !("cc" in input) || typeof input.cc !== "string" || !("expectedTo" in input) || typeof input.expectedTo !== "string" || !isQuotationMailbox(input.expectedTo)) {
        return Response.json({ error: "Format CC tidak valid." }, { status: 400 });
      }
      ccInput = input.cc;
      expectedTo = input.expectedTo;
    } catch (error) {
      return Response.json({ error: "Data pengiriman tidak valid atau terlalu panjang." }, { status: error instanceof AssistantError ? error.status : 400 });
    }
  }
  const { id } = await context.params;
  const response = await supabaseAdminFetch(`/rest/v1/business_quotations?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!response.ok) return Response.json({ error: "Quotation belum dapat dimuat." }, { status: 502 });
  const records = await response.json() as Quotation[];
  if (!records.length) return Response.json({ error: "Quotation tidak ditemukan." }, { status: 404 });
  const quotation = coerceQuotation(records[0]);
  if (!isQuotationMailbox(quotation.customer_email || "")) return Response.json({ error: "Isi satu alamat Email PIC yang valid, tanpa koma atau titik koma." }, { status: 400 });
  if (expectedTo !== undefined && expectedTo !== quotation.customer_email) return Response.json({ error: "Email PIC berubah. Tutup dialog dan muat ulang daftar sebelum mengirim." }, { status: 409 });
  if (["accepted", "rejected", "expired"].includes(quotation.status)) return Response.json({ error: `Quotation berstatus ${quotation.status} tidak dapat dikirim ulang.` }, { status: 409 });
  let cc: string[];
  try {
    cc = parseQuotationCc(ccInput, quotation.customer_email);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Alamat CC tidak valid." }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return Response.json({ error: "Konfigurasi SMTP Brevo belum lengkap." }, { status: 503 });

  let providerAccepted = false;
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
      ...(cc.length ? { cc: cc.map((address) => ({ name: "", address })) } : {}),
      replyTo: companyContact.email,
      subject: quotationEmailSubject(quotation),
      html: quotationEmailHtml(quotation),
      text: quotationEmailText(quotation),
      headers: { "X-Mailin-Custom": `quotation_id=${quotation.id}`, "X-Mailin-Tag": "retech-quotation" },
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });
    providerAccepted = true;
    const accepted = new Set((result.accepted || []).map((entry: string) => entry.toLowerCase()));
    const primaryAccepted = accepted.has(quotation.customer_email.toLowerCase());
    const missingCopies = cc.filter((address) => !accepted.has(address.toLowerCase()));
    const now = new Date().toISOString();
    const messageId = String(result.messageId || "");
    const reason = primaryAccepted ? null : "Penerima utama ditolak oleh SMTP; sebagian tembusan mungkin sudah diterima provider.";
    const event = primaryAccepted ? "submitted" : "error";
    const update = await supabaseAdminFetch(`/rest/v1/business_quotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...(primaryAccepted ? { status: "sent", sent_at: quotation.sent_at || now } : {}), delivery_status: event, last_email_recipient: quotation.customer_email, brevo_message_id: messageId || null, email_attempts: Number(quotation.email_attempts || 0) + 1, last_email_at: now, last_email_event_at: now, bounce_reason: reason }) });
    if (!update.ok) throw new Error("Status pengiriman belum dapat disimpan.");
    await recordEvent(id, event, quotation.customer_email, messageId || null, reason);
    await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: companyContact.email, action: primaryAccepted ? "quotation_email_submitted" : "quotation_email_primary_rejected", resource: "quotations", record_id: id, details: { recipient: quotation.customer_email, message_id: messageId || null } }) });
    const updated = await update.json() as Quotation[];
    const message = primaryAccepted ? `Quotation diserahkan ke Brevo untuk ${quotation.customer_email}.` : reason;
    const warning = !primaryAccepted || missingCopies.length > 0;
    return Response.json({ ok: primaryAccepted, warning, record: updated[0], message: `${message}${missingCopies.length ? ` CC tidak diterima SMTP: ${missingCopies.join(", ")}.` : cc.length && primaryAccepted ? ` ${cc.length} alamat CC disertakan.` : ""}` });
  } catch (error) {
    if (providerAccepted) {
      console.error("Quotation email accepted but tracking could not be saved");
      return Response.json({ warning: true, message: "Email sudah diserahkan ke Brevo, tetapi riwayat belum tersimpan lengkap. Cek log Brevo sebelum mengirim ulang." });
    }
    console.error("Quotation email failed", error);
    const now = new Date().toISOString();
    await supabaseAdminFetch(`/rest/v1/business_quotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ delivery_status: "error", last_email_recipient: quotation.customer_email, last_email_at: now, last_email_event_at: now, bounce_reason: "Email belum dapat diserahkan ke provider." }) });
    await recordEvent(id, "error", quotation.customer_email, null, "Email belum dapat diserahkan ke provider.");
    return Response.json({ error: "Email quotation belum dapat dikirim. Periksa konfigurasi Brevo atau coba lagi." }, { status: 502 });
  }
}
