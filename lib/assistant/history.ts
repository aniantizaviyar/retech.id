import "server-only";
import { supabaseAdminFetch } from "../supabase-admin";
import type { Answer, ChatInput } from "./contracts";
import { safeSource } from "./client";
import { redactHistoryText } from "./history-policy";
import { readDraft, type Session } from "./security";

export async function historyRpc(name: string, body: Record<string, unknown>) {
  // Callers use fixed RPC names, never a name supplied by a visitor/model.
  const response = await supabaseAdminFetch(`/rest/v1/rpc/${name}`, {
    method: "POST", body: JSON.stringify(body), signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Assistant history storage unavailable");
  return response.status === 204 ? null : response.json();
}

export async function recordExchange(input: ChatInput, answer: Answer, session: Session): Promise<boolean> {
  if (!input.historyConsent) return false;
  try {
    const draft = answer.action ? readDraft(answer.action.token, session) : null;
    return (await historyRpc("assistant_record_exchange", {
      p_session_id: session.id, p_locale: input.locale,
      p_question: redactHistoryText(input.message, 1200),
      p_answer: redactHistoryText(answer.text),
      p_skill: answer.skill, p_provider: answer.provider ?? "guided",
      p_sources: answer.sources.filter((source) => safeSource(source.href)).slice(0, 3)
        .map((source) => ({ title: redactHistoryText(source.title, 150), href: source.href })),
      p_request_id: draft?.id ?? null, p_request_kind: draft?.kind ?? null,
    })) === true;
  } catch {
    // Do not log message bodies, credentials, identifiers or raw database errors.
    // History failure must not break the public assistant or its request form.
    return false;
  }
}

export async function markHistoryRequestSubmitted(sessionId: string, requestId: string) {
  try {
    await historyRpc("assistant_history_mark_submitted", { p_session_id: sessionId, p_request_id: requestId });
  } catch { /* Existing inquiry remains saved even if history is unavailable. */ }
}
