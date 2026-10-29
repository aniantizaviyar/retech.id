import type { Answer, Source } from "./contracts";

export function safeSource(href: string) {
  return (
    /^\/(?:en\/)?(?:products\/[a-z0-9-]+|services\/[a-z0-9-]+|pricing|faq|work|about|privacy-policy|#contact)$/.test(
      href,
    ) || ["https://retech.id/", "https://absensi.retech.id/"].includes(href)
  );
}
export function readAnswer(value: unknown): Answer | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.text !== "string" ||
    v.text.length > 12000 ||
    typeof v.skill !== "string" ||
    ![
      "search_information",
      "estimate_price",
      "request_consultation",
      "create_support_request",
      "check_service_status",
      "guardrail",
      "clarification",
    ].includes(v.skill) ||
    !Array.isArray(v.sources) ||
    v.sources.length > 3
  )
    return null;
  const sources: Source[] = [];
  for (const source of v.sources) {
    if (
      !source ||
      typeof source !== "object" ||
      typeof source.title !== "string" ||
      typeof source.href !== "string" ||
      source.title.length > 150 ||
      !safeSource(source.href)
    )
      return null;
    sources.push({ title: source.title, href: source.href });
  }
  const answer: Answer = {
    text: v.text,
    skill: v.skill,
    sources,
    provider: v.provider === "cloudflare" ? "cloudflare" : "guided",
  };
  if (v.action !== undefined) {
    if (!v.action || typeof v.action !== "object") return null;
    const action = v.action as Record<string, unknown>;
    if (
      !["consultation", "support"].includes(String(action.kind)) ||
      typeof action.summary !== "string" ||
      action.summary.length > 500 ||
      typeof action.token !== "string" ||
      action.token.length > 3000
    )
      return null;
    answer.action = {
      kind: action.kind as "consultation" | "support",
      summary: action.summary,
      token: action.token,
    };
  }
  return answer;
}
