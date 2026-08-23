"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { getServiceOptions, validateLeadInput } from "@/lib/leads";
import { TurnstileWidget } from "./TurnstileWidget";
import { trackSiteEvent } from "@/components/AnalyticsEvents";
import { localePath, type Locale } from "@/lib/i18n";

type LeadFormProps = {
  source: "chatbot" | "contact";
  compact?: boolean;
  initialNeed?: string;
  locale: Locale;
};

export function LeadForm({ source, locale, compact = false, initialNeed = "" }: LeadFormProps) {
  const en = locale === "en";
  const serviceOptions = getServiceOptions(locale);
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
      locale,
    };

    const validation = validateLeadInput(payload, locale);
    if (!validation.ok) {
      setStatus("error");
      setError(validation.error);
      (form.elements.namedItem(validation.field) as HTMLElement | null)?.focus();
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setError(turnstileError ? (en ? "Security verification could not load. Reload the page and try again." : "Verifikasi keamanan tidak dapat dimuat. Muat ulang halaman lalu coba lagi.") : (en ? "Complete the security verification first." : "Selesaikan verifikasi keamanan terlebih dahulu."));
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, company: payload.company, source, turnstileToken, locale }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || (en ? "The inquiry could not be sent." : "Inquiry belum dapat dikirim."));

      setSubmitted(validation.data);
      setStatus("success");
      trackSiteEvent("generate_lead", {
        form_source: source,
        service: validation.data.service,
        page_path: window.location.pathname,
      });
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : (en ? "Something went wrong. Please try again." : "Terjadi kendala. Silakan coba lagi."));
      setStatus("error");
      setTurnstileToken("");
      setChallengeVersion((version) => version + 1);
    }
  }

  const mailBody = encodeURIComponent(
    en
      ? `Hello RETECH,\n\nName: ${submitted.name}\nPhone/WhatsApp: ${submitted.phone}\nService: ${submitted.service}\nRequirements: ${submitted.needs}`
      : `Halo RETECH,\n\nNama: ${submitted.name}\nNomor telepon/WhatsApp: ${submitted.phone}\nLayanan: ${submitted.service}\nKebutuhan: ${submitted.needs}`,
  );

  if (status === "success") {
    return (
      <div className={`lead-success ${compact ? "is-compact" : ""}`} role="status">
        <span className="lead-success-icon">✓</span>
        <strong>{en ? "Your inquiry has been saved." : "Inquiry sudah tersimpan."}</strong>
        <p>{en ? "The RETECH team will contact you through the number provided." : "Tim RETECH akan menghubungi Anda melalui nomor yang dicantumkan."}</p>
        <a data-analytics="email_click" data-analytics-source={`${source}_success`} href={`mailto:sales@retech.id?subject=${encodeURIComponent(`Inquiry ${submitted.service} — ${submitted.name}`)}&body=${mailBody}`}>
          {en ? "Also send by email" : "Kirim juga via email"} <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? "is-compact" : ""}`} onSubmit={submit} aria-label={en ? "RETECH consultation form" : "Form konsultasi RETECH"} data-clarity-mask="true">
      <div className="lead-field">
        <label htmlFor={`${formId}-name`}>{en ? "Name" : "Nama"}</label>
        <input id={`${formId}-name`} name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder={en ? "Full name" : "Nama lengkap"} aria-describedby={`${formId}-name-hint`} />
        <small id={`${formId}-name-hint`}>{en ? "Use letters, spaces, periods, apostrophes, or hyphens." : "Gunakan huruf, spasi, titik, apostrof, atau tanda hubung."}</small>
      </div>
      <div className="lead-field">
        <label htmlFor={`${formId}-phone`}>{en ? "Phone number / WhatsApp" : "Nomor telepon / WhatsApp"}</label>
        <input id={`${formId}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={30} required placeholder={en ? "Example: +62 812 3456 7890" : "Contoh: 0812 3456 7890"} aria-describedby={`${formId}-phone-hint`} />
        <small id={`${formId}-phone-hint`}>{en ? "Use 8–15 digits; a +62 prefix is accepted." : "Gunakan 8–15 digit; awalan +62 diperbolehkan."}</small>
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-service`}>{en ? "Service" : "Layanan"}</label>
        <select id={`${formId}-service`} name="service" defaultValue="" required>
          <option value="" disabled>{en ? "Select the service you need" : "Pilih layanan yang dibutuhkan"}</option>
          {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-needs`}>{en ? "Requirements" : "Kebutuhan"}</label>
        <textarea id={`${formId}-needs`} name="needs" defaultValue={initialNeed} minLength={10} maxLength={2000} required rows={compact ? 3 : 5} placeholder={en ? "Describe your requirements, challenges, or project goals" : "Ceritakan kebutuhan, kendala, atau target project Anda"} />
      </div>
      <div className="lead-field lead-field-full lead-turnstile">
        <TurnstileWidget key={challengeVersion} locale={locale} onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); }} onUnavailable={() => { setTurnstileToken(""); setTurnstileError(true); }} />
      </div>
      <div className="lead-honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>{en ? "Company website" : "Website perusahaan"}</label>
        <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="lead-consent">{en ? "By submitting this form, you agree that RETECH may contact you to follow up on this inquiry and confirm that you have read the " : "Dengan mengirim form, Anda setuju tim RETECH menghubungi Anda untuk menindaklanjuti inquiry ini dan telah membaca "}<Link href={localePath(locale, "/privacy-policy")}>{en ? "Privacy Policy" : "Kebijakan Privasi"}</Link>.</p>
      {status === "error" && <p className="lead-error" role="alert">{error}</p>}
      <button className="lead-submit" type="submit" disabled={status === "sending"} data-analytics="lead_form_submit_click" data-analytics-source={source}>
        {status === "sending" ? (en ? "Sending…" : "Mengirim…") : (en ? "Send inquiry" : "Kirim inquiry")}<span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
