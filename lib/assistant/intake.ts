import "server-only";
import nodemailer from "nodemailer";
import { validateLeadInput } from "../leads";
import { actionInput } from "./contracts";
import {
  assertOrigin,
  AssistantError,
  boundedJson,
  errorResponse,
  getSession,
  rateRequest,
  readDraft,
  verifyChallenge,
} from "./security";

type Saved = { id: string; name: string; phone: string; needs: string };
const escapeHtml = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
function reference(id: string) {
  return `RDS-${id.toUpperCase()}`;
}
async function db(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new AssistantError(
      503,
      "storage",
      "Penyimpanan permintaan belum tersedia / request storage unavailable.",
    );
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(7000),
  });
}
async function notify(
  referenceId: string,
  text: string,
): Promise<"sent" | "failed" | "not_configured"> {
  const host = process.env.SMTP_HOST,
    user = process.env.SMTP_USER,
    pass = process.env.SMTP_PASSWORD;
  const from = process.env.LEAD_NOTIFICATION_FROM,
    to = process.env.LEAD_NOTIFICATION_TO;
  if (!host || !user || !pass || !from || !to) return "not_configured";
  const port = Number(process.env.SMTP_PORT || 587);
  if (![465, 587].includes(port)) return "failed";
  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 7000,
      tls: { rejectUnauthorized: true },
    });
    await transport.sendMail({
      from,
      to,
      subject: `[RETECH Assistant] ${referenceId}`,
      text,
      html: `<pre style="font:14px/1.6 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    transport.close();
    return "sent";
  } catch {
    return "failed";
  }
}
export function validatePreferredTime(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new AssistantError(
      400,
      "time",
      "Pilih waktu konsultasi dalam WIB / choose a time in WIB.",
    );
  const at = Date.parse(`${value}:00+07:00`);
  if (
    !Number.isFinite(at) ||
    new Date(at + 7 * 3600_000).toISOString().slice(0, 16) !== value ||
    at < Date.now() + 15 * 60_000 ||
    at > Date.now() + 90 * 86400_000
  )
    throw new AssistantError(
      400,
      "time",
      "Waktu harus 15 menit–90 hari ke depan, zona WIB / choose 15 minutes–90 days ahead in WIB.",
    );
  return value.replace("T", " ") + " WIB (Asia/Jakarta)";
}
export async function handleRequest(request: Request) {
  try {
    assertOrigin(request);
    const session = getSession(request);
    if (!session)
      throw new AssistantError(
        403,
        "session",
        "Sesi habis. Kirim pesan baru terlebih dahulu / session expired; send a new message first.",
      );
    await rateRequest(request, session, true);
    const parsed = actionInput.safeParse(await boundedJson(request, 7000));
    if (!parsed.success)
      throw new AssistantError(
        400,
        "validation",
        "Lengkapi formulir dan persetujuan / complete the form and consent.",
      );
    const data = parsed.data;
    const draft = readDraft(data.token, session);
    const when =
      draft.kind === "consultation"
        ? validatePreferredTime(data.preferredAt)
        : "Tindak lanjut oleh tim / team follow-up";
    const needs = [
      `Referensi: ${reference(draft.id)}`,
      `Jenis: ${draft.kind}`,
      `Ringkasan: ${draft.summary}`,
      `Preferensi: ${when}`,
      data.note ? `Catatan: ${data.note}` : "",
      "Status: permintaan, menunggu konfirmasi tim; bukan booking kalender/tiket eksternal.",
    ]
      .filter(Boolean)
      .join("\n");
    const lead = validateLeadInput({
      name: data.name,
      phone: data.phone,
      service:
        data.locale === "en"
          ? "Other consulting needs"
          : "Konsultasi kebutuhan lainnya",
      needs,
    });
    if (!lead.ok)
      throw new AssistantError(
        400,
        "contact",
        data.locale === "en"
          ? "Please check your name, phone number and request."
          : "Periksa nama, nomor telepon, dan isi permintaan.",
      );
    const { name, phone, service } = lead.data;
    const result = (duplicate: boolean, notification: string) =>
      Response.json(
        {
          ok: true,
          reference: reference(draft.id),
          state: "pending_team_confirmation",
          duplicate,
          notification,
          message:
            data.locale === "en"
              ? "Your request is saved and awaiting team confirmation. This is not a confirmed appointment or an external helpdesk ticket."
              : "Permintaan tersimpan dan menunggu konfirmasi tim. Ini belum merupakan jadwal pasti atau tiket helpdesk eksternal.",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    const existing = await db(
      `leads?id=eq.${draft.id}&select=id,name,phone,needs&limit=1`,
    );
    if (!existing.ok) throw new Error("Storage unavailable");
    const rows = (await existing.json()) as Saved[];
    if (rows[0]) {
      if (
        rows[0].name !== name ||
        rows[0].phone !== phone ||
        rows[0].needs !== needs
      )
        throw new AssistantError(
          409,
          "duplicate",
          "Referensi ini sudah dikirim dengan data berbeda. Buat permintaan baru / reference already submitted with different details.",
        );
      return result(true, "unchanged");
    }
    await verifyChallenge(data.turnstileToken, request, "lead_submit");
    const inserted = await db("leads", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: draft.id,
        name,
        phone,
        service,
        needs,
        source: "chatbot",
        status: "new",
        email_status: "pending",
      }),
    });
    if (inserted.status === 409)
      throw new AssistantError(
        409,
        "retry",
        "Permintaan sedang diproses. Coba sekali lagi / request processing; retry once.",
      );
    if (!inserted.ok) throw new Error("Insert failed");
    // Store before notifying; a replay cannot cause another email. SMTP acceptance is not delivery.
    const notification = await notify(
      reference(draft.id),
      `${name}\n${phone}\n${needs}`,
    );
    try {
      await db(`leads?id=eq.${draft.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ email_status: notification }),
      });
    } catch {
      /* Saved request remains available to administrators. */
    }
    return result(false, notification);
  } catch (error) {
    return errorResponse(error);
  }
}
