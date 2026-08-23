import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import { ADMIN_EMAIL, hashAdminCode, isAllowedAdminHost, isAllowedAdminOrigin } from "@/lib/admin-auth";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const TEST_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY || (process.env.NODE_ENV !== "production" ? TEST_TURNSTILE_SECRET : "");
  if (!secret) {
    console.error("Admin Turnstile secret is not configured");
    return { valid: false, reason: "configuration" as const };
  }
  if (!token || token.length > 2048) return { valid: false, reason: "token" as const };
  try {
    const form = new URLSearchParams({
      secret,
      response: token,
    });
    const remoteip = clientAddress(request);
    if (remoteip !== "unknown") form.set("remoteip", remoteip);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return { valid: false, reason: "upstream" as const };
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string; "error-codes"?: string[] };
    const valid = result.success
      && result.action === "admin_login"
      && (process.env.NODE_ENV !== "production" || result.hostname === "admin.retech.id");
    if (!valid) {
      console.warn("Admin Turnstile verification rejected", {
        success: result.success,
        action: result.action,
        hostname: result.hostname,
        errorCodes: result["error-codes"],
      });
      const errors = result["error-codes"] || [];
      if (errors.includes("missing-input-secret") || errors.includes("invalid-input-secret")) {
        return { valid: false, reason: "configuration" as const };
      }
      if (errors.includes("timeout-or-duplicate")) {
        return { valid: false, reason: "expired" as const };
      }
      if (result.success && (result.action !== "admin_login" || (process.env.NODE_ENV === "production" && result.hostname !== "admin.retech.id"))) {
        return { valid: false, reason: "context" as const };
      }
      return { valid: false, reason: "token" as const };
    }
    return { valid: true as const };
  } catch (error) {
    console.warn("Admin Turnstile verification unavailable", error instanceof Error ? error.message : "Unknown error");
    return { valid: false, reason: "upstream" as const };
  }
}

function turnstileError(reason: "configuration" | "token" | "expired" | "context" | "upstream" | undefined) {
  if (reason === "configuration") return "Konfigurasi keamanan server belum cocok. Administrator perlu memperbarui secret key Turnstile.";
  if (reason === "expired") return "Verifikasi keamanan sudah terpakai atau kedaluwarsa. Widget telah dimuat ulang; silakan verifikasi lagi.";
  if (reason === "context") return "Verifikasi keamanan berasal dari domain atau proses yang tidak sesuai.";
  if (reason === "upstream") return "Layanan verifikasi keamanan sedang tidak dapat dijangkau. Silakan coba kembali.";
  return "Token verifikasi keamanan tidak valid. Widget telah dimuat ulang; silakan verifikasi lagi.";
}

async function sendLoginCode(code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.ADMIN_LOGIN_FROM || process.env.LEAD_NOTIFICATION_FROM || user;
  if (!host || !user || !pass || !from) throw new Error("SMTP is not configured");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from,
    to: ADMIN_EMAIL,
    subject: `Kode login RETECH CMS: ${code}`,
    text: `Kode login RETECH CMS Anda adalah ${code}. Kode berlaku selama 10 menit. Jika Anda tidak meminta kode ini, abaikan email ini.`,
    html: `<div style="font-family:Arial,sans-serif;background:#07131e;color:#eaf6ff;padding:32px"><p style="color:#24c8f2;letter-spacing:.12em">RETECH ADMIN CMS</p><h1 style="font-size:36px;letter-spacing:.16em">${code}</h1><p>Kode ini berlaku selama 10 menit dan hanya dapat digunakan satu kali.</p><p style="color:#8ba5b7">Jika Anda tidak meminta kode ini, abaikan email ini.</p></div>`,
  });
}

export async function POST(request: Request) {
  if (!isAllowedAdminHost(request.headers.get("x-forwarded-host") || request.headers.get("host")) || !isAllowedAdminOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    const body = await request.json() as { email?: unknown; turnstileToken?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Email tidak memiliki akses ke CMS." }, { status: 403 });
    const turnstile = await verifyTurnstile(token, request);
    if (!turnstile.valid) return NextResponse.json({ error: turnstileError(turnstile.reason) }, { status: 403 });

    const since = encodeURIComponent(new Date(Date.now() - 15 * 60_000).toISOString());
    const countResponse = await supabaseAdminFetch(`/rest/v1/cms_admin_login_codes?select=id&email=eq.${encodeURIComponent(ADMIN_EMAIL)}&created_at=gte.${since}`, {
      headers: { Prefer: "count=exact" },
    });
    const countRange = countResponse.headers.get("content-range") || "0/0";
    const recentCount = Number(countRange.split("/")[1] || "0");
    if (recentCount >= 5) return NextResponse.json({ error: "Terlalu banyak permintaan kode. Coba lagi dalam 15 menit." }, { status: 429 });

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const insertResponse = await supabaseAdminFetch("/rest/v1/cms_admin_login_codes", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ email: ADMIN_EMAIL, code_hash: hashAdminCode(ADMIN_EMAIL, code), expires_at: new Date(Date.now() + 10 * 60_000).toISOString() }),
    });
    if (!insertResponse.ok) throw new Error("Could not store login code");
    await sendLoginCode(code);
    return NextResponse.json({ ok: true, message: "Kode login telah dikirim ke admin@retech.id." });
  } catch (error) {
    console.error("Admin login request failed", error);
    return NextResponse.json({ error: "Kode login belum dapat dikirim. Periksa konfigurasi email lalu coba lagi." }, { status: 503 });
  }
}
