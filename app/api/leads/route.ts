import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createHmac } from "node:crypto";
import { validateLeadInput } from "@/lib/leads";

export const runtime = "nodejs";

type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  service?: unknown;
  needs?: unknown;
  source?: unknown;
  company?: unknown;
  turnstileToken?: unknown;
};

type RateLimitResult = { allowed: boolean; remaining: number; retry_after: number };
type TurnstileResult = { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[] };

const TEST_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
  })[character] || character);
}

function getClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

async function consumeRateLimit(
  supabaseUrl: string,
  secretKey: string,
  request: Request,
): Promise<RateLimitResult | null> {
  const salt = process.env.RATE_LIMIT_SALT || (process.env.NODE_ENV === "development" ? "retech-local-rate-limit" : "");
  if (!salt) return null;

  const identity = `${getClientAddress(request)}:${request.headers.get("user-agent") || "unknown"}`;
  const fingerprint = createHmac("sha256", salt).update(identity).digest("hex");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_lead_rate_limit`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_fingerprint: fingerprint, p_limit: 5, p_window_seconds: 600 }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Lead rate-limit check failed", response.status, await response.text());
    return null;
  }

  const result = (await response.json()) as RateLimitResult[];
  return result[0] || null;
}

async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY
    || (process.env.NODE_ENV === "development" ? TEST_TURNSTILE_SECRET : "");
  if (!secret || !token || token.length > 2048) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: getClientAddress(request) }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return false;

    const result = (await response.json()) as TurnstileResult;
    if (!result.success) return false;
    if (process.env.NODE_ENV === "production" && result.action !== "lead_submit") return false;
    if (process.env.NODE_ENV === "production" && result.hostname !== "retech.id" && result.hostname !== "www.retech.id") return false;
    return true;
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}

async function notifySales(lead: { name: string; phone: string; service: string; needs: string; source: string }) {
  const subject = `Inquiry RETECH: ${lead.service} — ${lead.name}`;
  const html = `<h2>Inquiry baru dari retech.id</h2><p><strong>Nama:</strong> ${escapeHtml(lead.name)}</p><p><strong>Telepon/WhatsApp:</strong> ${escapeHtml(lead.phone)}</p><p><strong>Layanan:</strong> ${escapeHtml(lead.service)}</p><p><strong>Kebutuhan:</strong><br>${escapeHtml(lead.needs).replace(/\n/g, "<br>")}</p><p><strong>Sumber:</strong> ${escapeHtml(lead.source)}</p>`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.LEAD_NOTIFICATION_FROM;
  const smtpTo = process.env.LEAD_NOTIFICATION_TO;

  if (smtpHost && smtpUser && smtpPassword && smtpFrom && smtpTo) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        requireTLS: smtpPort !== 465,
        auth: { user: smtpUser, pass: smtpPassword },
      });
      await transporter.sendMail({ from: smtpFrom, to: smtpTo, replyTo: smtpFrom, subject, html });
      return "sent" as const;
    } catch (error) {
      console.error("SMTP lead notification failed", error);
      return "failed" as const;
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_TO;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  if (!apiKey || !to || !from) return "not_configured" as const;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });
  return response.ok ? "sent" as const : "failed" as const;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 20_000) return NextResponse.json({ error: "Data terlalu besar." }, { status: 413 });

    const body = (await request.json()) as LeadPayload;
    if (text(body.company, 200)) return NextResponse.json({ ok: true });

    const validation = validateLeadInput(body as Record<string, unknown>);
    if (!validation.ok) return NextResponse.json({ error: validation.error, field: validation.field }, { status: 400 });

    const source = body.source === "chatbot" ? "chatbot" : body.source === "contact" ? "contact" : "";
    if (!source) return NextResponse.json({ error: "Sumber inquiry tidak valid." }, { status: 400 });

    const lead = { ...validation.data, source };

    const supabaseUrl = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !secretKey) {
      console.error("Supabase environment is not configured");
      return NextResponse.json({ error: "Layanan inquiry sedang dikonfigurasi." }, { status: 503 });
    }

    const rateLimit = await consumeRateLimit(supabaseUrl, secretKey, request);
    if (!rateLimit) return NextResponse.json({ error: "Proteksi inquiry sedang tidak tersedia. Silakan coba lagi." }, { status: 503 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Silakan tunggu beberapa menit lalu coba lagi." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retry_after), "RateLimit-Limit": "5", "RateLimit-Remaining": "0" } },
      );
    }

    const turnstileToken = text(body.turnstileToken, 2048);
    if (!(await verifyTurnstile(turnstileToken, request))) {
      return NextResponse.json({ error: "Verifikasi keamanan gagal atau kedaluwarsa. Silakan coba lagi." }, { status: 403 });
    }

    const emailStatus = await notifySales(lead);
    const databaseResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ...lead, email_status: emailStatus }),
    });

    if (!databaseResponse.ok) {
      console.error("Supabase lead insert failed", databaseResponse.status, await databaseResponse.text());
      return NextResponse.json({ error: "Inquiry belum dapat disimpan. Silakan coba lagi." }, { status: 502 });
    }

    return NextResponse.json(
      { ok: true, notified: emailStatus === "sent" },
      { status: 201, headers: { "RateLimit-Limit": "5", "RateLimit-Remaining": String(rateLimit.remaining) } },
    );
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Terjadi kendala. Silakan coba lagi." }, { status: 500 });
  }
}
