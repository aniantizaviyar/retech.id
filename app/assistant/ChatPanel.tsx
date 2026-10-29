"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { TurnstileWidget } from "../TurnstileWidget";
import { localePath, type Locale } from "@/lib/i18n";
import type { ActionDraft, Answer } from "@/lib/assistant/contracts";
import { readAnswer, safeSource } from "@/lib/assistant/client";
import styles from "./ChatPanel.module.css";

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  answer?: Answer;
};
function RequestForm({
  draft,
  locale,
}: {
  draft: ActionDraft;
  locale: Locale;
}) {
  const en = locale === "en";
  const [token, setToken] = useState("");
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    reference: string;
    message: string;
    notification: string;
  } | null>(null);
  const verified = useCallback((value: string) => setToken(value), []);
  const unavailable = useCallback(() => {
    setToken("");
    setError(
      en
        ? "Security check unavailable. Retry or contact sales@retech.id."
        : "Verifikasi tidak tersedia. Coba lagi atau hubungi sales@retech.id.",
    );
  }, [en]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !token) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/assistant/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          token: draft.token,
          name: form.get("name"),
          phone: form.get("phone"),
          ...(draft.kind === "consultation"
            ? { preferredAt: form.get("preferredAt") }
            : {}),
          note: form.get("note") || "",
          consent: form.get("consent") === "on",
          turnstileToken: token,
          locale,
        }),
        signal: AbortSignal.timeout(28000),
      });
      const data = await response.json();
      if (!response.ok || !data.ok)
        throw new Error(data.error || "Request failed");
      setReceipt(data);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name !== "TimeoutError"
          ? cause.message
          : en
            ? "Response timed out. Retry the same form to check the saved reference; do not create another request."
            : "Respons melewati batas waktu. Coba lagi pada formulir yang sama untuk mengecek referensi tersimpan; jangan membuat permintaan kedua.",
      );
    } finally {
      setBusy(false);
      setToken("");
      setVersion((v) => v + 1);
    }
  }
  if (receipt)
    return (
      <div className={styles.receipt} role="status">
        <strong>{en ? "Request saved" : "Permintaan tersimpan"}</strong>
        <code>{receipt.reference}</code>
        <p>{receipt.message}</p>
        <small>
          {receipt.notification === "sent"
            ? en
              ? "Team notification submitted, not a delivery confirmation."
              : "Notifikasi tim diajukan, bukan konfirmasi email diterima."
            : en
              ? "Saved for review by the RETECH team."
              : "Tersimpan untuk ditinjau tim RETECH."}
        </small>
      </div>
    );
  return (
    <form
      className={styles.requestForm}
      onSubmit={submit}
      data-clarity-mask="true"
    >
      <strong>
        {draft.kind === "consultation"
          ? en
            ? "Consultation request"
            : "Permintaan konsultasi"
          : en
            ? "Support request"
            : "Permintaan support"}
      </strong>
      <p className={styles.summary}>{draft.summary}</p>
      <label>
        {en ? "Name" : "Nama"}
        <input
          name="name"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          disabled={busy}
        />
      </label>
      <label>
        {en ? "Phone / WhatsApp" : "Telepon / WhatsApp"}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          minLength={8}
          maxLength={30}
          required
          disabled={busy}
        />
      </label>
      {draft.kind === "consultation" && (
        <label>
          {en
            ? "Preferred time (WIB / UTC+7)"
            : "Waktu yang diinginkan (WIB / UTC+7)"}
          <input
            name="preferredAt"
            type="datetime-local"
            required
            disabled={busy}
          />
          <small>
            {en
              ? "15 minutes–90 days ahead; subject to team confirmation."
              : "15 menit–90 hari ke depan; menunggu konfirmasi tim."}
          </small>
        </label>
      )}
      <label>
        {en ? "Additional context (optional)" : "Catatan tambahan (opsional)"}
        <textarea
          name="note"
          maxLength={700}
          rows={3}
          disabled={busy}
          placeholder={
            en
              ? "No passwords, tokens or sensitive customer data."
              : "Tanpa password, token, atau data customer sensitif."
          }
        />
      </label>
      <label className={styles.check}>
        <input type="checkbox" name="consent" required disabled={busy} />
        <span>
          {en
            ? "I approve this request and agree to be contacted under the "
            : "Saya menyetujui permintaan dan bersedia dihubungi sesuai "}
          <a href={localePath(locale, "/privacy-policy")}>
            {en ? "privacy policy" : "kebijakan privasi"}
          </a>
          .
        </span>
      </label>
      <TurnstileWidget
        key={version}
        action="lead_submit"
        responsive
        locale={locale}
        onVerify={verified}
        onUnavailable={unavailable}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button
        type="submit"
        className={styles.primary}
        disabled={busy || !token}
      >
        {busy
          ? en
            ? "Saving…"
            : "Menyimpan…"
          : en
            ? "Confirm & send request"
            : "Setujui & kirim permintaan"}
      </button>
      {!token && !busy && (
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            setError("");
            setVersion((v) => v + 1);
          }}
        >
          {en ? "Reload security check" : "Muat ulang verifikasi"}
        </button>
      )}
    </form>
  );
}

export default function ChatPanel({
  locale,
  onClose,
}: {
  locale: Locale;
  onClose: () => void;
}) {
  const en = locale === "en";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "agent",
      text: en
        ? "Hello! Ask about RETECH services, calculate an estimate, request a consultation/support follow-up, or check a public page. Never share passwords or sensitive data."
        : "Halo! Tanyakan layanan RETECH, hitung estimasi, ajukan konsultasi/support, atau cek halaman publik. Jangan mengirim password atau data sensitif.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState("");
  const [version, setVersion] = useState(0);
  const [sessionValid, setSessionValid] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);
  const active = useRef<AbortController | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastFailed, setLastFailed] = useState("");
  const verified = useCallback((token: string) => {
    setChallenge(token);
    setError("");
  }, []);
  const unavailable = useCallback(() => {
    setChallenge("");
    setError(
      en
        ? "Security check unavailable; retry below or email sales@retech.id."
        : "Verifikasi tidak tersedia; coba lagi di bawah atau email sales@retech.id.",
    );
  }, [en]);
  useEffect(() => {
    if (window.matchMedia("(min-width: 641px)").matches)
      inputRef.current?.focus();
    const controller = new AbortController();
    fetch("/api/assistant/capabilities", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAiAvailable(data?.aiAvailable === true))
      .catch(() => {});
    return () => {
      controller.abort();
      active.current?.abort();
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
  }, []);
  useEffect(() => {
    if (autoScroll.current && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages, status]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);
  async function send(value: string) {
    const message = value.trim();
    if (!message || busy || message.length > 1200) return;
    if (!sessionValid && !challenge) {
      setError(
        en
          ? "Complete the security check first."
          : "Selesaikan verifikasi keamanan terlebih dahulu.",
      );
      return;
    }
    const id = crypto.randomUUID();
    const controller = new AbortController();
    active.current = controller;
    autoScroll.current = true;
    setError("");
    setLastFailed("");
    setBusy(true);
    setStatus(en ? "Connecting…" : "Menghubungkan…");
    setInput("");
    const history = messages
      .filter((m) => m.role === "user")
      .slice(-6)
      .map((m) => ({ role: "user", text: m.text.slice(0, 600) }));
    setMessages((current) => [
      ...current.slice(-22),
      { id: `${id}-user`, role: "user", text: message },
      { id, role: "agent", text: "" },
    ]);
    let completed = false;
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          locale,
          history,
          aiConsent: aiAvailable && aiConsent,
          ...(challenge ? { turnstileToken: challenge } : {}),
        }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(25000),
        ]),
      });
      if (!response.ok) {
        const data = await response.json();
        if (["challenge", "session"].includes(data.code)) {
          setSessionValid(false);
          setChallenge("");
          setVersion((v) => v + 1);
        }
        throw new Error(data.error || "Assistant unavailable");
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Empty response");
      let buffer = "";
      let bytes = 0;
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { value: chunk, done } = await reader.read();
          if (done) break;
          bytes += chunk.length;
          if (bytes > 50_000) throw new Error("Response limit reached");
          buffer += decoder.decode(chunk, { stream: true });
          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const event = frame.match(/^event: (.+)$/m)?.[1];
            const raw = frame.match(/^data: (.+)$/m)?.[1];
            if (!raw) continue;
            const data = JSON.parse(raw);
            if (event === "ready") {
              const ttl = Math.min(1800000, Number(data.sessionTtlMs) || 0);
              setSessionValid(ttl > 0);
              setChallenge("");
              setAiAvailable(data.aiAvailable === true);
              if (expiryTimer.current) clearTimeout(expiryTimer.current);
              expiryTimer.current = setTimeout(
                () => {
                  setSessionValid(false);
                  setChallenge("");
                  setVersion((v) => v + 1);
                },
                Math.max(0, ttl),
              );
            }
            if (event === "status") setStatus(String(data.text).slice(0, 120));
            if (event === "delta" && typeof data.text === "string")
              setMessages((current) =>
                current.map((m) =>
                  m.id === id ? { ...m, text: m.text + data.text } : m,
                ),
              );
            if (event === "done") {
              const answer = readAnswer(data);
              if (!answer)
                throw new Error(
                  en
                    ? "Invalid response. Please retry."
                    : "Respons tidak valid. Coba lagi.",
                );
              completed = true;
              setMessages((current) =>
                current.map((m) =>
                  m.id === id ? { ...m, text: answer.text, answer } : m,
                ),
              );
            }
            if (event === "error") throw new Error(data.text);
          }
        }
        if (!completed)
          throw new Error(
            en
              ? "Response interrupted. Please retry."
              : "Respons terputus. Silakan coba lagi.",
          );
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } catch (cause) {
      const text = controller.signal.aborted
        ? en
          ? "Message cancelled."
          : "Pesan dibatalkan."
        : cause instanceof Error && cause.name !== "TimeoutError"
          ? cause.message
          : en
            ? "Request timed out. Please retry."
            : "Permintaan melewati batas waktu. Coba lagi.";
      setError(text);
      if (!controller.signal.aborted) setLastFailed(message);
      setMessages((current) =>
        current.map((m) => (m.id === id && !m.text ? { ...m, text } : m)),
      );
    } finally {
      setBusy(false);
      setStatus("");
      active.current = null;
      if (window.matchMedia("(min-width: 641px)").matches)
        inputRef.current?.focus();
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }
  const questions = en
    ? [
        "RETECH services",
        "Attendance Pro for 25 employees",
        "Request a demo",
        "Create support request",
        "Website status",
      ]
    : [
        "Layanan RETECH",
        "Harga Attendance Pro 25 karyawan",
        "Ajukan demo",
        "Buat permintaan support",
        "Status website",
      ];
  return (
    <section
      id="retech-assistant-dialog"
      role="dialog"
      aria-modal="false"
      aria-labelledby="retech-assistant-title"
      className={styles.panel}
      data-clarity-mask="true"
    >
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          R
        </span>
        <div>
          <strong id="retech-assistant-title">RETECH Assistant</strong>
          <small>
            {aiAvailable
              ? en
                ? "Official references · optional AI"
                : "Referensi resmi · AI opsional"
              : en
                ? "Official guided assistant"
                : "Mode panduan resmi"}
          </small>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={en ? "Close assistant" : "Tutup asisten"}
        >
          ×
        </button>
      </header>
      <div
        className={styles.log}
        ref={log}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={en ? "Conversation" : "Percakapan"}
        onScroll={() => {
          const el = log.current;
          if (el)
            autoScroll.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`${styles.message} ${message.role === "user" ? styles.user : styles.agent}`}
          >
            <p>{message.text}</p>
            {message.answer?.sources?.length ? (
              <nav
                aria-label={en ? "Sources" : "Sumber"}
                className={styles.sources}
              >
                {message.answer.sources
                  .filter((s) => safeSource(s.href))
                  .slice(0, 3)
                  .map((source, i) => (
                    <a
                      key={`${source.href}-${i}`}
                      href={source.href}
                      {...(source.href.startsWith("https:")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {source.title} ↗
                    </a>
                  ))}
              </nav>
            ) : null}
            {message.answer?.provider === "cloudflare" && (
              <small className={styles.modelNote}>
                {en
                  ? "Intent assisted by Cloudflare AI; facts/calculation verified by code."
                  : "Maksud dibantu Cloudflare AI; fakta/perhitungan dari kode."}
              </small>
            )}
            {message.answer?.action && (
              <RequestForm draft={message.answer.action} locale={locale} />
            )}
          </article>
        ))}
        {busy && (
          <p className={styles.progress} role="status">
            {status}
          </p>
        )}
      </div>
      <div className={styles.tools}>
        {questions.map((question) => (
          <button
            type="button"
            key={question}
            onClick={() => void send(question)}
            disabled={busy}
          >
            {question}
          </button>
        ))}
      </div>
      {aiAvailable && (
        <label className={`${styles.check} ${styles.aiConsent}`}>
          <input
            type="checkbox"
            checked={aiConsent}
            onChange={(event) => setAiConsent(event.target.checked)}
            disabled={busy}
          />
          <span>
            {en
              ? "Allow Cloudflare AI to interpret unclear questions (redacted text may be processed externally)."
              : "Izinkan Cloudflare AI memahami pertanyaan ambigu (teks tersamarkan dapat diproses di luar RETECH)."}{" "}
            <a href={localePath(locale, "/privacy-policy")}>
              {en ? "Privacy" : "Privasi"}
            </a>
          </span>
        </label>
      )}
      {!sessionValid && (
        <div className={styles.challenge}>
          <TurnstileWidget
            key={version}
            action="assistant_chat"
            responsive
            locale={locale}
            onVerify={verified}
            onUnavailable={unavailable}
          />
          {!challenge && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setError("");
                setVersion((v) => v + 1);
              }}
            >
              {en ? "Reload verification" : "Muat ulang verifikasi"}
            </button>
          )}
        </div>
      )}
      {error && (
        <div className={styles.error} role="alert">
          {error}
          {lastFailed && (
            <button
              type="button"
              className={styles.textButton}
              disabled={busy || (!sessionValid && !challenge)}
              onClick={() => void send(lastFailed)}
            >
              {en ? "Retry message" : "Coba lagi"}
            </button>
          )}
        </div>
      )}
      <form onSubmit={submit} className={styles.composer}>
        <label className="sr-only" htmlFor="assistant-question">
          {en ? "Ask RETECH" : "Tanya RETECH"}
        </label>
        <input
          id="assistant-question"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={1200}
          disabled={busy}
          placeholder={en ? "Ask a service question…" : "Tanyakan kebutuhanmu…"}
          autoComplete="off"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => active.current?.abort()}
            aria-label={en ? "Cancel response" : "Batalkan respons"}
          >
            ■
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || (!sessionValid && !challenge)}
            aria-label={en ? "Send message" : "Kirim pesan"}
          >
            ↑
          </button>
        )}
      </form>
      <footer className={styles.footer}>
        {en
          ? "Estimates are not final quotations. Requests require team confirmation."
          : "Estimasi bukan penawaran final. Permintaan perlu konfirmasi tim."}{" "}
        <a href="mailto:sales@retech.id">sales@retech.id</a>
      </footer>
    </section>
  );
}
