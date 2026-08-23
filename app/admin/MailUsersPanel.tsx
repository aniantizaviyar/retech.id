"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type MailboxRecord = {
  email: string;
  storageBytes: number;
  messageCount: number;
  protected: boolean;
  role: string;
  quotaBytes: number | null;
};

type MailStorage = {
  mailboxesBytes: number;
  serverTotalBytes: number;
  serverUsedBytes: number;
  serverFreeBytes: number;
  quotaConfigured: boolean;
};

type MailResponse = { mailboxes?: MailboxRecord[]; storage?: MailStorage; error?: string };

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unit = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** unit;
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function generatePassword() {
  const groups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*+-_=?."];
  const randomIndex = (length: number) => {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % length;
  };
  const characters = groups.map((group) => group[randomIndex(group.length)]);
  const all = groups.join("");
  while (characters.length < 18) characters.push(all[randomIndex(all.length)]);
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [characters[index], characters[target]] = [characters[target], characters[index]];
  }
  return characters.join("");
}

function MailboxEditor({ mailbox, onClose, onSaved }: { mailbox: MailboxRecord | null; onClose: () => void; onSaved: () => void }) {
  const isNew = mailbox == null;
  const [email, setEmail] = useState(mailbox?.email || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function useGeneratedPassword() {
    const value = generatePassword();
    setPassword(value);
    setConfirmation(value);
    setShowPassword(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) { setError("Konfirmasi password tidak sama."); return; }
    setSaving(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const response = await fetch(isNew ? "/api/admin/mail" : `/api/admin/mail/${encodeURIComponent(normalizedEmail)}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Mailbox belum dapat disimpan.");
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Mailbox belum dapat disimpan.");
      setSaving(false);
    }
  }

  return <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal admin-mail-modal" role="dialog" aria-modal="true" aria-label={isNew ? "Tambah mailbox" : "Ubah password mailbox"}>
    <header><div><span className="admin-kicker">MAIL / {isNew ? "CREATE USER" : "SECURITY"}</span><h2>{isNew ? "Tambah mailbox" : "Ubah password"}</h2></div><button type="button" onClick={onClose} aria-label="Tutup editor">×</button></header>
    <form onSubmit={save}>
      <div className="admin-form-grid admin-mail-form-grid">
        <label className="admin-field"><span>Alamat email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@retech.id" autoComplete="username" readOnly={!isNew} required /></label>
        <div className="admin-password-actions"><span>Password kuat</span><button type="button" className="admin-button-quiet" onClick={useGeneratedPassword}>Generate password</button></div>
        <label className="admin-field"><span>Password baru</span><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /></label>
        <label className="admin-field"><span>Ulangi password</span><input type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /></label>
      </div>
      <label className="admin-show-password"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Tampilkan password</label>
      <p className="admin-security-note">Minimal 12 karakter serta memiliki huruf kecil, huruf besar, angka, dan simbol. Salin password sebelum menyimpan—dashboard tidak menyimpan atau menampilkannya kembali.</p>
      {error && <p className="admin-form-message" role="alert">{error}</p>}
      <footer><button type="button" className="admin-button-quiet" onClick={onClose}>Batal</button><button className="admin-save-button" disabled={saving}>{saving ? "Menyimpan…" : isNew ? "Buat mailbox" : "Perbarui password"}</button></footer>
    </form>
  </section></div>;
}

export function MailUsersPanel() {
  const [mailboxes, setMailboxes] = useState<MailboxRecord[]>([]);
  const [storage, setStorage] = useState<MailStorage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<MailboxRecord | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/mail").then(async (response) => {
      const result = await response.json() as MailResponse;
      if (!response.ok) throw new Error(result.error || "Data mailbox gagal dimuat.");
      if (!cancelled) { setMailboxes(result.mailboxes || []); setStorage(result.storage || null); }
    }).catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Data mailbox gagal dimuat."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const diskPercent = useMemo(() => storage?.serverTotalBytes ? Math.round((storage.serverUsedBytes / storage.serverTotalBytes) * 100) : 0, [storage]);
  function refresh() { setEditing(undefined); setLoading(true); setError(""); setRefreshKey((value) => value + 1); }

  async function remove(mailbox: MailboxRecord) {
    if (mailbox.protected) return;
    if (!window.confirm(`Hapus akses ${mailbox.email}? Maildir akan diarsipkan di server untuk pemulihan manual.`)) return;
    setError("");
    const response = await fetch(`/api/admin/mail/${encodeURIComponent(mailbox.email)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: mailbox.email }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error || "Mailbox belum dapat dihapus."); return; }
    refresh();
  }

  return <div className="admin-content admin-mail-content">
    <section className="admin-stats admin-mail-stats">
      <article><span>Total mailbox</span><strong>{mailboxes.length}</strong></article>
      <article><span>Storage mailbox</span><strong>{formatBytes(storage?.mailboxesBytes || 0)}</strong></article>
      <article><span>Disk server</span><strong>{diskPercent}%</strong><small>{formatBytes(storage?.serverUsedBytes || 0)} / {formatBytes(storage?.serverTotalBytes || 0)}</small></article>
      <article><span>Disk tersedia</span><strong>{formatBytes(storage?.serverFreeBytes || 0)}</strong></article>
    </section>
    <div className="admin-list-header"><div><h2>Mail users</h2><p>Kelola mailbox RETECH, reset password, dan pantau pemakaian storage aktual pada server Oracle.</p></div><button className="admin-primary-button" onClick={() => setEditing(null)}>+ Tambah user</button></div>
    <div className="admin-mail-storage-note"><div><strong>Server storage</strong><span>{diskPercent}% digunakan</span></div><div className="admin-storage-track"><i style={{ width: `${Math.min(diskPercent, 100)}%` }} /></div><p>Quota per-user belum diaktifkan. Seluruh mailbox saat ini berbagi kapasitas disk server.</p></div>
    {error && <p className="admin-form-message" role="alert">{error}</p>}
    {loading ? <div className="admin-loading">Menghubungkan ke mail server Oracle…</div> : <div className="admin-mail-list">{mailboxes.map((mailbox) => <article key={mailbox.email}>
      <div className="admin-mail-avatar">{mailbox.email.slice(0, 1).toUpperCase()}</div>
      <div className="admin-mail-identity"><span className={mailbox.protected ? "status-protected" : "status-live"}>{mailbox.protected ? "CORE / PROTECTED" : "ACTIVE"}</span><h3>{mailbox.email}</h3><p>{mailbox.role}</p></div>
      <div className="admin-mail-metric"><span>Storage</span><strong>{formatBytes(mailbox.storageBytes)}</strong><small>Tanpa quota</small></div>
      <div className="admin-mail-metric"><span>Pesan</span><strong>{mailbox.messageCount}</strong><small>Inbox & folder aktif</small></div>
      <div className="admin-record-actions"><button onClick={() => setEditing(mailbox)}>Ubah password</button>{!mailbox.protected && <button className="danger" onClick={() => void remove(mailbox)}>Hapus</button>}</div>
    </article>)}</div>}
    {editing !== undefined && <MailboxEditor mailbox={editing} onClose={() => setEditing(undefined)} onSaved={refresh} />}
  </div>;
}
