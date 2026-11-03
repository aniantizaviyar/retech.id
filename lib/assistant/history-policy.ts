export const HISTORY_RETENTION_DAYS = 7;
export const HISTORY_PAGE_SIZE = 20;

// Best-effort masking, not a guarantee of anonymization. Names and unusual PII
// can remain, so visitor consent and the warning against sensitive input matter.
export function redactHistoryText(value: string, maximum = 6000) {
  return value.normalize("NFKC")
    .replace(/-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?-----END[\s\S]*?PRIVATE KEY-----/gi, "[KUNCI DISAMARKAN]")
    .replace(/\b(?:authorization|cookie|set-cookie)\s*:[^\r\n]*/gi, "[KREDENSIAL DISAMARKAN]")
    .replace(/\b(?:password|passwd|secret|api[ _-]?key|token)\s*[:=]\s*[^\s,;]+/gi, "[KREDENSIAL DISAMARKAN]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[TOKEN DISAMARKAN]")
    .replace(/\b(?:sk-|sb_secret_)[A-Za-z0-9_-]+/g, "[TOKEN DISAMARKAN]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL DISAMARKAN]")
    .replace(/(?:\+?62|0)[\d\s().-]{7,20}\d/g, "[NOMOR DISAMARKAN]")
    .replace(/\b\d{8,20}\b/g, "[NOMOR DISAMARKAN]")
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[TOKEN DISAMARKAN]")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .slice(0, maximum);
}

export type HistoryConversation = {
  id: string;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  locale: "id" | "en";
  preview: string;
  exchange_count: number;
  followup_status: "none" | "draft" | "submitted";
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_consented_at?: string | null;
  lead_status?: "new" | "contacted" | "in_progress" | "closed";
  pending_question?: string | null;
};
export type HistoryExchange = {
  id: string;
  created_at: string;
  question: string;
  answer: string;
  skill: string;
  provider: "guided" | "cloudflare";
  sources: Array<{ title: string; href: string }>;
  request_kind: "consultation" | "support" | null;
  request_id: string | null;
  followup_status: "none" | "draft" | "submitted";
};
export const historyReference = (id: string) => `CHAT-${id.slice(0, 8).toUpperCase()}`;
