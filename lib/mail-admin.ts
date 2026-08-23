import "server-only";

import { createHmac } from "node:crypto";
import { getSupabaseAdminConfig } from "./supabase-admin";

const DEFAULT_MAIL_ADMIN_URL = "https://mail.retech.id/api/v1/mailboxes";

function mailAdminToken() {
  const { key } = getSupabaseAdminConfig();
  return createHmac("sha256", key).update("retech-mail-admin-v1").digest("base64url");
}

function mailAdminUrl(path = "") {
  const base = (process.env.MAIL_ADMIN_API_URL || DEFAULT_MAIL_ADMIN_URL).replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (url.protocol !== "https:") throw new Error("Mail admin API must use HTTPS");
  return url.toString();
}

export async function mailAdminFetch(path = "", init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${mailAdminToken()}`);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(mailAdminUrl(path), {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}
