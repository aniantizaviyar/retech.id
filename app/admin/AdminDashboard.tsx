"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { CmsResource } from "@/lib/cms-validation";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { MailUsersPanel } from "./MailUsersPanel";
import { QuotationPanel } from "./QuotationPanel";

type CmsRecord = Record<string, unknown> & { id?: string | number; slug?: string; published?: boolean; sort_order?: number };
type MediaRecord = { name: string; url: string; created_at?: string; metadata?: { size?: number; mimetype?: string } };
type WebsiteTab = CmsResource | "media";
type BusinessTab = "business-dashboard" | "business-leads" | "business-customers" | "business-contacts" | "business-pipeline" | "business-quotations" | "business-invoices" | "business-payments" | "business-products" | "business-templates";
type MailTab = "mail-users" | "mail-delivery";
type Tab = WebsiteTab | BusinessTab | MailTab;

const websiteTabs: Array<{ id: WebsiteTab; label: string; icon: string }> = [
  { id: "pages", label: "Pages", icon: "▤" }, { id: "projects", label: "Case Studies", icon: "◫" },
  { id: "services", label: "Services", icon: "◇" }, { id: "faqs", label: "FAQ", icon: "?" },
  { id: "pricing", label: "Pricing", icon: "₿" }, { id: "media", label: "Media", icon: "▧" },
];
const businessTabs: Array<{ id: BusinessTab; label: string; icon: string }> = [
  { id: "business-dashboard", label: "Dashboard", icon: "▦" }, { id: "business-leads", label: "Leads", icon: "◎" },
  { id: "business-customers", label: "Customer", icon: "◉" }, { id: "business-contacts", label: "Contacts", icon: "⊙" },
  { id: "business-pipeline", label: "Pipeline", icon: "⋮" }, { id: "business-quotations", label: "Quotations", icon: "Q" },
  { id: "business-invoices", label: "Invoices", icon: "I" }, { id: "business-payments", label: "Payments", icon: "$" },
  { id: "business-products", label: "Products & Services", icon: "◇" }, { id: "business-templates", label: "PDF Templates", icon: "▧" },
];
const mailTabs: Array<{ id: MailTab; label: string; icon: string }> = [{ id: "mail-users", label: "User", icon: "@" }, { id: "mail-delivery", label: "Delivery & Bounce", icon: "↯" }];
const allTabs = [...websiteTabs, ...businessTabs, ...mailTabs];

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
function lines(value: unknown) { return Array.isArray(value) ? value.join("\n") : ""; }
function lineArray(value: FormDataEntryValue | null) { return String(value || "").split("\n").map((item) => item.trim()).filter(Boolean); }
function jsonText(value: unknown) { return JSON.stringify(value || {}, null, 2); }
function labelFor(record: CmsRecord, resource: CmsResource) {
  if (resource === "pages") return String(record.label || record.slug || "Page");
  if (resource === "faqs") return String(record.question_id || "FAQ baru");
  if (resource === "projects") return String(record.title || record.slug || "Case study baru");
  const data = record.data_id as Record<string, unknown> | undefined;
  return String(data?.title || data?.name || record.slug || "Item baru");
}

function emptyRecord(resource: CmsResource): CmsRecord {
  if (resource === "pages") return { slug: "", label: "", data_id: {}, data_en: {}, published: true };
  if (resource === "services") return { slug: "", data_id: { eyebrow: "BUILD", title: "", shortTitle: "", summary: "", description: "", includes: [], outcomes: [], process: [], bestFor: [], relatedWork: [] }, data_en: { eyebrow: "BUILD", title: "", shortTitle: "", summary: "", description: "", includes: [], outcomes: [], process: [], bestFor: [], relatedWork: [] }, published: true, sort_order: 99 };
  if (resource === "faqs") return { question_id: "", answer_id: "", question_en: "", answer_en: "", published: true, sort_order: 99 };
  if (resource === "pricing") return { slug: "", section: "development", data_id: { eyebrow: "", name: "", price: "", description: "", features: [] }, data_en: { eyebrow: "", name: "", price: "", description: "", features: [] }, published: true, sort_order: 99 };
  return { slug: "", title: "", title_en: "", category: "Digital Product", category_en: "Digital Product", status: "live", summary: "", summary_en: "", challenge: "", challenge_en: "", solution: "", solution_en: "", outcome: "", outcome_en: "", services: [], services_en: [], gallery: [], featured: false, published: true, sort_order: 99 };
}

function Field({ label, name, defaultValue, required = false, type = "text" }: { label: string; name: string; defaultValue?: unknown; required?: boolean; type?: string }) {
  return <label className="admin-field"><span>{label}</span><input name={name} type={type} defaultValue={String(defaultValue ?? "")} required={required} /></label>;
}
function Area({ label, name, defaultValue, rows = 4 }: { label: string; name: string; defaultValue?: unknown; rows?: number }) {
  return <label className="admin-field admin-field-wide"><span>{label}</span><textarea name={name} defaultValue={String(defaultValue ?? "")} rows={rows} /></label>;
}

function RecordEditor({ resource, record, onClose, onSaved }: { resource: CmsResource; record: CmsRecord; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(() => clone(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isNew = draft.id == null;
  const gallery = Array.isArray(draft.gallery) ? draft.gallery as Array<{ src: string; alt: string; alt_en?: string }> : [];

  async function uploadGallery(file: File) {
    setError("");
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: form });
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) { setError(result.error || "Upload gagal."); return; }
    setDraft((current) => ({ ...current, gallery: [...(Array.isArray(current.gallery) ? current.gallery : []), { src: result.url, alt: "", alt_en: "" }] }));
  }

  function projectPayload(form: FormData) {
    return {
      slug: form.get("slug"), title: form.get("title"), title_en: form.get("title_en"), category: form.get("category"), category_en: form.get("category_en"), status: form.get("status"),
      summary: form.get("summary"), summary_en: form.get("summary_en"), challenge: form.get("challenge"), challenge_en: form.get("challenge_en"), solution: form.get("solution"), solution_en: form.get("solution_en"), outcome: form.get("outcome"), outcome_en: form.get("outcome_en"),
      services: lineArray(form.get("services")), services_en: lineArray(form.get("services_en")), gallery, featured: form.get("featured") === "on", published: form.get("published") === "on", sort_order: Number(form.get("sort_order")),
    };
  }

  function payload(form: FormData) {
    if (resource === "projects") return projectPayload(form);
    if (resource === "faqs") return { question_id: form.get("question_id"), answer_id: form.get("answer_id"), question_en: form.get("question_en"), answer_en: form.get("answer_en"), published: form.get("published") === "on", sort_order: Number(form.get("sort_order")) };
    const base: Record<string, unknown> = { slug: form.get("slug"), published: form.get("published") === "on" };
    if (resource === "pages") { base.label = form.get("label"); }
    else { base.sort_order = Number(form.get("sort_order")); }
    if (resource === "pricing") base.section = form.get("section");
    try { base.data_id = JSON.parse(String(form.get("data_id") || "{}")); base.data_en = JSON.parse(String(form.get("data_en") || "{}")); }
    catch { throw new Error("Format JSON tidak valid. Periksa tanda koma dan tanda kutip."); }
    return base;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const body = payload(new FormData(event.currentTarget));
      const url = isNew ? "/api/admin/cms" : `/api/admin/cms/${resource}/${draft.id}`;
      const response = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isNew ? { resource, record: body } : { record: body }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Data belum dapat disimpan.");
      onSaved();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Data belum dapat disimpan."); setSaving(false); }
  }

  return <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-label={`Editor ${resource}`}>
    <header><div><span className="admin-kicker">{isNew ? "CREATE" : "UPDATE"} / {resource.toUpperCase()}</span><h2>{isNew ? "Tambah data baru" : labelFor(draft, resource)}</h2></div><button type="button" onClick={onClose} aria-label="Tutup editor">×</button></header>
    <form onSubmit={save}>
      {resource === "projects" ? <>
        <div className="admin-form-grid"><Field label="Slug URL" name="slug" defaultValue={draft.slug} required /><Field label="Urutan" name="sort_order" type="number" defaultValue={draft.sort_order} /><Field label="Judul Indonesia" name="title" defaultValue={draft.title} required /><Field label="English title" name="title_en" defaultValue={draft.title_en} required /><Field label="Kategori Indonesia" name="category" defaultValue={draft.category} required /><Field label="English category" name="category_en" defaultValue={draft.category_en} required /><label className="admin-field"><span>Status</span><select name="status" defaultValue={String(draft.status || "live")}><option value="live">Live</option><option value="in-development">In development</option></select></label></div>
        <div className="admin-language-columns"><div><h3>Bahasa Indonesia</h3><Area label="Ringkasan" name="summary" defaultValue={draft.summary} /><Area label="Tantangan" name="challenge" defaultValue={draft.challenge} /><Area label="Solusi" name="solution" defaultValue={draft.solution} /><Area label="Hasil" name="outcome" defaultValue={draft.outcome} /><Area label="Daftar layanan (satu per baris)" name="services" defaultValue={lines(draft.services)} /></div><div><h3>English</h3><Area label="Summary" name="summary_en" defaultValue={draft.summary_en} /><Area label="Challenge" name="challenge_en" defaultValue={draft.challenge_en} /><Area label="Solution" name="solution_en" defaultValue={draft.solution_en} /><Area label="Outcome" name="outcome_en" defaultValue={draft.outcome_en} /><Area label="Services (one per line)" name="services_en" defaultValue={lines(draft.services_en)} /></div></div>
        <div className="admin-gallery-editor"><div className="admin-editor-section-title"><div><h3>Gallery</h3><p>Upload gambar atau hapus dari case study. Alt text wajib dibuat aman dan tanpa identitas customer.</p></div><label className="admin-upload-button">Upload gambar<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadGallery(file); event.currentTarget.value = ""; }} /></label></div>
          <div className="admin-gallery-list">{gallery.map((image, index) => <article key={`${image.src}-${index}`}><Image src={image.src} alt={image.alt || "CMS media"} width={320} height={180} unoptimized /><div><input value={image.alt} placeholder="Alt text Indonesia" onChange={(event) => setDraft((current) => ({ ...current, gallery: gallery.map((entry, i) => i === index ? { ...entry, alt: event.target.value } : entry) }))} /><input value={image.alt_en || ""} placeholder="English alt text" onChange={(event) => setDraft((current) => ({ ...current, gallery: gallery.map((entry, i) => i === index ? { ...entry, alt_en: event.target.value } : entry) }))} /><small>{image.src}</small></div><button type="button" onClick={() => setDraft((current) => ({ ...current, gallery: gallery.filter((_, i) => i !== index) }))}>Hapus</button></article>)}</div>
        </div>
      </> : resource === "faqs" ? <><div className="admin-form-grid"><Field label="Urutan" name="sort_order" type="number" defaultValue={draft.sort_order} /></div><div className="admin-language-columns"><div><h3>Bahasa Indonesia</h3><Area label="Pertanyaan" name="question_id" defaultValue={draft.question_id} /><Area label="Jawaban" name="answer_id" defaultValue={draft.answer_id} rows={7} /></div><div><h3>English</h3><Area label="Question" name="question_en" defaultValue={draft.question_en} /><Area label="Answer" name="answer_en" defaultValue={draft.answer_en} rows={7} /></div></div></> : <>
        <div className="admin-form-grid"><Field label="Slug" name="slug" defaultValue={draft.slug} required />{resource === "pages" ? <Field label="Nama halaman" name="label" defaultValue={draft.label} required /> : <Field label="Urutan" name="sort_order" type="number" defaultValue={draft.sort_order} />}{resource === "pricing" && <label className="admin-field"><span>Section</span><select name="section" defaultValue={String(draft.section || "development")}><option value="development">Development</option><option value="support">Support</option><option value="hosting">Hosting</option></select></label>}</div>
        <div className="admin-language-columns"><div><h3>Bahasa Indonesia</h3><Area label="Data JSON" name="data_id" defaultValue={jsonText(draft.data_id)} rows={22} /></div><div><h3>English</h3><Area label="JSON data" name="data_en" defaultValue={jsonText(draft.data_en)} rows={22} /></div></div>
      </>}
      <div className="admin-editor-options"><label><input type="checkbox" name="published" defaultChecked={draft.published !== false} /> Published</label>{resource === "projects" && <label><input type="checkbox" name="featured" defaultChecked={draft.featured === true} /> Featured di homepage</label>}</div>
      {error && <p className="admin-form-message" role="alert">{error}</p>}
      <footer><button type="button" className="admin-button-quiet" onClick={onClose}>Batal</button><button className="admin-save-button" disabled={saving}>{saving ? "Menyimpan…" : "Simpan perubahan"}</button></footer>
    </form>
  </section></div>;
}

export function AdminDashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("pages");
  const [websiteOpen, setWebsiteOpen] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CmsRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { if (!websiteTabs.some((item) => item.id === tab)) return; let cancelled = false; const url = tab === "media" ? "/api/admin/media" : `/api/admin/cms?resource=${tab}`; fetch(url).then(async (response) => { const result = await response.json() as { records?: CmsRecord[] | MediaRecord[]; error?: string }; if (!response.ok) throw new Error(result.error || "Data gagal dimuat."); if (!cancelled) { if (tab === "media") setMedia(result.records as MediaRecord[] || []); else setRecords(result.records as CmsRecord[] || []); } }).catch((loadError) => { if (!cancelled) setError(loadError.message); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [tab, refreshKey]);

  const publishedCount = useMemo(() => records.filter((record) => record.published !== false).length, [records]);
  const activeTab = allTabs.find((item) => item.id === tab);
  const cmsTab = tab as WebsiteTab;
  const isCmsTab = websiteTabs.some((item) => item.id === tab);
  function selectTab(nextTab: Tab) { setLoading(websiteTabs.some((item) => item.id === nextTab)); setError(""); setTab(nextTab); setEditing(null); }
  function refresh() { setEditing(null); setLoading(true); setError(""); setRefreshKey((key) => key + 1); }
  async function remove(record: CmsRecord) {
    if (!record.id || !isCmsTab || cmsTab === "media" || !window.confirm(`Hapus “${labelFor(record, cmsTab)}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    const response = await fetch(`/api/admin/cms/${cmsTab}/${record.id}`, { method: "DELETE" }); const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error || "Gagal menghapus data."); return; } refresh();
  }
  async function logout() { await fetch("/api/admin/auth/logout", { method: "POST" }); window.location.reload(); }
  async function uploadMedia(file: File) { const form = new FormData(); form.set("file", file); setLoading(true); const response = await fetch("/api/admin/media", { method: "POST", body: form }); const result = await response.json() as { error?: string }; if (!response.ok) setError(result.error || "Upload gagal."); refresh(); }
  async function removeMedia(item: MediaRecord) { if (!window.confirm(`Hapus file ${item.name} dari storage? Pastikan file tidak sedang digunakan.`)) return; const response = await fetch(`/api/admin/media?path=${encodeURIComponent(item.name)}`, { method: "DELETE" }); const result = await response.json() as { error?: string }; if (!response.ok) setError(result.error || "Gagal menghapus media."); refresh(); }

  return <main className={`admin-app ${sidebarCollapsed ? "admin-app-collapsed" : ""}`}>
    <aside className="admin-sidebar">
      <button className="admin-sidebar-collapse" type="button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Tampilkan sidebar" : "Ringkas sidebar"} aria-pressed={sidebarCollapsed} title={sidebarCollapsed ? "Tampilkan sidebar" : "Ringkas sidebar"}>{sidebarCollapsed ? "›" : "‹"}</button>
      <div className="admin-brand"><Image src="/retech-logo-transparent.png" alt="RETECH" width={500} height={430} priority /><div><strong>RETECH CMS</strong><span>Content Operations</span></div></div><nav>
      <div className="admin-nav-group"><button className={`admin-nav-toggle ${websiteTabs.some((item) => item.id === tab) ? "current" : ""}`} onClick={() => sidebarCollapsed ? setSidebarCollapsed(false) : setWebsiteOpen((open) => !open)} aria-expanded={websiteOpen || sidebarCollapsed} title="Website"><i>⌂</i><span className="admin-nav-label">Website</span><b>{websiteOpen ? "⌃" : "⌄"}</b></button>{(websiteOpen || sidebarCollapsed) && <div className="admin-subnav">{websiteTabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => selectTab(item.id)} title={item.label} aria-label={item.label}><i>{item.icon}</i><span className="admin-nav-label">{item.label}</span></button>)}</div>}</div>
      <div className="admin-nav-group admin-business-group"><button className={`admin-nav-toggle ${businessTabs.some((item) => item.id === tab) ? "current" : ""}`} onClick={() => sidebarCollapsed ? setSidebarCollapsed(false) : setBusinessOpen((open) => !open)} aria-expanded={businessOpen || sidebarCollapsed} title="Business"><i>▣</i><span className="admin-nav-label">Business</span><b>{businessOpen ? "⌃" : "⌄"}</b></button>{(businessOpen || sidebarCollapsed) && <div className="admin-subnav">{businessTabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => selectTab(item.id)} title={item.label} aria-label={item.label}><i>{item.icon}</i><span className="admin-nav-label">{item.label}</span></button>)}</div>}</div>
      <div className="admin-nav-section"><span>MAIL</span>{mailTabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => selectTab(item.id)} title={item.label} aria-label={item.label}><i>{item.icon}</i><span className="admin-nav-label">{item.label}</span></button>)}</div>
    </nav><div className="admin-sidebar-footer"><a href="https://retech.id" target="_blank" rel="noreferrer" title="Lihat website"><i>↗</i><span className="admin-footer-label">Lihat website</span></a><button onClick={logout} title="Logout"><i>⇥</i><span className="admin-footer-label">Logout</span></button></div></aside>
    <section className="admin-workspace"><header className="admin-topbar"><div><span className="admin-kicker">RETECH / {tab.startsWith("business-") ? "BUSINESS OPERATIONS" : tab.startsWith("mail-") ? "MAIL OPERATIONS" : "CONTENT MANAGEMENT"}</span><h1>{activeTab?.label}</h1></div><div className="admin-user"><span><i />Secure session</span><strong>{email}</strong></div></header>
      {tab === "mail-users" ? <MailUsersPanel /> : tab === "business-quotations" ? <QuotationPanel /> : !isCmsTab ? <ComingSoonPanel id={tab} title={activeTab?.label || "Coming Soon"} /> : <div className="admin-content"><section className="admin-stats"><article><span>Total data</span><strong>{cmsTab === "media" ? media.length : records.length}</strong></article><article><span>{cmsTab === "media" ? "Storage media" : "Published"}</span><strong>{cmsTab === "media" ? "8 MB max" : publishedCount}</strong></article><article><span>Last refresh</span><strong>{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</strong></article></section>
        <div className="admin-list-header"><div><h2>{cmsTab === "media" ? "Media library" : `Kelola ${activeTab?.label}`}</h2><p>{cmsTab === "projects" ? "Tambah case study, edit konten bilingual, upload, urutkan, atau hapus gambar." : cmsTab === "pages" ? "Edit copy per halaman dalam Bahasa Indonesia dan English." : "Perubahan published akan tampil pada website setelah disimpan."}</p></div>{cmsTab === "media" ? <label className="admin-primary-button">Upload media<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file); event.currentTarget.value = ""; }} /></label> : <button className="admin-primary-button" onClick={() => setEditing(emptyRecord(cmsTab))}>+ Tambah data</button>}</div>
        {error && <p className="admin-form-message" role="alert">{error}</p>}{loading ? <div className="admin-loading">Memuat data CMS…</div> : cmsTab === "media" ? <div className="admin-media-grid">{media.map((item) => <article key={item.name}><Image src={item.url} alt={item.name} width={360} height={220} unoptimized /><div><strong>{item.name}</strong><small>{item.metadata?.size ? `${Math.round(item.metadata.size / 1024)} KB` : "Media"}</small><button onClick={() => navigator.clipboard.writeText(item.url)}>Salin URL</button><button className="danger" onClick={() => removeMedia(item)}>Hapus</button></div></article>)}</div> : <div className="admin-record-list">{records.map((record) => <article key={String(record.id)}><div className="admin-record-order">{String(record.sort_order ?? "—").padStart(2, "0")}</div><div><span className={record.published === false ? "status-draft" : "status-live"}>{record.published === false ? "DRAFT" : "PUBLISHED"}</span><h3>{labelFor(record, cmsTab)}</h3><p>{record.slug ? `/${record.slug}` : cmsTab === "faqs" ? String(record.answer_id || "").slice(0, 130) : "Content record"}</p></div><div className="admin-record-actions"><button onClick={() => setEditing(clone(record))}>Edit</button><button className="danger" onClick={() => remove(record)}>Hapus</button></div></article>)}</div>}
      </div>}
    </section>{editing && isCmsTab && cmsTab !== "media" && <RecordEditor resource={cmsTab} record={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
  </main>;
}
