"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./ChatWidget.module.css";
const ChatPanel = dynamic(() => import("./assistant/ChatPanel"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      style={{
        background: "#fff",
        color: "#112738",
        padding: 20,
        borderRadius: 16,
      }}
    >
      Loading RETECH Assistant…
    </div>
  ),
});
export function ChatWidget({ locale = "id" }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const en = locale === "en";
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div className={`chat-shell ${open ? `is-open ${styles.open}` : ""}`}>
      {open && <ChatPanel locale={locale} onClose={close} />}
      <button
        ref={trigger}
        className="chat-trigger"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={open ? "retech-assistant-dialog" : undefined}
        aria-label={
          open
            ? en
              ? "Close RETECH assistant"
              : "Tutup asisten RETECH"
            : en
              ? "Open RETECH assistant"
              : "Buka asisten RETECH"
        }
        data-analytics={open ? "chatbot_close" : "chatbot_open"}
      >
        {open ? (
          "×"
        ) : (
          <>
            <span className="chat-mark">R</span>
            <span className="chat-label">
              {en ? "Ask RETECH" : "Tanya RETECH"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
