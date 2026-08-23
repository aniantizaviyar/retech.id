"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { TurnstileWidget } from "../TurnstileWidget";

export function AdminLogin() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    if (!token) { setStatus("error"); setMessage("Selesaikan verifikasi keamanan terlebih dahulu."); return; }
    setStatus("loading"); setMessage("");
    const response = await fetch("/api/admin/auth/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, turnstileToken: token }) });
    const result = await response.json() as { ok?: boolean; error?: string; message?: string };
    if (!response.ok || !result.ok) {
      setStatus("error");
      setMessage(result.error || "Kode belum dapat dikirim.");
      setToken("");
      setTurnstileKey((current) => current + 1);
      return;
    }
    setStep("verify"); setStatus("idle"); setMessage(result.message || "Kode sudah dikirim.");
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setStatus("loading"); setMessage("");
    const response = await fetch("/api/admin/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const result = await response.json() as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) { setStatus("error"); setMessage(result.error || "Login gagal."); return; }
    window.location.reload();
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Image src="/retech-logo-transparent.png" alt="RETECH" width={500} height={430} priority />
        <span className="admin-kicker">SECURE CONTENT OPERATIONS</span>
        <h1>RETECH Admin CMS</h1>
        <p>Kelola konten website, layanan, harga, FAQ, case study, dan media dari satu area yang dilindungi.</p>
        {step === "request" ? (
          <form onSubmit={requestCode}>
            <label htmlFor="admin-email">Email administrator</label>
            <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="Masukkan email administrator" inputMode="email" required />
            <TurnstileWidget key={turnstileKey} action="admin_login" onVerify={setToken} onUnavailable={() => { setToken(""); setMessage("Verifikasi keamanan tidak dapat dimuat."); }} />
            {message && <p className="admin-form-message" role="alert">{message}</p>}
            <button disabled={status === "loading"}>{status === "loading" ? "Mengirim…" : "Kirim kode login"}<span>↗</span></button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <div className="admin-login-notice">{message}</div>
            <label htmlFor="admin-code">Kode 6 digit</label>
            <input id="admin-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} autoFocus required />
            {status === "error" && <p className="admin-form-message" role="alert">{message}</p>}
            <button disabled={status === "loading" || code.length !== 6}>{status === "loading" ? "Memverifikasi…" : "Masuk ke CMS"}<span>↗</span></button>
            <button type="button" className="admin-button-quiet" onClick={() => { setStep("request"); setCode(""); setMessage(""); setToken(""); }}>Minta kode baru</button>
          </form>
        )}
        <small>Hanya <strong>admin@retech.id</strong> yang memiliki akses. Session berakhir otomatis setelah 8 jam.</small>
      </section>
    </main>
  );
}
