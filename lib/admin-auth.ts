import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

export const ADMIN_EMAIL = "admin@retech.id";
export const ADMIN_COOKIE = "retech_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

type SessionPayload = { email: string; exp: number; nonce: string };

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SECRET_KEY;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(`retech-admin:${value}`).digest("base64url");
}

export function createAdminSession() {
  const payload: SessionPayload = {
    email: ADMIN_EMAIL,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    nonce: randomBytes(18).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { value: `${encoded}.${sign(encoded)}`, maxAge: SESSION_SECONDS };
}

export function verifyAdminSessionValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (payload.email !== ADMIN_EMAIL || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashAdminCode(email: string, code: string) {
  return createHmac("sha256", sessionSecret()).update(`retech-admin-code:${email.toLowerCase()}:${code}`).digest("hex");
}

export function safeCodeMatch(expected: string, actual: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAllowedAdminHost(hostValue: string | null) {
  const host = (hostValue || "").split(":")[0].toLowerCase();
  if (process.env.NODE_ENV !== "production") return host === "localhost" || host === "127.0.0.1" || host === "admin.retech.id";
  return host === "admin.retech.id";
}

export function isAllowedAdminOrigin(originValue: string | null) {
  if (!originValue) return false;
  try {
    const origin = new URL(originValue);
    return isAllowedAdminHost(origin.host) && (origin.protocol === "https:" || process.env.NODE_ENV !== "production");
  } catch {
    return false;
  }
}

export async function getAdminSession() {
  const requestHeaders = await headers();
  if (!isAllowedAdminHost(requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"))) return null;
  return verifyAdminSessionValue((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function readAdminSessionFromRequest(request: Request, requireOrigin = false) {
  if (!isAllowedAdminHost(request.headers.get("x-forwarded-host") || request.headers.get("host"))) return null;
  if (requireOrigin && !isAllowedAdminOrigin(request.headers.get("origin"))) return null;
  const cookieHeader = request.headers.get("cookie") || "";
  const value = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  return verifyAdminSessionValue(value ? decodeURIComponent(value) : null);
}
