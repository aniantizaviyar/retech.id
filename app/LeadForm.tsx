"use client";

import { FormEvent, useId, useState } from "react";
import { SERVICE_OPTIONS, validateLeadInput } from "@/lib/leads";
import { TurnstileWidget } from "./TurnstileWidget";
import { trackSiteEvent } from "@/components/AnalyticsEvents";

type LeadFormProps = {
  source: "chatbot" | "contact";
  compact?: boolean;
  initialNeed?: string;
};

export function LeadForm({ source, compact = false, initialNeed = "" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState({ name: "", phone: "", service: "", needs: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState(false);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const formId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      service: String(data.get("service") || "").trim(),
      needs: String(data.get("needs") || "").trim(),
      company: String(data.get("company") || ""),
      source,
    };

    const validation = validateLeadInput(payload);
    if (!validation.ok) {
      setStatus("error");
      setError(validation.error);
      (form.elements.namedItem(validation.field) as HTMLElement | null)?.focus();
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setError(turnstileError ? "Verifikasi keamanan tidak dapat dimuat. Muat ulang halaman lalu coba lagi." : "Selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, company: payload.company, source, turnstileToken }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Inquiry belum dapat dikirim.");

      setSubmitted(validation.data);
      setStatus("success");
      trackSiteEvent("generate_lead", {
        form_source: source,
        service: validation.data.service,
        page_path: window.location.pathname,
      });
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Terjadi kendala. Silakan coba lagi.");
      setStatus("error");
      setTurnstileToken("");
      setChallengeVersion((version) => version + 1);
    }
  }

  const mailBody = encodeURIComponent(
    `Halo RETECH,\n\nNama: ${submitted.name}\nNomor telepon/WhatsApp: ${submitted.phone}\nLayanan: ${submitted.service}\nKebutuhan: ${submitted.needs}`,
  );

  if (status === "success") {
    return (
      <div className={`lead-success ${compact ? "is-compact" : ""}`} role="status">
        <span className="lead-success-icon">✓</span>
        <strong>Inquiry sudah tersimpan.</strong>
        <p>Tim RETECH akan menghubungi Anda melalui nomor yang dicantumkan.</p>
        <a data-analytics="email_click" data-analytics-source={`${source}_success`} href={`mailto:sales@retech.id?subject=${encodeURIComponent(`Inquiry ${submitted.service} — ${submitted.name}`)}&body=${mailBody}`}>
          Kirim juga via email <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? "is-compact" : ""}`} onSubmit={submit} aria-label="Form konsultasi RETECH">
      <div className="lead-field">
        <label htmlFor={`${formId}-name`}>Nama</label>
        <input id={`${formId}-name`} name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder="Nama lengkap" aria-describedby={`${formId}-name-hint`} />
        <small id={`${formId}-name-hint`}>Gunakan huruf, spasi, titik, apostrof, atau tanda hubung.</small>
      </div>
      <div className="lead-field">
        <label htmlFor={`${formId}-phone`}>Nomor telepon / WhatsApp</label>
        <input id={`${formId}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={30} required placeholder="Contoh: 0812 3456 7890" aria-describedby={`${formId}-phone-hint`} />
        <small id={`${formId}-phone-hint`}>Gunakan 8–15 digit; awalan +62 diperbolehkan.</small>
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-service`}>Layanan</label>
        <select id={`${formId}-service`} name="service" defaultValue="" required>
          <option value="" disabled>Pilih layanan yang dibutuhkan</option>
          {SERVICE_OPTIONS.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-needs`}>Kebutuhan</label>
        <textarea id={`${formId}-needs`} name="needs" defaultValue={initialNeed} minLength={10} maxLength={2000} required rows={compact ? 3 : 5} placeholder="Ceritakan kebutuhan, kendala, atau target project Anda" />
      </div>
      <div className="lead-field lead-field-full lead-turnstile">
        <TurnstileWidget key={challengeVersion} onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); }} onUnavailable={() => { setTurnstileToken(""); setTurnstileError(true); }} />
      </div>
      <div className="lead-honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Company website</label>
        <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="lead-consent">Dengan mengirim form, Anda setuju tim RETECH menghubungi Anda untuk menindaklanjuti inquiry ini.</p>
      {status === "error" && <p className="lead-error" role="alert">{error}</p>}
      <button className="lead-submit" type="submit" disabled={status === "sending"} data-analytics="lead_form_submit_click" data-analytics-source={source}>
        {status === "sending" ? "Mengirim…" : "Kirim inquiry"}<span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
