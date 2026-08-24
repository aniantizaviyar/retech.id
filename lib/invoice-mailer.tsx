import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import { companyContact } from "./company";
import { invoiceEmailHtml, invoiceEmailSubject, invoiceEmailText } from "./invoice-email";
import { InvoicePdf } from "./invoice-pdf";
import type { Invoice } from "./business-documents";
import { supabaseAdminFetch } from "./supabase-admin";

export async function recordInvoiceEmailEvent(invoiceId: string, event: string, recipient: string, messageId: string | null, reason: string | null, payload: Record<string, unknown> = {}) { await supabaseAdminFetch("/rest/v1/business_invoice_email_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ invoice_id: invoiceId, event, recipient, provider_message_id: messageId, reason, payload }) }); }

export async function sendInvoiceEmail(invoice: Invoice, reminder = false) {
  const host = process.env.SMTP_HOST; const port = Number(process.env.SMTP_PORT || "587"); const user = process.env.SMTP_USER; const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) throw new Error("Konfigurasi SMTP Brevo belum lengkap.");
  if (!invoice.customer_email) throw new Error("Email PIC customer belum diisi.");
  const [logo, signature, stamp] = await Promise.all([readFile(path.join(process.cwd(), "public", "retech-logo-transparent.png")), readFile(path.join(process.cwd(), "public", "documents", "retech-signature.png")), readFile(path.join(process.cwd(), "public", "documents", "retech-stamp-transparent.png"))]);
  const pdf = await renderToBuffer(<InvoicePdf invoice={invoice} logoSrc={`data:image/png;base64,${logo.toString("base64")}`} signatureSrc={`data:image/png;base64,${signature.toString("base64")}`} stampSrc={`data:image/png;base64,${stamp.toString("base64")}`} />);
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth: { user, pass } });
  const filename = `RETECH-Invoice-${invoice.invoice_number.replace(/[^A-Za-z0-9_-]+/g, "-")}.pdf`;
  const result = await transporter.sendMail({ from: { name: "RETECH Billing", address: companyContact.billingEmail }, to: { name: invoice.customer_name, address: invoice.customer_email }, replyTo: companyContact.billingEmail, subject: invoiceEmailSubject(invoice, reminder), html: invoiceEmailHtml(invoice, reminder), text: invoiceEmailText(invoice, reminder), headers: { "X-Mailin-Custom": `invoice_id=${invoice.id}`, "X-Mailin-Tag": reminder ? "retech-invoice-reminder" : "retech-invoice" }, attachments: [{ filename, content: pdf, contentType: "application/pdf" }] });
  return String(result.messageId || "");
}
