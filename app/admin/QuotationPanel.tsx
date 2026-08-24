"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatRupiah, quotationStatuses, quotationSubtotal, quotationTotal, type Quotation, type QuotationEmailEvent, type QuotationInput, type QuotationItem } from "@/lib/quotations";
import type { Customer, Product } from "@/lib/business-documents";

type QuotationResponse = { records?: Quotation[]; record?: Quotation; error?: string };

const statusLabels: Record<string, string> = { draft: "Draft", sent: "Sent", accepted: "Accepted", rejected: "Rejected", expired: "Expired" };
const deliveryLabels: Record<string, string> = { not_sent: "Belum dikirim", submitted: "Submitted ke Brevo", sent: "Sent", delivered: "Delivered", opened: "Opened", clicked: "Clicked", deferred: "Deferred", soft_bounce: "Soft bounce", hard_bounce: "Hard bounce", blocked: "Blocked", invalid: "Invalid email", spam: "Spam complaint", unsubscribed: "Unsubscribed", error: "Error" };

function localDateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

function isoDate(offsetDays = 0) {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().slice(0, 10);
}

function emptyItem(): QuotationItem {
  return { name: "", description: "", quantity: 1, unit: "paket", unitPrice: 0 };
}

function emptyQuotation(): QuotationInput {
  return {
    status: "draft", issue_date: isoDate(), valid_until: isoDate(14), customer_company: "", customer_name: "", customer_email: "", customer_phone: "", customer_address: "", subject: "",
    items: [emptyItem()], discount_amount: 0, timeline: "Dimulai setelah quotation disetujui dan pembayaran awal diterima.", payment_terms: "50% pembayaran awal, 30% setelah UAT, dan 20% sebelum handover produksi.",
    scope_included: ["Discovery dan konfirmasi ruang lingkup", "Implementasi sesuai item penawaran", "Testing, deployment, dan handover"],
    scope_excluded: ["Domain, hosting, lisensi pihak ketiga, dan biaya platform kecuali tertulis pada item penawaran", "Perubahan di luar ruang lingkup akan dibuatkan estimasi terpisah"],
    notes: "Quotation berlaku sampai tanggal yang tercantum. Pekerjaan dimulai setelah persetujuan tertulis dan pembayaran awal diterima. Jadwal dapat menyesuaikan kesiapan materi dan feedback customer.",
  };
}

function coerceQuotation(record: Quotation): Quotation {
  return { ...record, discount_amount: Number(record.discount_amount || 0), items: (record.items || []).map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) };
}

function TextField({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} /></label>;
}

function TextArea({ label, value, onChange, rows = 4, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return <label className="admin-field admin-field-wide"><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} /></label>;
}

function QuotationEditor({ quotation, customers, products, onClose, onSaved }: { quotation: Quotation | null; customers: Customer[]; products: Product[]; onClose: () => void; onSaved: () => void }) {
  const isNew = quotation == null;
  const [draft, setDraft] = useState<QuotationInput>(() => quotation ? coerceQuotation(quotation) : emptyQuotation());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const subtotal = useMemo(() => quotationSubtotal(draft), [draft]);
  const total = useMemo(() => quotationTotal(draft), [draft]);
  const set = <K extends keyof QuotationInput>(key: K, value: QuotationInput[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateItem = (index: number, key: keyof QuotationItem, value: string | number) => set("items", draft.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  function applyCustomer(id: string) { const customer = customers.find((record) => record.id === id); if (!customer) return; setDraft((current) => ({ ...current, customer_company: customer.company_name, customer_name: customer.contact_name, customer_email: customer.email || "", customer_phone: customer.phone || "", customer_address: customer.address || "" })); }
  function addProduct(id: string) { const product = products.find((record) => record.id === id); if (!product) return; set("items", [...draft.items, { name: product.name, description: product.description || "", quantity: 1, unit: product.unit, unitPrice: Number(product.unit_price) }]); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(isNew ? "/api/admin/business/quotations" : `/api/admin/business/quotations/${quotation.id}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json() as QuotationResponse & { ok?: boolean };
      if (!response.ok || !result.ok) throw new Error(result.error || "Quotation belum dapat disimpan.");
      onSaved();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Quotation belum dapat disimpan."); setSaving(false); }
  }

  return <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal admin-quotation-modal" role="dialog" aria-modal="true" aria-label={isNew ? "Buat quotation" : `Edit ${quotation.quote_number}`}>
    <header><div><span className="admin-kicker">BUSINESS / QUOTATION / {isNew ? "CREATE" : "UPDATE"}</span><h2>{isNew ? "Buat quotation profesional" : quotation.quote_number}</h2></div><button type="button" onClick={onClose} aria-label="Tutup editor">×</button></header>
    <form onSubmit={save}>
      <section className="admin-quote-form-section"><div className="admin-editor-section-title"><div><h3>Dokumen</h3><p>Nomor quotation dibuat otomatis ketika dokumen pertama kali disimpan.</p></div><span className="admin-non-pkp-badge">NON-PKP / TANPA PPN</span></div><div className="admin-form-grid admin-form-grid-3"><label className="admin-field"><span>Status</span><select value={draft.status} onChange={(event) => set("status", event.target.value as QuotationInput["status"])}>{quotationStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label><TextField label="Tanggal quotation" type="date" value={draft.issue_date} onChange={(value) => set("issue_date", value)} required /><TextField label="Berlaku hingga" type="date" value={draft.valid_until} onChange={(value) => set("valid_until", value)} required /></div><TextField label="Perihal / nama project" value={draft.subject} onChange={(value) => set("subject", value)} placeholder="Contoh: Pengembangan Website Company Profile" required /></section>

      <section className="admin-quote-form-section"><div className="admin-editor-section-title"><div><h3>Customer</h3><p>Data disalin dari master sebagai snapshot agar PDF lama tidak ikut berubah.</p></div></div>{customers.length > 0 && <label className="admin-field admin-field-wide"><span>Ambil dari customer master</span><select defaultValue="" onChange={(event) => { applyCustomer(event.target.value); event.currentTarget.value = ""; }}><option value="">Pilih customer untuk mengisi data</option>{customers.filter((customer) => customer.is_active).map((customer) => <option value={customer.id} key={customer.id}>{customer.company_name} - {customer.contact_name}</option>)}</select></label>}<div className="admin-form-grid"><TextField label="Nama perusahaan" value={draft.customer_company} onChange={(value) => set("customer_company", value)} required /><TextField label="Nama PIC" value={draft.customer_name} onChange={(value) => set("customer_name", value)} required /><TextField label="Email PIC" type="email" value={draft.customer_email} onChange={(value) => set("customer_email", value)} /><TextField label="Telepon / WhatsApp" value={draft.customer_phone} onChange={(value) => set("customer_phone", value)} /></div><TextArea label="Alamat customer" value={draft.customer_address} onChange={(value) => set("customer_address", value)} rows={3} /></section>

      <section className="admin-quote-form-section"><div className="admin-editor-section-title"><div><h3>Item penawaran</h3><p>Gunakan satu item untuk setiap layanan atau milestone agar scope dan harga mudah dipahami.</p></div><div className="admin-inline-actions">{products.length > 0 && <select defaultValue="" onChange={(event) => { addProduct(event.target.value); event.currentTarget.value = ""; }}><option value="">+ Dari price book</option>{products.filter((product) => product.is_active).map((product) => <option value={product.id} key={product.id}>{product.code} - {product.name}</option>)}</select>}<button className="admin-button-quiet" type="button" onClick={() => set("items", [...draft.items, emptyItem()])}>+ Item manual</button></div></div><div className="admin-quotation-items">{draft.items.map((item, index) => <article key={index}><div className="admin-quotation-item-number">{String(index + 1).padStart(2, "0")}</div><div className="admin-quotation-item-fields"><TextField label="Nama layanan" value={item.name} onChange={(value) => updateItem(index, "name", value)} required /><TextArea label="Deskripsi / deliverables" value={item.description} onChange={(value) => updateItem(index, "description", value)} rows={3} /><div className="admin-form-grid admin-form-grid-3"><TextField label="Qty" type="number" value={item.quantity} onChange={(value) => updateItem(index, "quantity", Number(value))} required /><TextField label="Satuan" value={item.unit} onChange={(value) => updateItem(index, "unit", value)} required /><TextField label="Harga satuan" type="number" value={item.unitPrice} onChange={(value) => updateItem(index, "unitPrice", Number(value))} required /></div></div><div className="admin-quotation-item-total"><span>Jumlah</span><strong>{formatRupiah(item.quantity * item.unitPrice)}</strong>{draft.items.length > 1 && <button type="button" className="danger" onClick={() => set("items", draft.items.filter((_, itemIndex) => itemIndex !== index))}>Hapus</button>}</div></article>)}</div><div className="admin-quotation-totals"><div><span>Subtotal</span><strong>{formatRupiah(subtotal)}</strong></div><label><span>Diskon</span><input type="number" min="0" max={subtotal} value={draft.discount_amount} onChange={(event) => set("discount_amount", Number(event.target.value))} /></label><div className="grand"><span>Total penawaran</span><strong>{formatRupiah(total)}</strong></div><small>PPN tidak dikenakan karena RETECH saat ini Non-PKP.</small></div></section>

      <section className="admin-quote-form-section"><div className="admin-language-columns"><div><h3>Scope termasuk</h3><TextArea label="Satu poin per baris" value={draft.scope_included.join("\n")} onChange={(value) => set("scope_included", value.split("\n").map((entry) => entry.trim()).filter(Boolean))} rows={7} /></div><div><h3>Tidak termasuk</h3><TextArea label="Satu poin per baris" value={draft.scope_excluded.join("\n")} onChange={(value) => set("scope_excluded", value.split("\n").map((entry) => entry.trim()).filter(Boolean))} rows={7} /></div></div></section>
      <section className="admin-quote-form-section"><div className="admin-form-grid"><TextArea label="Estimasi pelaksanaan" value={draft.timeline} onChange={(value) => set("timeline", value)} /><TextArea label="Syarat pembayaran" value={draft.payment_terms} onChange={(value) => set("payment_terms", value)} /></div><TextArea label="Catatan dan ketentuan" value={draft.notes} onChange={(value) => set("notes", value)} rows={6} /></section>
      {error && <p className="admin-form-message" role="alert">{error}</p>}
      <footer><button type="button" className="admin-button-quiet" onClick={onClose}>Batal</button><button className="admin-save-button" disabled={saving}>{saving ? "Menyimpan…" : isNew ? "Buat quotation" : "Simpan perubahan"}</button></footer>
    </form>
  </section></div>;
}

export function QuotationPanel() {
  const [records, setRecords] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Quotation | null | undefined>(undefined);
  const [sendingId, setSendingId] = useState("");
  const [notice, setNotice] = useState("");
  const [historyRecord, setHistoryRecord] = useState<Quotation | null>(null);
  const [events, setEvents] = useState<QuotationEmailEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { let cancelled = false; Promise.all([fetch("/api/admin/business/quotations"),fetch("/api/admin/business/customers"),fetch("/api/admin/business/products")]).then(async ([quoteResponse,customerResponse,productResponse]) => { const [quoteResult,customerResult,productResult] = await Promise.all([quoteResponse.json(),customerResponse.json(),productResponse.json()]); if (!quoteResponse.ok) throw new Error(quoteResult.error || "Data quotation gagal dimuat."); if (!customerResponse.ok || !productResponse.ok) throw new Error("Master customer/product belum dapat dimuat."); if (!cancelled) { setRecords((quoteResult.records || []).map(coerceQuotation)); setCustomers(customerResult.records||[]); setProducts((productResult.records||[]).map((product:Product)=>({...product,unit_price:Number(product.unit_price)}))); } }).catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Data quotation gagal dimuat."); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [refreshKey]);

  const stats = useMemo(() => ({ draft: records.filter((record) => record.status === "draft").length, sent: records.filter((record) => record.status === "sent").length, accepted: records.filter((record) => record.status === "accepted").length }), [records]);
  function refresh() { setEditing(undefined); setLoading(true); setError(""); setRefreshKey((value) => value + 1); }
  async function remove(record: Quotation) { if (!window.confirm(`Hapus ${record.quote_number}? Dokumen dan audit penghapusan akan dicatat.`)) return; const response = await fetch(`/api/admin/business/quotations/${record.id}`, { method: "DELETE" }); const result = await response.json() as { error?: string }; if (!response.ok) { setError(result.error || "Quotation belum dapat dihapus."); return; } refresh(); }
  async function sendEmail(record: Quotation) {
    if (!record.customer_email) { setError("Isi email PIC customer sebelum mengirim quotation."); return; }
    const action = Number(record.email_attempts || 0) > 0 ? "Kirim ulang" : "Kirim";
    if (!window.confirm(`${action} ${record.quote_number} ke ${record.customer_email}? Email akan dikirim dari sales@retech.id dengan PDF terlampir.`)) return;
    setSendingId(record.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/business/quotations/${record.id}/send`, { method: "POST" });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "Email quotation belum dapat dikirim.");
      setNotice(result.message || "Quotation berhasil diserahkan ke Brevo."); refresh();
    } catch (sendError) { setError(sendError instanceof Error ? sendError.message : "Email quotation belum dapat dikirim."); }
    finally { setSendingId(""); }
  }
  async function openHistory(record: Quotation) {
    setHistoryRecord(record); setEvents([]); setHistoryLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/business/quotations/${record.id}/email-events`);
      const result = await response.json() as { records?: QuotationEmailEvent[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Riwayat email belum dapat dimuat.");
      setEvents(result.records || []);
    } catch (historyError) { setError(historyError instanceof Error ? historyError.message : "Riwayat email belum dapat dimuat."); }
    finally { setHistoryLoading(false); }
  }

  return <div className="admin-content admin-quotation-content">
    <section className="admin-stats admin-mail-stats"><article><span>Total quotation</span><strong>{records.length}</strong></article><article><span>Draft</span><strong>{stats.draft}</strong></article><article><span>Sent</span><strong>{stats.sent}</strong></article><article><span>Accepted</span><strong>{stats.accepted}</strong></article></section>
    <div className="admin-list-header"><div><h2>Quotation</h2><p>Buat penawaran tanpa PPN, preview PDF, lalu kirim email profesional melalui Brevo.</p></div><button className="admin-primary-button" onClick={() => setEditing(null)}>+ Buat quotation</button></div>
    <div className="admin-quotation-guidance"><div><strong>Professional document workflow</strong><p>Draft → review PDF → email HTML + lampiran PDF → tracking delivery → Accepted/Rejected.</p></div><span>NON-PKP</span></div>
    {error && <p className="admin-form-message" role="alert">{error}</p>}
    {notice && <p className="admin-form-message admin-form-success" role="status">{notice}</p>}
    {loading ? <div className="admin-loading">Memuat quotation…</div> : records.length === 0 ? <div className="admin-empty-state"><strong>Belum ada quotation</strong><p>Buat quotation pertama untuk melihat preview template PDF RETECH.</p><button className="admin-primary-button" onClick={() => setEditing(null)}>Buat quotation pertama</button></div> : <div className="admin-quotation-list">{records.map((record) => <article key={record.id}><div className="admin-quotation-number"><span>{record.status}</span><strong>{record.quote_number}</strong><small>{record.issue_date} - valid {record.valid_until}</small></div><div><h3>{record.customer_company}</h3><p>{record.subject}</p><small>Attn. {record.customer_name}</small><span className={`admin-delivery-status status-${record.delivery_status || "not_sent"}`}>{deliveryLabels[record.delivery_status || "not_sent"]}</span>{record.last_email_at && <small>Terakhir: {localDateTime(record.last_email_at)} · {record.last_email_recipient}</small>}{record.bounce_reason && <small className="admin-delivery-reason">{record.bounce_reason}</small>}</div><div className="admin-quotation-value"><span>Total</span><strong>{formatRupiah(quotationTotal(record))}</strong><small>{record.items.length} item</small></div><div className="admin-record-actions admin-quotation-actions"><a href={`/api/admin/business/quotations/${record.id}/pdf`} target="_blank" rel="noreferrer">Preview</a><a href={`/api/admin/business/quotations/${record.id}/pdf?download=1`}>Download</a><button disabled={!record.customer_email || sendingId === record.id || ["accepted", "rejected", "expired"].includes(record.status)} onClick={() => void sendEmail(record)}>{sendingId === record.id ? "Mengirim…" : Number(record.email_attempts || 0) > 0 ? "Kirim ulang" : "Kirim email"}</button><button onClick={() => void openHistory(record)}>Riwayat</button><button onClick={() => setEditing(record)}>Edit</button><button className="danger" onClick={() => void remove(record)}>Hapus</button></div></article>)}</div>}
    {editing !== undefined && <QuotationEditor quotation={editing} customers={customers} products={products} onClose={() => setEditing(undefined)} onSaved={refresh} />}
    {historyRecord && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal admin-email-history-modal" role="dialog" aria-modal="true" aria-label={`Riwayat email ${historyRecord.quote_number}`}><header><div><span className="admin-kicker">BUSINESS / QUOTATION / DELIVERY</span><h2>Riwayat email</h2><p>{historyRecord.quote_number} · {historyRecord.customer_email || "Email belum diisi"}</p></div><button type="button" onClick={() => setHistoryRecord(null)} aria-label="Tutup riwayat">×</button></header><div className="admin-email-history-body">{historyLoading ? <div className="admin-loading">Memuat riwayat…</div> : events.length === 0 ? <div className="admin-empty-state"><strong>Belum ada pengiriman</strong><p>Riwayat akan muncul setelah quotation dikirim melalui Brevo.</p></div> : <div className="admin-email-event-list">{events.map((event) => <article key={event.id}><span className={`admin-delivery-status status-${event.event}`}>{deliveryLabels[event.event] || event.event}</span><div><strong>{event.recipient}</strong><small>{localDateTime(event.event_at)}</small>{event.reason && <p>{event.reason}</p>}</div></article>)}</div>}</div></section></div>}
  </div>;
}
