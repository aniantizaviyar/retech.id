"use client";

import { FormEvent, useId, useState } from "react";

type LeadFormProps = {
  source: "chatbot" | "contact";
  compact?: boolean;
  initialNeed?: string;
};

const serviceOptions = [
  "Website & Mobile Application",
  "Managed IT Services",
  "Remote Support",
  "Server Installation & Configuration",
  "Konsultasi kebutuhan lainnya",
];

export function LeadForm({ source, compact = false, initialNeed = "" }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState({ name: "", phone: "", service: "", needs: "" });
  const formId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
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

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Inquiry belum dapat dikirim.");

      setSubmitted(payload);
      setStatus("success");
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Terjadi kendala. Silakan coba lagi.");
      setStatus("error");
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
        <a href={`mailto:sales@retech.id?subject=${encodeURIComponent(`Inquiry ${submitted.service} — ${submitted.name}`)}&body=${mailBody}`}>
          Kirim juga via email <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? "is-compact" : ""}`} onSubmit={submit} aria-label="Form konsultasi RETECH">
      <div className="lead-field">
        <label htmlFor={`${formId}-name`}>Nama</label>
        <input id={`${formId}-name`} name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="Nama lengkap" />
      </div>
      <div className="lead-field">
        <label htmlFor={`${formId}-phone`}>Nomor telepon / WhatsApp</label>
        <input id={`${formId}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={30} required placeholder="Contoh: 0812 3456 7890" />
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-service`}>Layanan</label>
        <select id={`${formId}-service`} name="service" defaultValue="" required>
          <option value="" disabled>Pilih layanan yang dibutuhkan</option>
          {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </div>
      <div className="lead-field lead-field-full">
        <label htmlFor={`${formId}-needs`}>Kebutuhan</label>
        <textarea id={`${formId}-needs`} name="needs" defaultValue={initialNeed} minLength={3} maxLength={2000} required rows={compact ? 3 : 5} placeholder="Ceritakan kebutuhan, kendala, atau target project Anda" />
      </div>
      <div className="lead-honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Company website</label>
        <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="lead-consent">Dengan mengirim form, Anda setuju tim RETECH menghubungi Anda untuk menindaklanjuti inquiry ini.</p>
      {status === "error" && <p className="lead-error" role="alert">{error}</p>}
      <button className="lead-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Mengirim…" : "Kirim inquiry"}<span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
