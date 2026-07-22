"use client";

import { FormEvent, useState } from "react";
import { LeadForm } from "./LeadForm";

type Message = {
  role: "agent" | "user";
  text: string;
  leadForm?: boolean;
  initialNeed?: string;
};

const quickQuestions = ["Buat aplikasi", "Managed IT", "Lihat portfolio"];

function getAnswer(input: string): Message {
  const text = input.toLowerCase();
  if (/website|company profile|cms|web app|android|ios|mobile|aplikasi/.test(text)) {
    return { role: "agent", text: "RETECH dapat menangani website, company profile, CMS, web app, serta aplikasi Android dan iOS. Kami mulai dari kebutuhan bisnis, lalu merancang scope dan solusi yang paling sesuai. Mau konsultasi project baru?" };
  }
  if (/managed|maintenance|monitoring|helpdesk|backup|server/.test(text)) {
    return { role: "agent", text: "Managed Infrastructure & IT Operations RETECH mencakup maintenance server, monitoring jaringan dan infrastructure, helpdesk, serta backup & restore. Kami juga memiliki implementasi control center monitoring real-time." };
  }
  if (/remote|support|troubleshoot|gangguan|error|masalah/.test(text)) {
    return { role: "agent", text: "RETECH menyediakan remote support untuk membantu troubleshooting serta dukungan instalasi dan konfigurasi server. Jelaskan singkat kendalanya agar tim sales dapat mengarahkan penanganan." };
  }
  if (/portfolio|case stud|hasil|project|proyek|pernah buat/.test(text)) {
    return { role: "agent", text: "Case Studies RETECH mencakup website perusahaan logistik, dashboard & CMS, HRMS dan attendance, serta infrastructure monitoring. Identitas customer dan data sensitif disembunyikan. Buka /work untuk melihat tampilannya." };
  }
  if (/harga|biaya|budget|quotation|proposal|estimasi|berapa/.test(text)) {
    return { role: "agent", text: "Biaya bergantung pada scope, kompleksitas, dan target waktu. Isi detail singkat di bawah agar tim RETECH dapat menyiapkan estimasi yang lebih tepat.", leadForm: true, initialNeed: input };
  }
  if (/halo|hai|hi|hello|pagi|siang|sore|malam/.test(text)) {
    return { role: "agent", text: "Halo! Saya asisten RETECH. Saya bisa membantu menjelaskan Digital Product Development, Managed IT Operations, Remote IT & Server Deployment, atau Case Studies kami. Apa yang sedang Anda butuhkan?" };
  }
  return { role: "agent", text: "Saya belum punya informasi yang cukup untuk menjawab itu. Isi form singkat berikut—tim RETECH akan menindaklanjuti langsung.", leadForm: true, initialNeed: input };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: "Halo! Saya asisten RETECH. Ceritakan kebutuhan IT Anda—saya bantu arahkan ke solusi yang tepat." },
  ]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: "user", text: clean }, getAnswer(clean)]);
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
            <button onClick={() => setOpen(false)} aria-label="Close assistant" data-analytics="chatbot_close">×</button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role} ${message.leadForm ? "has-lead-form" : ""}`} key={index}>
                <p>{message.text}</p>
                {message.leadForm && <LeadForm source="chatbot" compact initialNeed={message.initialNeed || messages[index - 1]?.text || ""} />}
              </div>
            ))}
          </div>
          {messages.length < 3 && <div className="quick-questions">{quickQuestions.map((question) => <button key={question} onClick={() => send(question)} data-analytics="chatbot_quick_question" data-analytics-source={question}>{question}</button>)}</div>}
          <form onSubmit={submit} className="chat-input">
            <label className="sr-only" htmlFor="chat-question">Ask RETECH</label>
            <input id="chat-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis kebutuhan Anda..." />
            <button type="submit" aria-label="Send message" data-analytics="chatbot_message_submit">↑</button>
          </form>
        </section>
      )}
      <button className="chat-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close RETECH assistant" : "Open RETECH assistant"} data-analytics={open ? "chatbot_close" : "chatbot_open"}>
        {open ? "×" : <><span className="chat-mark">R</span><span className="chat-label">Ask RETECH</span></>}
      </button>
    </div>
  );
}
