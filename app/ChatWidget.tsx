"use client";

import { FormEvent, useState } from "react";

type Message = { role: "agent" | "user"; text: string; email?: boolean };

const quickQuestions = ["Buat website", "Managed IT", "Remote support"];

function getAnswer(input: string): Message {
  const text = input.toLowerCase();
  if (/website|company profile|cms|web app|android|ios|mobile|aplikasi/.test(text)) {
    return { role: "agent", text: "RETECH dapat menangani website, company profile, CMS, web app, serta aplikasi Android dan iOS. Kami mulai dari kebutuhan bisnis, lalu merancang scope dan solusi yang paling sesuai. Mau konsultasi project baru?" };
  }
  if (/managed|maintenance|monitoring|helpdesk|backup|server/.test(text)) {
    return { role: "agent", text: "Managed IT Services RETECH mencakup maintenance server, monitoring, helpdesk, dan backup. Kami juga menangani instalasi serta konfigurasi server sesuai kebutuhan operasional." };
  }
  if (/remote|support|troubleshoot|gangguan|error|masalah/.test(text)) {
    return { role: "agent", text: "RETECH menyediakan remote support untuk membantu troubleshooting serta dukungan instalasi dan konfigurasi server. Jelaskan singkat kendalanya agar tim sales dapat mengarahkan penanganan." };
  }
  if (/harga|biaya|budget|quotation|proposal|estimasi|berapa/.test(text)) {
    return { role: "agent", text: "Biaya bergantung pada scope, kompleksitas, dan target waktu. Kirim gambaran kebutuhan Anda ke sales@retech.id agar tim RETECH bisa menyiapkan estimasi yang tepat.", email: true };
  }
  if (/halo|hai|hi|hello|pagi|siang|sore|malam/.test(text)) {
    return { role: "agent", text: "Halo! Saya asisten RETECH. Saya bisa membantu menjelaskan Website & Mobile Development, Managed IT Services, atau Remote Support. Apa yang sedang Anda butuhkan?" };
  }
  return { role: "agent", text: "Saya belum punya informasi yang cukup untuk menjawab itu. Tim RETECH akan dengan senang hati membantu langsung melalui sales@retech.id.", email: true };
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
            <button onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={index}>
                <p>{message.text}</p>
                {message.email && <a href={`mailto:sales@retech.id?subject=Pertanyaan%20dari%20Website%20RETECH&body=${encodeURIComponent(`Halo RETECH,\n\nSaya ingin bertanya tentang: ${messages[index - 1]?.text || "layanan RETECH"}`)}`}>Email sales@retech.id ↗</a>}
              </div>
            ))}
          </div>
          {messages.length < 3 && <div className="quick-questions">{quickQuestions.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
          <form onSubmit={submit} className="chat-input">
            <label className="sr-only" htmlFor="chat-question">Ask RETECH</label>
            <input id="chat-question" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis kebutuhan Anda..." />
            <button type="submit" aria-label="Send message">↑</button>
          </form>
        </section>
      )}
      <button className="chat-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close RETECH assistant" : "Open RETECH assistant"}>
        {open ? "×" : <><span className="chat-mark">R</span><span className="chat-label">Ask RETECH</span></>}
      </button>
    </div>
  );
}
