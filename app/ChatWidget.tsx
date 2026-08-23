"use client";

import { FormEvent, useState } from "react";
import { LeadForm } from "./LeadForm";
import type { Locale } from "@/lib/i18n";

type Message = {
  role: "agent" | "user";
  text: string;
  leadForm?: boolean;
  initialNeed?: string;
};

function getAnswer(input: string, locale: Locale): Message {
  const en = locale === "en";
  const text = input.toLowerCase();
  if (/website|company profile|cms|web app|\bapp\b|application|android|ios|mobile|aplikasi/.test(text)) {
    return { role: "agent", text: en ? "RETECH builds websites, company profiles, CMS platforms, web apps, and Android and iOS applications. We start with the business need, then define the most suitable scope and solution. Would you like to discuss a new project?" : "RETECH dapat menangani website, company profile, CMS, web app, serta aplikasi Android dan iOS. Kami mulai dari kebutuhan bisnis, lalu merancang scope dan solusi yang paling sesuai. Mau konsultasi project baru?" };
  }
  if (/managed|maintenance|monitoring|helpdesk|backup|server/.test(text)) {
    return { role: "agent", text: en ? "RETECH Managed Infrastructure & IT Operations covers server maintenance, network and infrastructure monitoring, helpdesk support, and backup and restore. We also deliver real-time monitoring control centers." : "Managed Infrastructure & IT Operations RETECH mencakup maintenance server, monitoring jaringan dan infrastructure, helpdesk, serta backup & restore. Kami juga memiliki implementasi control center monitoring real-time." };
  }
  if (/remote|support|troubleshoot|gangguan|error|masalah/.test(text)) {
    return { role: "agent", text: en ? "RETECH provides remote support for troubleshooting, server installation, and configuration. Briefly describe the issue so our sales team can direct it to the right technical response." : "RETECH menyediakan remote support untuk membantu troubleshooting serta dukungan instalasi dan konfigurasi server. Jelaskan singkat kendalanya agar tim sales dapat mengarahkan penanganan." };
  }
  if (/portfolio|case stud|hasil|project|proyek|pernah buat/.test(text)) {
    return { role: "agent", text: en ? "RETECH case studies include a logistics company website, dashboards and CMS platforms, HRMS and attendance systems, and infrastructure monitoring. Customer identities and sensitive data are protected. Open /en/work to explore them." : "Case Studies RETECH mencakup website perusahaan logistik, dashboard & CMS, HRMS dan attendance, serta infrastructure monitoring. Identitas customer dan data sensitif disembunyikan. Buka /work untuk melihat tampilannya." };
  }
  if (/tentang|about|siapa retech|who is retech|what is retech|company profile|profil perusahaan|perusahaan apa/.test(text)) {
    return { role: "agent", text: en ? "PT. Retech Digital Solution (RETECH) is a B2B technology partner for digital product development, managed IT operations, and server deployment. We prioritize business needs, security, and clear delivery. Open /en/about to learn more." : "PT. Retech Digital Solution (RETECH) adalah partner teknologi B2B untuk digital product development, managed IT operations, dan server deployment. Kami mengutamakan kebutuhan bisnis, keamanan, serta delivery yang jelas. Buka /about untuk mengenal RETECH lebih lanjut." };
  }
  if (/privasi|privacy|data pribadi|keamanan data/.test(text)) {
    return { role: "agent", text: en ? "RETECH processes inquiry data on a limited basis for follow-up, security, and service improvement. We do not sell personal data. Full details are available at /en/privacy-policy." : "RETECH memproses data inquiry secara terbatas untuk tindak lanjut, keamanan, dan peningkatan layanan. Kami tidak menjual data pribadi. Detail lengkap tersedia di /privacy-policy." };
  }
  if (/alamat|address|lokasi|location|kantor|office|whatsapp|nomor wa|contact|kontak|hubungi/.test(text)) {
    return { role: "agent", text: en ? "RETECH's business address is EasyOffice Bekasi, Emerald Commercial Bekasi, UF-10, Jl. Boulevard Selatan, Margamulya, North Bekasi, Bekasi City 17142. WhatsApp +62 877-9834-7007 is available for chat only. Visits are by appointment." : "Business address RETECH berada di EasyOffice Bekasi, Emerald Commercial Bekasi, UF-10, Jl. Boulevard Selatan, Margamulya, Bekasi Utara, Kota Bekasi 17142. WhatsApp +62 877-9834-7007 tersedia untuk chat saja. Kunjungan dilakukan berdasarkan janji temu." };
  }
  if (/harga|price|pricing|cost|biaya|budget|quotation|quote|proposal|estimate|estimasi|berapa/.test(text)) {
    return { role: "agent", text: en ? "Pricing depends on scope, complexity, and target timeline. Complete the short form below so the RETECH team can prepare a more relevant estimate." : "Biaya bergantung pada scope, kompleksitas, dan target waktu. Isi detail singkat di bawah agar tim RETECH dapat menyiapkan estimasi yang lebih tepat.", leadForm: true, initialNeed: input };
  }
  if (/halo|hai|hi|hello|pagi|siang|sore|malam/.test(text)) {
    return { role: "agent", text: en ? "Hello! I am the RETECH assistant. I can explain our Digital Product Development, Managed IT Operations, Remote IT & Server Deployment, or Case Studies. What do you need?" : "Halo! Saya asisten RETECH. Saya bisa membantu menjelaskan Digital Product Development, Managed IT Operations, Remote IT & Server Deployment, atau Case Studies kami. Apa yang sedang Anda butuhkan?" };
  }
  return { role: "agent", text: en ? "I do not have enough information to answer that. Complete the short form below and the RETECH team will follow up directly." : "Saya belum punya informasi yang cukup untuk menjawab itu. Isi form singkat berikut—tim RETECH akan menindaklanjuti langsung.", leadForm: true, initialNeed: input };
}

export function ChatWidget({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const quickQuestions = en ? ["Build an app", "Managed IT", "View portfolio"] : ["Buat aplikasi", "Managed IT", "Lihat portfolio"];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: en ? "Hello! I am the RETECH assistant. Tell me about your IT needs and I will help direct you to the right solution." : "Halo! Saya asisten RETECH. Ceritakan kebutuhan IT Anda—saya bantu arahkan ke solusi yang tepat." },
  ]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: "user", text: clean }, getAnswer(clean, locale)]);
    setInput("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className={`chat-shell ${open ? "is-open" : ""}`}>
      {open && (
        <section className="chat-window" aria-label="RETECH assistant">
          <div className="chat-header">
            <div className="chat-avatar">R</div>
            <div><strong>RETECH Assistant</strong><span><i /> Online</span></div>
            <button onClick={() => setOpen(false)} aria-label={en ? "Close assistant" : "Tutup asisten"} data-analytics="chatbot_close">×</button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role} ${message.leadForm ? "has-lead-form" : ""}`} key={index}>
                <p>{message.text}</p>
                {message.leadForm && <LeadForm source="chatbot" locale={locale} compact initialNeed={message.initialNeed || messages[index - 1]?.text || ""} />}
              </div>
            ))}
          </div>
          {messages.length < 3 && <div className="quick-questions">{quickQuestions.map((question) => <button key={question} onClick={() => send(question)} data-analytics="chatbot_quick_question" data-analytics-source={question}>{question}</button>)}</div>}
          <form onSubmit={submit} className="chat-input">
            <label className="sr-only" htmlFor="chat-question">{en ? "Ask RETECH" : "Tanya RETECH"}</label>
            <input id="chat-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder={en ? "Describe what you need..." : "Tulis kebutuhan Anda..."} />
            <button type="submit" aria-label={en ? "Send message" : "Kirim pesan"} data-analytics="chatbot_message_submit">↑</button>
          </form>
        </section>
      )}
      <button className="chat-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? (en ? "Close RETECH assistant" : "Tutup asisten RETECH") : (en ? "Open RETECH assistant" : "Buka asisten RETECH")} data-analytics={open ? "chatbot_close" : "chatbot_open"}>
        {open ? "×" : <><span className="chat-mark">R</span><span className="chat-label">{en ? "Ask RETECH" : "Tanya RETECH"}</span></>}
      </button>
    </div>
  );
}
