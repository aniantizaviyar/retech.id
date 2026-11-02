"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { historyReference, type HistoryConversation, type HistoryExchange } from "@/lib/assistant/history-policy";
import { safeSource } from "@/lib/assistant/client";
import styles from "./AssistantHistoryPanel.module.css";
type List = { conversations: HistoryConversation[]; total: number };
type Detail = { conversation: HistoryConversation; exchanges: HistoryExchange[] };
const endpoint = "/api/admin/assistant/conversations";
const date = (value: string) => new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const followup = { none: "Informasi", draft: "Form belum dikirim", submitted: "Menunggu konfirmasi tim" };
const skills: Record<string, string> = { search_information: "Informasi layanan", estimate_price: "Estimasi harga", request_consultation: "Konsultasi", create_support_request: "Support", check_service_status: "Status publik", guardrail: "Proteksi", clarification: "Klarifikasi" };
async function responseData(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(response.status === 401 ? "Sesi admin berakhir. Silakan login ulang." : data.error || "Permintaan belum dapat diproses.");
  return data;
}
export function AssistantHistoryPanel() {
  const [page, setPage] = useState(1), [version, setVersion] = useState(0);
  const [list, setList] = useState<List | null>(null), [detail, setDetail] = useState<Detail | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(""), [detailError, setDetailError] = useState("");
  const [target, setTarget] = useState<HistoryConversation | null>(null);
  const [confirmation, setConfirmation] = useState(""), [deleting, setDeleting] = useState(false), [deleteError, setDeleteError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${endpoint}?page=${page}`, { cache: "no-store", signal: abort.signal }).then(responseData)
      .then((data: List) => { if (!abort.signal.aborted) setList(data); })
      .catch((cause) => { if (!abort.signal.aborted) setError(cause.message); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [page, version]);
  useEffect(() => {
    if (!selected) return;
    const abort = new AbortController();
    fetch(`${endpoint}/${selected}`, { cache: "no-store", signal: abort.signal }).then(responseData)
      .then((data: Detail) => { if (!abort.signal.aborted) setDetail(data); })
      .catch((cause) => { if (!abort.signal.aborted) setDetailError(cause.message); })
      .finally(() => { if (!abort.signal.aborted) setDetailLoading(false); });
    return () => abort.abort();
  }, [selected, version]);
  useEffect(() => { if (target) dialog.current?.showModal(); else dialog.current?.close(); }, [target]);
  function refresh() { setLoading(true); setError(""); setDetailError(""); setDetail(null); setDetailLoading(!!selected); setVersion((v) => v + 1); }
  function selectConversation(id: string) { if (id === selected) return; setDetail(null); setDetailError(""); setDetailLoading(true); setSelected(id); }
  function changePage(next: number) { setLoading(true); setError(""); setPage(next); }
  function closeDelete() { if (!deleting) { setTarget(null); setConfirmation(""); setDeleteError(""); } }
  async function remove(event: FormEvent) {
    event.preventDefault(); if (!target || confirmation !== "HAPUS" || deleting) return;
    setDeleting(true); setDeleteError("");
    try {
      await responseData(await fetch(`${endpoint}/${target.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) }));
      setTarget(null); setConfirmation(""); setSelected(null); setDetail(null); setDetailLoading(false); setList(null); setLoading(true); setError(""); setPage(1); setVersion((v) => v + 1);
    } catch (cause) { setDeleteError(cause instanceof Error ? cause.message : "Penghapusan gagal."); }
    finally { setDeleting(false); }
  }
  return <div className={`admin-content ${styles.root}`} data-clarity-mask="true">
    <section className={styles.intro}><div><span className="admin-kicker">AI ASSISTANT / PRIVATE HISTORY</span><h2>Riwayat percakapan</h2><p>Hanya chat baru dengan izin pengunjung. Teks tersamarkan, akses khusus admin.</p></div><button onClick={refresh} disabled={loading || deleting}>↻ Muat ulang</button></section>
    <div className={styles.stats}><article><span>Percakapan aktif</span><strong>{list?.total ?? "—"}</strong></article><article><span>Retensi</span><strong>7 hari</strong></article><article><span>Akses</span><strong>Admin saja</strong></article></div>
    <p className={styles.notice}>Data kedaluwarsa langsung tidak ditampilkan; cleanup fisik berjalan setiap jam. Penghapusan chat tidak menghapus inquiry, invoice, atau quotation. Penyamaran otomatis bukan jaminan anonimisasi.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.workspace}>
      <section className={styles.list} aria-label="Daftar percakapan" aria-busy={loading}>
        <header><h3>Percakapan</h3><span>{list?.total ?? 0} total</span></header>
        {loading ? <p className={styles.empty}>Memuat riwayat…</p> : !error && list?.conversations.length === 0 ? <div className={styles.empty}><strong>Belum ada riwayat</strong><p>Chat lama tidak direkam. Percakapan baru muncul setelah pengunjung menyetujui penyimpanan dan mengirim pesan.</p></div> : list?.conversations.map((conversation) => <button key={conversation.id} className={`${styles.conversation} ${selected === conversation.id ? styles.selected : ""}`} aria-pressed={selected === conversation.id} onClick={() => selectConversation(conversation.id)}><span><strong>{historyReference(conversation.id)}</strong><time>{date(conversation.last_activity_at)} WIB</time></span><p>{conversation.preview}</p><small>{conversation.exchange_count} interaksi · {conversation.locale.toUpperCase()} · {followup[conversation.followup_status]}</small></button>)}
        <footer><button disabled={page === 1 || loading} onClick={() => changePage(page - 1)}>← Sebelumnya</button><span>{page} / {Math.max(1, Math.ceil((list?.total ?? 0) / 20))}</span><button disabled={loading || page * 20 >= (list?.total ?? 0)} onClick={() => changePage(page + 1)}>Berikutnya →</button></footer>
      </section>
      <section className={styles.detail} aria-label="Detail percakapan" aria-busy={detailLoading}>
        {detailLoading ? <p className={styles.empty}>Memuat percakapan…</p> : detailError ? <p role="alert" className={styles.error}>{detailError}</p> : !detail ? <div className={styles.empty}><span className={styles.emptyIcon} aria-hidden="true">✧</span><h3>Pilih percakapan</h3><p>Lihat pertanyaan, jawaban, sumber, dan skill yang digunakan. Data kontak formulir tidak disalin ke riwayat.</p></div> : <>
          <header className={styles.detailHeader}><div><span className="admin-kicker">{historyReference(detail.conversation.id)}</span><h3>Detail chat</h3><p>Dibuat {date(detail.conversation.created_at)} WIB<br />Kedaluwarsa {date(detail.conversation.expires_at)} WIB</p></div><button className={styles.danger} onClick={() => { setTarget(detail.conversation); setConfirmation(""); setDeleteError(""); }}>Hapus chat</button></header>
          <div className={styles.transcript}>{detail.exchanges.map((exchange) => <article key={exchange.id} className={styles.exchange}><div className={styles.exchangeMeta}><time>{date(exchange.created_at)} WIB</time><span>{skills[exchange.skill] ?? exchange.skill} · {exchange.provider === "cloudflare" ? "Cloudflare AI" : "Panduan resmi"}</span></div><div className={styles.question}><small>PENGUNJUNG</small><p>{exchange.question}</p></div><div className={styles.answer}><small>RETECH ASSISTANT</small><p>{exchange.answer}</p>{exchange.sources.length > 0 && <div className={styles.sources}>{exchange.sources.filter((source) => safeSource(source.href)).map((source) => <a key={source.href} href={source.href.startsWith("/") ? `https://retech.id${source.href}` : source.href} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</div>}</div>{exchange.request_kind && <p className={styles.requestStatus}>{exchange.request_kind === "support" ? "Support" : "Konsultasi"}: {followup[exchange.followup_status]}{exchange.request_id && <code>RDS-{exchange.request_id.toUpperCase()}</code>}</p>}</article>)}</div>
        </>}
      </section>
    </div>
    <dialog ref={dialog} className={styles.deleteDialog} onCancel={(event) => { event.preventDefault(); closeDelete(); }} aria-labelledby="delete-history-title"><form onSubmit={remove}><span className="admin-kicker">PENGHAPUSAN PERMANEN</span><h2 id="delete-history-title">Hapus {target ? historyReference(target.id) : "chat"}?</h2><p>Semua pesan dan jawaban percakapan ini akan dihapus dan tidak dapat dikembalikan melalui dashboard. Inquiry yang telah dikirim tetap tersimpan terpisah.</p><label>Ketik HAPUS untuk melanjutkan<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" maxLength={5} disabled={deleting} autoFocus /></label>{deleteError && <p className={styles.error} role="alert">{deleteError}</p>}<footer><button type="button" onClick={closeDelete} disabled={deleting}>Batal</button><button className={styles.danger} disabled={confirmation !== "HAPUS" || deleting}>{deleting ? "Menghapus…" : "Hapus permanen"}</button></footer></form></dialog>
  </div>;
}
