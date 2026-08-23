import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_EMAIL, createAdminSession, hashAdminCode, isAllowedAdminHost, isAllowedAdminOrigin, safeCodeMatch } from "@/lib/admin-auth";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type LoginCodeRow = { id: string; code_hash: string; expires_at: string; attempt_count: number };

export async function POST(request: Request) {
  if (!isAllowedAdminHost(request.headers.get("x-forwarded-host") || request.headers.get("host")) || !isAllowedAdminOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    const body = await request.json() as { email?: unknown; code?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (email !== ADMIN_EMAIL || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Kode login tidak valid." }, { status: 400 });

    const now = new Date().toISOString();
    const lookup = await supabaseAdminFetch(`/rest/v1/cms_admin_login_codes?select=id,code_hash,expires_at,attempt_count&email=eq.${encodeURIComponent(ADMIN_EMAIL)}&used_at=is.null&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1`);
    if (!lookup.ok) throw new Error("Login-code lookup failed");
    const rows = await lookup.json() as LoginCodeRow[];
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "Kode sudah kedaluwarsa. Minta kode baru." }, { status: 400 });

    const valid = safeCodeMatch(row.code_hash, hashAdminCode(ADMIN_EMAIL, code));
    if (!valid) {
      const attempts = row.attempt_count + 1;
      await supabaseAdminFetch(`/rest/v1/cms_admin_login_codes?id=eq.${row.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ attempt_count: attempts, ...(attempts >= 5 ? { used_at: now } : {}) }),
      });
      return NextResponse.json({ error: attempts >= 5 ? "Kode diblokir. Minta kode baru." : "Kode login tidak sesuai." }, { status: 401 });
    }

    await supabaseAdminFetch(`/rest/v1/cms_admin_login_codes?id=eq.${row.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ used_at: now }) });
    await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action: "login", resource: "auth" }) });

    const session = createAdminSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
    return response;
  } catch (error) {
    console.error("Admin login verify failed", error);
    return NextResponse.json({ error: "Login belum dapat diverifikasi." }, { status: 503 });
  }
}
