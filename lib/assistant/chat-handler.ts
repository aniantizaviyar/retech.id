import {
  chatInput,
  toolCall,
  type Answer,
  type ChatInput,
  type Knowledge,
  type ToolCall,
} from "./contracts";
import { routeIntent, unsafeRequest } from "./domain";
import {
  assertOrigin,
  AssistantError,
  boundedJson,
  errorResponse,
  getSession,
  newSession,
  rateRequest,
  sessionCookie,
  verifyChallenge,
  type Session,
} from "./security";

type Dependencies = {
  loadKnowledge(locale: "id" | "en", signal: AbortSignal): Promise<Knowledge>;
  modelRoute(
    input: ChatInput,
    docs: Knowledge["documents"],
    signal: AbortSignal,
  ): Promise<ToolCall | null>;
  providerReady(): boolean;
  execute(
    call: ToolCall,
    knowledge: Knowledge,
    en: boolean,
    session: Session,
    signal: AbortSignal,
  ): Promise<Answer>;
};
export function createChatHandler(deps: Dependencies) {
  return async function POST(request: Request) {
    try {
      assertOrigin(request);
      const existing = getSession(request);
      await rateRequest(request, existing);
      const parsed = chatInput.safeParse(await boundedJson(request));
      if (!parsed.success)
        throw new AssistantError(
          400,
          "validation",
          "Pesan atau parameter tidak valid / invalid message or parameters.",
        );
      const input = parsed.data;
      if (!existing)
        await verifyChallenge(input.turnstileToken, request, "assistant_chat");
      const session = existing ?? newSession();
      const en = input.locale === "en";
      const encoder = new TextEncoder();
      let cancelled = false;
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: string, data: unknown) => {
            if (!cancelled && !request.signal.aborted)
              controller.enqueue(
                encoder.encode(
                  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
                ),
              );
          };
          try {
            send("ready", {
              aiAvailable: deps.providerReady(),
              sessionTtlMs: Math.max(0, session.expires - Date.now()),
            });
            send("status", {
              text: en
                ? "Checking official references…"
                : "Memeriksa referensi resmi…",
            });
            let answer: Answer;
            if (unsafeRequest(input.message))
              answer = {
                skill: "guardrail",
                sources: [],
                text: en
                  ? "I cannot reveal secrets, change permissions/prices, or follow instructions that bypass service boundaries. Please ask about a public RETECH service. Never send passwords or API tokens."
                  : "Saya tidak dapat membuka rahasia, mengubah hak akses/harga, atau mengikuti instruksi yang melewati batas layanan. Tanyakan layanan publik RETECH. Jangan mengirim password atau API token.",
              };
            else {
              const knowledge = await deps.loadKnowledge(
                input.locale,
                request.signal,
              );
              if (cancelled || request.signal.aborted) return;
              let call = routeIntent(input);
              let provider: Answer["provider"] = "guided";
              if (!call && input.aiConsent && deps.providerReady()) {
                try {
                  call = await deps.modelRoute(
                    input,
                    knowledge.documents,
                    request.signal,
                  );
                  if (call) provider = "cloudflare";
                } catch {
                  /* Safe guided fallback: no raw provider errors or prompts in logs. */
                }
              }
              const valid = toolCall.safeParse(call);
              answer = valid.success
                ? await deps.execute(
                    valid.data,
                    knowledge,
                    en,
                    session,
                    request.signal,
                  )
                : {
                    skill: "clarification",
                    sources: [],
                    text: en
                      ? "Please specify the RETECH product/service and what you need: information, a price estimate, consultation, support, or public-page status."
                      : "Sebutkan produk/layanan RETECH dan kebutuhanmu: informasi, estimasi harga, konsultasi, support, atau status halaman publik.",
                  };
              answer.provider = provider;
            }
            const chunks = answer.text.match(/[\s\S]{1,120}/gu) ?? [];
            for (const text of chunks) send("delta", { text });
            send("done", answer);
          } catch {
            send("error", {
              text: en
                ? "The assistant is temporarily unavailable. Please retry or contact sales@retech.id."
                : "Asisten sementara tidak tersedia. Coba lagi atau hubungi sales@retech.id.",
            });
          } finally {
            if (!cancelled) controller.close();
          }
        },
        cancel() {
          cancelled = true;
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store, no-transform",
          "X-Content-Type-Options": "nosniff",
          "X-Accel-Buffering": "no",
          ...(!existing ? { "Set-Cookie": sessionCookie(session) } : {}),
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
