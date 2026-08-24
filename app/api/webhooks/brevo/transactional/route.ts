import { timingSafeEqual } from "node:crypto";
import { quotationDeliveryStatuses, type Quotation, type QuotationDeliveryStatus } from "@/lib/quotations";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const eventMap: Record<string, QuotationDeliveryStatus> = {
  request: "sent", sent: "sent", delivered: "delivered", opened: "opened", unique_opened: "opened", click: "clicked", clicked: "clicked",
  deferred: "deferred", soft_bounce: "soft_bounce", hard_bounce: "hard_bounce", blocked: "blocked", invalid: "invalid", spam: "spam", unsubscribed: "unsubscribed", error: "error",
};

function authorized(request: Request) {
  const expected = process.env.BREVO_WEBHOOK_SECRET || "";
  const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!expected || expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

function quotationId(payload: Record<string, unknown>) {
  const custom = String(payload["X-Mailin-custom"] || payload["X-Mailin-Custom"] || payload["x-mailin-custom"] || "");
  return custom.match(/quotation_id=([0-9a-f-]{36})/i)?.[1] || "";
}

function invoiceId(payload: Record<string, unknown>) {
  const custom = String(payload["X-Mailin-custom"] || payload["X-Mailin-Custom"] || payload["x-mailin-custom"] || "");
  return custom.match(/invoice_id=([0-9a-f-]{36})/i)?.[1] || "";
}

function eventTime(payload: Record<string, unknown>) {
  const epochMs = Number(payload.ts_epoch || 0);
  const epochSeconds = Number(payload.ts_event || payload.ts || 0);
  const value = epochMs > 1_000_000_000_000 ? epochMs : epochSeconds > 0 ? epochSeconds * 1000 : Date.now();
  return new Date(value).toISOString();
}

async function processEvent(payload: Record<string, unknown>) {
  const invoice = invoiceId(payload);
  const mapped = eventMap[String(payload.event || "").toLowerCase()];
  if (invoice && mapped && quotationDeliveryStatuses.includes(mapped)) {
    const invoiceResponse = await supabaseAdminFetch(`/rest/v1/business_invoices?select=id,last_email_recipient,last_email_event_at&id=eq.${encodeURIComponent(invoice)}&limit=1`);
    if (!invoiceResponse.ok) return false;
    const invoices = await invoiceResponse.json() as Array<{id:string;last_email_recipient?:string;last_email_event_at?:string}>;
    if (!invoices.length) return false;
    const recipient = String(payload.email || invoices[0].last_email_recipient || "").trim().toLowerCase();
    if (!recipient || (invoices[0].last_email_recipient && recipient !== invoices[0].last_email_recipient.toLowerCase())) return false;
    const providerMessageId = String(payload["message-id"] || payload.messageId || "") || null;
    const reason = String(payload.reason || payload.description || "") || null;
    const occurredAt = eventTime(payload);
    await supabaseAdminFetch("/rest/v1/business_invoice_email_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ invoice_id: invoice, event: mapped, recipient, provider_message_id: providerMessageId, reason, event_at: occurredAt, payload }) });
    if (!invoices[0].last_email_event_at || occurredAt >= invoices[0].last_email_event_at) {
      const update: Record<string, unknown> = { delivery_status: mapped, last_email_event_at: occurredAt, bounce_reason: ["soft_bounce", "hard_bounce", "blocked", "invalid", "error", "spam"].includes(mapped) ? reason || mapped : null };
      if (mapped === "delivered") update.delivered_at = occurredAt;
      await supabaseAdminFetch(`/rest/v1/business_invoices?id=eq.${encodeURIComponent(invoice)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(update) });
    }
    return true;
  }
  const id = quotationId(payload);
  if (!id || !mapped || !quotationDeliveryStatuses.includes(mapped)) return false;
  const quoteResponse = await supabaseAdminFetch(`/rest/v1/business_quotations?select=id,last_email_recipient,last_email_event_at&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!quoteResponse.ok) return false;
  const quotes = await quoteResponse.json() as Pick<Quotation, "id" | "last_email_recipient" | "last_email_event_at">[];
  if (!quotes.length) return false;
  const recipient = String(payload.email || quotes[0].last_email_recipient || "").trim().toLowerCase();
  if (!recipient || (quotes[0].last_email_recipient && recipient !== quotes[0].last_email_recipient.toLowerCase())) return false;
  const providerMessageId = String(payload["message-id"] || payload.messageId || "") || null;
  const reason = String(payload.reason || payload.description || "") || null;
  const occurredAt = eventTime(payload);
  await supabaseAdminFetch("/rest/v1/business_quotation_email_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ quotation_id: id, event: mapped, recipient, provider_message_id: providerMessageId, reason, event_at: occurredAt, payload }) });
  if (!quotes[0].last_email_event_at || occurredAt >= quotes[0].last_email_event_at) {
    const update: Record<string, unknown> = { delivery_status: mapped, last_email_event_at: occurredAt, bounce_reason: ["soft_bounce", "hard_bounce", "blocked", "invalid", "error", "spam"].includes(mapped) ? reason || mapped : null };
    if (mapped === "delivered") update.delivered_at = occurredAt;
    await supabaseAdminFetch(`/rest/v1/business_quotations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(update) });
  }
  return true;
}

export async function POST(request: Request) {
  if (!process.env.BREVO_WEBHOOK_SECRET) return Response.json({ error: "Webhook not configured" }, { status: 503 });
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 262_144) return Response.json({ error: "Payload too large" }, { status: 413 });
  try {
    const payload = await request.json() as Record<string, unknown> | Record<string, unknown>[];
    const events = Array.isArray(payload) ? payload : [payload];
    let processed = 0;
    for (const event of events.slice(0, 100)) if (await processEvent(event)) processed += 1;
    return Response.json({ ok: true, processed });
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
}
