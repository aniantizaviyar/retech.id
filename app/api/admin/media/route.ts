import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ADMIN_EMAIL, readAdminSessionFromRequest } from "@/lib/admin-auth";
import { cmsMediaPublicUrl, supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function safeName(name: string) {
  const extension = name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/)?.[0] || "";
  const base = name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 60) || "image";
  return `${base}-${randomUUID().slice(0, 8)}${extension}`;
}

async function audit(action: string, path: string) {
  await supabaseAdminFetch("/rest/v1/cms_audit_log", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ actor_email: ADMIN_EMAIL, action, resource: "media", record_id: path }) });
}

export async function GET(request: Request) {
  if (!readAdminSessionFromRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const response = await supabaseAdminFetch("/storage/v1/object/list/cms-media", {
    method: "POST",
    body: JSON.stringify({ prefix: "", limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!response.ok) return NextResponse.json({ error: "Media belum dapat dimuat." }, { status: 503 });
  const objects = await response.json() as Array<{ name: string; id?: string; created_at?: string; metadata?: { size?: number; mimetype?: string } }>;
  return NextResponse.json({ records: objects.filter((item) => item.name && item.id).map((item) => ({ ...item, url: cmsMediaPublicUrl(item.name) })) });
}

export async function POST(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Pilih file gambar." }, { status: 400 });
    if (!TYPES.has(file.type)) return NextResponse.json({ error: "Format gambar harus JPG, PNG, WebP, atau GIF." }, { status: 400 });
    if (file.size <= 0 || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Ukuran gambar maksimal 8 MB." }, { status: 400 });
    const path = safeName(file.name);
    const response = await supabaseAdminFetch(`/storage/v1/object/cms-media/${encodeURIComponent(path)}`, {
      method: "POST",
      headers: { "Content-Type": file.type, "x-upsert": "false" },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!response.ok) return NextResponse.json({ error: `Upload gagal: ${await response.text()}` }, { status: 400 });
    await audit("upload", path);
    return NextResponse.json({ ok: true, path, url: cmsMediaPublicUrl(path) }, { status: 201 });
  } catch (error) {
    console.error("CMS media upload failed", error);
    return NextResponse.json({ error: "Upload gambar belum dapat diproses." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!readAdminSessionFromRequest(request, true)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!/^[a-z0-9][a-z0-9._-]{1,120}$/i.test(path)) return NextResponse.json({ error: "Path media tidak valid." }, { status: 400 });
  const response = await supabaseAdminFetch("/storage/v1/object/cms-media", { method: "DELETE", body: JSON.stringify({ prefixes: [path] }) });
  if (!response.ok) return NextResponse.json({ error: `Gagal menghapus media: ${await response.text()}` }, { status: 400 });
  await audit("delete", path);
  return NextResponse.json({ ok: true });
}
