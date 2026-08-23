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
  if (!secret || !token || token.length > 2048) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: clientAddress(request) }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string };
    if (!result.success || result.action !== "admin_login") return false;
    if (process.env.NODE_ENV === "production" && result.hostname !== "admin.retech.id") return false;
    return true;
  } catch {
    return false;
  }
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
    if (!(await verifyTurnstile(token, request))) return NextResponse.json({ error: "Verifikasi keamanan gagal atau kedaluwarsa." }, { status: 403 });

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
