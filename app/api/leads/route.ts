import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  name?: unknown;
  phone?: unknown;
  service?: unknown;
  needs?: unknown;
  source?: unknown;
  company?: unknown;
};

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

async function notifySales(lead: { name: string; phone: string; service: string; needs: string; source: string }) {
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
      subject: `Inquiry RETECH: ${lead.service} — ${lead.name}`,
      html: `<h2>Inquiry baru dari retech.id</h2><p><strong>Nama:</strong> ${escapeHtml(lead.name)}</p><p><strong>Telepon/WhatsApp:</strong> ${escapeHtml(lead.phone)}</p><p><strong>Layanan:</strong> ${escapeHtml(lead.service)}</p><p><strong>Kebutuhan:</strong><br>${escapeHtml(lead.needs).replace(/\n/g, "<br>")}</p><p><strong>Sumber:</strong> ${escapeHtml(lead.source)}</p>`,
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

    const lead = {
      name: text(body.name, 100),
      phone: text(body.phone, 30),
      service: text(body.service, 100),
      needs: text(body.needs, 2000),
      source: body.source === "chatbot" ? "chatbot" : body.source === "contact" ? "contact" : "",
    };

    if (lead.name.length < 2 || lead.phone.length < 8 || lead.service.length < 2 || lead.needs.length < 3 || !lead.source) {
      return NextResponse.json({ error: "Mohon lengkapi semua data dengan benar." }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !secretKey) {
      console.error("Supabase environment is not configured");
      return NextResponse.json({ error: "Layanan inquiry sedang dikonfigurasi." }, { status: 503 });
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

    return NextResponse.json({ ok: true, notified: emailStatus === "sent" }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Terjadi kendala. Silakan coba lagi." }, { status: 500 });
  }
}
