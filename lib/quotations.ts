export const quotationStatuses = ["draft", "sent", "accepted", "rejected", "expired"] as const;
export type QuotationStatus = typeof quotationStatuses[number];

export const quotationDeliveryStatuses = ["not_sent", "submitted", "sent", "delivered", "opened", "clicked", "deferred", "soft_bounce", "hard_bounce", "blocked", "invalid", "spam", "unsubscribed", "error"] as const;
export type QuotationDeliveryStatus = typeof quotationDeliveryStatuses[number];

export type QuotationItem = {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type Quotation = {
  id: string;
  quote_number: string;
  status: QuotationStatus;
  issue_date: string;
  valid_until: string;
  customer_company: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  subject: string;
  items: QuotationItem[];
  discount_amount: number;
  timeline: string;
  payment_terms: string;
  scope_included: string[];
  scope_excluded: string[];
  notes: string;
  delivery_status?: QuotationDeliveryStatus;
  last_email_recipient?: string | null;
  brevo_message_id?: string | null;
  email_attempts?: number;
  sent_at?: string | null;
  delivered_at?: string | null;
  last_email_at?: string | null;
  last_email_event_at?: string | null;
  bounce_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type QuotationInput = Omit<Quotation, "id" | "quote_number" | "delivery_status" | "last_email_recipient" | "brevo_message_id" | "email_attempts" | "sent_at" | "delivered_at" | "last_email_at" | "last_email_event_at" | "bounce_reason" | "created_at" | "updated_at">;

export type QuotationEmailEvent = {
  id: string;
  quotation_id: string;
  event: QuotationDeliveryStatus;
  recipient: string;
  provider_message_id?: string | null;
  reason?: string | null;
  event_at: string;
  created_at?: string;
};

function text(value: unknown, field: string, max: number, required = false) {
  const result = String(value ?? "").trim().replace(/\r\n/g, "\n");
  if (required && !result) throw new Error(`${field} wajib diisi.`);
  if (result.length > max) throw new Error(`${field} maksimal ${max} karakter.`);
  return result;
}

function date(value: unknown, field: string) {
  const result = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(`${result}T00:00:00Z`))) throw new Error(`${field} tidak valid.`);
  return result;
}

function money(value: unknown, field: string) {
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0 || result > 999_999_999_999) throw new Error(`${field} tidak valid.`);
  return Math.round(result);
}

function lines(value: unknown, field: string) {
  if (!Array.isArray(value)) return [];
  if (value.length > 30) throw new Error(`${field} maksimal 30 baris.`);
  return value.map((entry) => text(entry, field, 300)).filter(Boolean);
}

export function normalizeQuotationInput(value: unknown): QuotationInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const issueDate = date(input.issue_date, "Tanggal quotation");
  const validUntil = date(input.valid_until, "Masa berlaku");
  if (validUntil < issueDate) throw new Error("Masa berlaku tidak boleh lebih awal dari tanggal quotation.");
  const rawItems = Array.isArray(input.items) ? input.items : [];
  if (!rawItems.length || rawItems.length > 30) throw new Error("Quotation harus memiliki 1 sampai 30 item.");
  const items = rawItems.map((entry, index) => {
    const item = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100_000) throw new Error(`Kuantitas item ${index + 1} tidak valid.`);
    return {
      name: text(item.name, `Nama item ${index + 1}`, 140, true),
      description: text(item.description, `Deskripsi item ${index + 1}`, 700),
      quantity,
      unit: text(item.unit, `Satuan item ${index + 1}`, 30, true),
      unitPrice: money(item.unitPrice, `Harga item ${index + 1}`),
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = money(input.discount_amount ?? 0, "Diskon");
  if (discount > subtotal) throw new Error("Diskon tidak boleh melebihi subtotal.");
  const status = String(input.status || "draft") as QuotationStatus;
  if (!quotationStatuses.includes(status)) throw new Error("Status quotation tidak valid.");
  const email = text(input.customer_email, "Email customer", 180);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email customer tidak valid.");
  return {
    status,
    issue_date: issueDate,
    valid_until: validUntil,
    customer_company: text(input.customer_company, "Nama perusahaan customer", 180, true),
    customer_name: text(input.customer_name, "Nama PIC", 140, true),
    customer_email: email,
    customer_phone: text(input.customer_phone, "Telepon customer", 40),
    customer_address: text(input.customer_address, "Alamat customer", 500),
    subject: text(input.subject, "Perihal", 220, true),
    items,
    discount_amount: discount,
    timeline: text(input.timeline, "Timeline", 500),
    payment_terms: text(input.payment_terms, "Syarat pembayaran", 1000),
    scope_included: lines(input.scope_included, "Scope termasuk"),
    scope_excluded: lines(input.scope_excluded, "Scope tidak termasuk"),
    notes: text(input.notes, "Catatan", 1200),
  };
}

export function quotationSubtotal(quotation: Pick<Quotation, "items">) {
  return quotation.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
}

export function quotationTotal(quotation: Pick<Quotation, "items" | "discount_amount">) {
  return Math.max(0, quotationSubtotal(quotation) - Number(quotation.discount_amount || 0));
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}
