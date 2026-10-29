import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export class AssistantError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
const sessionClaims = z
  .object({
    kind: z.literal("session"),
    id: z.uuid(),
    expires: z.number().int(),
  })
  .strict();
const draftClaims = z
  .object({
    kind: z.enum(["consultation", "support"]),
    id: z.uuid(),
    session: z.uuid(),
    summary: z.string().min(1).max(500),
    expires: z.number().int(),
  })
  .strict();
export type Session = z.infer<typeof sessionClaims>;
export type Draft = z.infer<typeof draftClaims>;
export function secret() {
  const key = process.env.RATE_LIMIT_SALT;
  if (!key || key.length < 16)
    throw new AssistantError(
      503,
      "configuration",
      "Proteksi asisten belum tersedia / assistant protection unavailable.",
    );
  return key;
}
function signature(data: string) {
  return createHmac("sha256", secret())
    .update(`retech-assistant-v1:${data}`)
    .digest("base64url");
}
export function sign(value: Session | Draft) {
  const data = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${data}.${signature(data)}`;
}
export function verify<T>(token: string, schema: z.ZodType<T>): T | null {
  if (token.length > 3000) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = Buffer.from(signature(parts[0]));
  const given = Buffer.from(parts[1]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  try {
    const result = schema.safeParse(
      JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")),
    );
    return result.success &&
      (result.data as { expires: number }).expires > Date.now()
      ? result.data
      : null;
  } catch {
    return null;
  }
}
export function cookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-retech-assistant"
    : "retech-assistant-dev";
}
export function getSession(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${cookieName()}=`))
    ?.slice(cookieName().length + 1);
  return value ? verify(value, sessionClaims) : null;
}
export function newSession(): Session {
  return {
    kind: "session",
    id: randomUUID(),
    expires: Date.now() + 30 * 60_000,
  };
}
export function sessionCookie(session: Session) {
  return `${cookieName()}=${sign(session)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=1800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function makeDraft(
  kind: Draft["kind"],
  summary: string,
  session: Session,
) {
  const claims: Draft = {
    kind,
    summary,
    id: randomUUID(),
    session: session.id,
    expires: Math.min(session.expires, Date.now() + 10 * 60_000),
  };
  return { kind, summary, token: sign(claims) };
}
export function readDraft(token: string, session: Session) {
  const value = verify(token, draftClaims);
  if (!value || value.session !== session.id)
    throw new AssistantError(
      403,
      "draft",
      "Permintaan kedaluwarsa atau tidak cocok dengan sesi / invalid request session.",
    );
  return value;
}
export function assertOrigin(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const local =
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(url.hostname);
  const validHost =
    ["retech.id", "www.retech.id"].includes(url.hostname) || local;
  if (
    !validHost ||
    origin !== url.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new AssistantError(
      403,
      "origin",
      "Asal permintaan tidak diizinkan / origin not allowed.",
    );
}
export async function boundedJson(
  request: Request,
  maximum = 12_000,
): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new AssistantError(
      415,
      "content_type",
      "Gunakan JSON / JSON required.",
    );
  if (Number(request.headers.get("content-length")) > maximum)
    throw new AssistantError(
      413,
      "size",
      "Pesan terlalu besar / message too large.",
    );
  const reader = request.body?.getReader();
  if (!reader)
    throw new AssistantError(400, "body", "Pesan kosong / empty request.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maximum) {
        await reader.cancel();
        throw new AssistantError(
          413,
          "size",
          "Pesan terlalu besar / message too large.",
        );
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof AssistantError) throw error;
    throw new AssistantError(400, "json", "JSON tidak valid / invalid JSON.");
  } finally {
    reader.releaseLock();
  }
}
function clientAddress(request: Request) {
  if (process.env.VERCEL === "1")
    return (
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown-vercel-client"
    );
  if (process.env.NODE_ENV !== "production") return "local-development";
  throw new AssistantError(
    503,
    "proxy",
    "Proteksi jaringan asisten belum dikonfigurasi / assistant network protection unavailable.",
  );
}
const rateSchema = z.array(
  z.object({
    allowed: z.boolean(),
    remaining: z.number(),
    retry_after: z.number(),
  }),
);
export async function consumeLimit(
  identity: string,
  limit: number,
  seconds: number,
  signal?: AbortSignal,
) {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new AssistantError(
      503,
      "rate_config",
      "Proteksi asisten belum tersedia / assistant protection unavailable.",
    );
  const fingerprint = createHmac("sha256", secret())
    .update(`assistant:${identity}`)
    .digest("hex");
  try {
    const response = await fetch(`${url}/rest/v1/rpc/consume_lead_rate_limit`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_fingerprint: fingerprint,
        p_limit: limit,
        p_window_seconds: seconds,
      }),
      cache: "no-store",
      signal: AbortSignal.any([
        signal ?? new AbortController().signal,
        AbortSignal.timeout(5000),
      ]),
    });
    if (!response.ok) throw new Error("Rate store unavailable");
    const result = rateSchema.parse(await response.json())[0];
    if (!result) throw new Error("Invalid rate result");
    if (!result.allowed)
      throw new AssistantError(
        429,
        String(Math.max(1, result.retry_after)),
        "Batas pesan tercapai. Coba lagi nanti / message limit reached; try later.",
      );
    return result;
  } catch (error) {
    if (error instanceof AssistantError) throw error;
    throw new AssistantError(
      503,
      "rate_unavailable",
      "Proteksi asisten sedang tidak tersedia / assistant protection temporarily unavailable.",
    );
  }
}
export async function rateRequest(
  request: Request,
  session?: Session | null,
  action = false,
) {
  await consumeLimit(
    `ip:${clientAddress(request)}:${action ? "action" : "chat"}`,
    action ? 5 : 20,
    600,
    request.signal,
  );
  if (session)
    await consumeLimit(
      `session:${session.id}:${action ? "action" : "chat"}`,
      action ? 5 : 30,
      600,
      request.signal,
    );
}
export async function verifyChallenge(
  token: string | undefined,
  request: Request,
  action: "assistant_chat" | "lead_submit",
) {
  const key =
    process.env.TURNSTILE_SECRET_KEY ||
    (process.env.NODE_ENV === "development"
      ? "1x0000000000000000000000000000000AA"
      : "");
  if (!token || !key || token.length > 2048)
    throw new AssistantError(
      403,
      "challenge",
      "Selesaikan verifikasi keamanan / complete security verification.",
    );
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: key, response: token }),
        cache: "no-store",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]),
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    if (
      !response.ok ||
      !result.success ||
      (process.env.NODE_ENV === "production" &&
        (!result.hostname ||
          !["retech.id", "www.retech.id"].includes(result.hostname) ||
          result.action !== action))
    )
      throw new Error("Invalid challenge");
  } catch {
    throw new AssistantError(
      403,
      "challenge",
      "Verifikasi kedaluwarsa. Muat ulang verifikasi / security verification expired.",
    );
  }
}
export function errorResponse(error: unknown) {
  const known = error instanceof AssistantError;
  return Response.json(
    {
      error: known
        ? error.message
        : "Asisten sementara tidak tersedia. Hubungi sales@retech.id / assistant temporarily unavailable.",
      code: known ? error.code : "unavailable",
    },
    {
      status: known ? error.status : 503,
      headers: {
        "Cache-Control": "no-store",
        ...(known && error.status === 429
          ? { "Retry-After": /^\d+$/.test(error.code) ? error.code : "60" }
          : {}),
      },
    },
  );
}
