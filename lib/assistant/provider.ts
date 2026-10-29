import "server-only";
import {
  functionTools,
  toolCall,
  type ChatInput,
  type Document,
  type ToolCall,
} from "./contracts";
import { redactForModel, retrieve, SYSTEM_PROMPT } from "./domain";
import { consumeLimit } from "./security";

export function providerReady() {
  return (
    process.env.ASSISTANT_AI_ENABLED === "true" &&
    /^[a-f0-9]{32}$/i.test(process.env.CLOUDFLARE_AI_ACCOUNT_ID ?? "") &&
    !!process.env.CLOUDFLARE_AI_TOKEN
  );
}
export async function modelRoute(
  input: ChatInput,
  documents: Document[],
  signal: AbortSignal,
): Promise<ToolCall | null> {
  if (!input.aiConsent || !providerReady()) return null;
  // Global, persistent application cap. No retries, paid-model fallback or arbitrary base URL.
  await consumeLimit(
    `cloudflare-global:${new Date().toISOString().slice(0, 10)}`,
    40,
    86400,
    signal,
  );
  const matches = retrieve(input.message, documents);
  const context = (
    matches.length
      ? matches
      : documents.filter(
          (d) =>
            d.id.startsWith("service:") ||
            ["product:attendance", "product:qr-order-pos", "vps"].includes(
              d.id,
            ),
        )
  )
    .slice(0, 5)
    .map((d) => ({
      title: d.title.slice(0, 100),
      facts: d.text.slice(0, 350),
    }));
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_AI_ACCOUNT_ID}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        temperature: 0,
        max_tokens: 256,
        parallel_tool_calls: false,
        tools: functionTools,
        tool_choice: "auto",
        options: { rejectIfBusy: true },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              public_reference_data: context,
              prior_user_messages: input.history
                .slice(-3)
                .map((m) => redactForModel(m.text).slice(0, 300)),
              question: redactForModel(input.message),
            }),
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    },
  );
  if (!response.ok) return null;
  const raw = await response.text();
  if (raw.length > 16000) return null;
  try {
    const json = JSON.parse(raw) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{
            type?: string;
            function?: { name?: string; arguments?: string };
          }>;
        };
      }>;
    };
    const calls = json.choices?.[0]?.message?.tool_calls;
    if (!calls || calls.length !== 1 || calls[0].type !== "function")
      return null;
    const parsed = toolCall.safeParse({
      name: calls[0].function?.name,
      arguments: JSON.parse(calls[0].function?.arguments ?? "{}"),
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
