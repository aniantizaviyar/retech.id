import { NextResponse } from "next/server";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { mailAdminFetch } from "@/lib/mail-admin";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function audit(action: string, email: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "mail_user", record_id: email }),
  });
}

async function relay(response: Response) {
  const payload = await response.json().catch(() => ({ error: "Respons mail server tidak valid." })) as Record<string, unknown>;
  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return relay(await mailAdminFetch());
  } catch (error) {
    console.error("Mail admin list failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Mail server Oracle belum dapat dihubungi." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const response = await mailAdminFetch("", { method: "POST", body: JSON.stringify({ email, password }) });
    if (response.ok) await audit("mailbox.create", email);
    return relay(response);
  } catch (error) {
    console.error("Mail admin create failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Mailbox belum dapat dibuat." }, { status: 503 });
  }
}
