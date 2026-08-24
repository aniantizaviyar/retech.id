import type { QuotationItem } from "./quotations";

export const invoiceStatuses = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = typeof invoiceStatuses[number];

export const paymentStatuses = ["pending", "confirmed", "refunded"] as const;
export type PaymentStatus = typeof paymentStatuses[number];

export type PaymentAccountSnapshot = {
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  currency: string;
  instructions: string;
};

export type PaymentAccount = PaymentAccountSnapshot & {
  id: string;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PaymentAccountInput = Omit<PaymentAccount, "id" | "created_at" | "updated_at">;

export type Invoice = {
  id: string;
  invoice_number: string;
  quotation_id: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  customer_company: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  subject: string;
  items: QuotationItem[];
  discount_amount: number;
  payment_account_id: string | null;
  payment_account_snapshot: PaymentAccountSnapshot;
  payment_terms: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type InvoiceInput = Omit<Invoice, "id" | "invoice_number" | "payment_account_snapshot" | "created_at" | "updated_at">;

export type Payment = {
  id: string;
  invoice_id: string;
  payment_account_id: string;
  payment_date: string;
  amount: number;
  method: string;
  reference_number: string;
  status: PaymentStatus;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type PaymentInput = Omit<Payment, "id" | "created_at" | "updated_at">;

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

function uuid(value: unknown, field: string, required = false) {
  const result = String(value ?? "").trim();
  if (!result && !required) return "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result)) throw new Error(`${field} tidak valid.`);
  return result;
}

function normalizeItems(value: unknown) {
  const rawItems = Array.isArray(value) ? value : [];
  if (!rawItems.length || rawItems.length > 30) throw new Error("Invoice harus memiliki 1 sampai 30 item.");
  return rawItems.map((entry, index) => {
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
}

export function normalizePaymentAccountInput(value: unknown): PaymentAccountInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    label: text(input.label, "Label rekening", 80, true),
    bank_name: text(input.bank_name, "Nama bank", 100, true),
    account_name: text(input.account_name, "Nama rekening", 160, true),
    account_number: text(input.account_number, "Nomor rekening", 60, true),
    branch: text(input.branch, "Cabang bank", 120),
    currency: text(input.currency || "IDR", "Mata uang", 10, true).toUpperCase(),
    instructions: text(input.instructions, "Instruksi pembayaran", 500),
    is_active: input.is_active !== false,
    is_default: input.is_default === true,
  };
}

export function normalizeInvoiceInput(value: unknown): InvoiceInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const issueDate = date(input.issue_date, "Tanggal invoice");
  const dueDate = date(input.due_date, "Tanggal jatuh tempo");
  if (dueDate < issueDate) throw new Error("Tanggal jatuh tempo tidak boleh lebih awal dari tanggal invoice.");
  const items = normalizeItems(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = money(input.discount_amount ?? 0, "Diskon");
  if (discount > subtotal) throw new Error("Diskon tidak boleh melebihi subtotal.");
  const status = String(input.status || "draft") as InvoiceStatus;
  if (!invoiceStatuses.includes(status)) throw new Error("Status invoice tidak valid.");
  const email = text(input.customer_email, "Email customer", 180);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email customer tidak valid.");
  return {
    quotation_id: uuid(input.quotation_id, "Quotation referensi") || null,
    status,
    issue_date: issueDate,
    due_date: dueDate,
    customer_company: text(input.customer_company, "Nama perusahaan customer", 180, true),
    customer_name: text(input.customer_name, "Nama PIC", 140, true),
    customer_email: email,
    customer_phone: text(input.customer_phone, "Telepon customer", 40),
    customer_address: text(input.customer_address, "Alamat customer", 500),
    subject: text(input.subject, "Perihal", 220, true),
    items,
    discount_amount: discount,
    payment_account_id: uuid(input.payment_account_id, "Rekening pembayaran", true),
    payment_terms: text(input.payment_terms, "Syarat pembayaran", 1000),
    notes: text(input.notes, "Catatan", 1200),
  };
}

export function normalizePaymentInput(value: unknown): PaymentInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const status = String(input.status || "confirmed") as PaymentStatus;
  if (!paymentStatuses.includes(status)) throw new Error("Status pembayaran tidak valid.");
  return {
    invoice_id: uuid(input.invoice_id, "Invoice", true),
    payment_account_id: uuid(input.payment_account_id, "Rekening penerima", true),
    payment_date: date(input.payment_date, "Tanggal pembayaran"),
    amount: money(input.amount, "Nominal pembayaran"),
    method: text(input.method || "Bank Transfer", "Metode pembayaran", 80, true),
    reference_number: text(input.reference_number, "Nomor referensi", 120),
    status,
    notes: text(input.notes, "Catatan pembayaran", 500),
  };
}

export function invoiceSubtotal(invoice: Pick<Invoice, "items">) {
  return invoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
}

export function invoiceTotal(invoice: Pick<Invoice, "items" | "discount_amount">) {
  return Math.max(0, invoiceSubtotal(invoice) - Number(invoice.discount_amount || 0));
}

export function accountSnapshot(account: PaymentAccount): PaymentAccountSnapshot {
  return {
    label: account.label,
    bank_name: account.bank_name,
    account_name: account.account_name,
    account_number: account.account_number,
    branch: account.branch || "",
    currency: account.currency || "IDR",
    instructions: account.instructions || "",
  };
}
