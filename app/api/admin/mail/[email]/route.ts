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

export async function PATCH(request: Request, context: { params: Promise<{ email: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const email = decodeURIComponent((await context.params).email).trim().toLowerCase();
  try {
    const body = await request.json() as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    const response = await mailAdminFetch(`/${encodeURIComponent(email)}`, { method: "PATCH", body: JSON.stringify({ password }) });
    if (response.ok) await audit("mailbox.password_update", email);
    return relay(response);
  } catch (error) {
    console.error("Mail admin update failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Password mailbox belum dapat diperbarui." }, { status: 503 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ email: string }> }) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const email = decodeURIComponent((await context.params).email).trim().toLowerCase();
  try {
    const body = await request.json() as { confirmation?: unknown };
    const confirmation = typeof body.confirmation === "string" ? body.confirmation : "";
    const response = await mailAdminFetch(`/${encodeURIComponent(email)}`, { method: "DELETE", body: JSON.stringify({ confirmation }) });
    if (response.ok) await audit("mailbox.delete_archive", email);
    return relay(response);
  } catch (error) {
    console.error("Mail admin delete failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Mailbox belum dapat dihapus." }, { status: 503 });
  }
}
