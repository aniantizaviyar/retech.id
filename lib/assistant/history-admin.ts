import "server-only";
import { z } from "zod";
import { readAdminSessionFromRequest } from "../admin-auth";
import { boundedJson } from "./security";
import { historyRpc } from "./history";

const headers = { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff" };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers });
function authorized(request: Request, mutation = false) {
  try { return !!readAdminSessionFromRequest(request, mutation); } catch { return false; }
}
export async function listHistory(request: Request) {
  if (!authorized(request)) return json({ error: "Sesi admin diperlukan." }, 401);
  const params = new URL(request.url).searchParams;
  const input = z.object({ page: z.coerce.number().int().min(1).max(250).default(1) }).strict()
    .safeParse(Object.fromEntries(params));
  if (!input.success || params.getAll("page").length > 1) return json({ error: "Parameter halaman tidak valid." }, 400);
  try { return json(await historyRpc("assistant_history_list", { p_page: input.data.page })); }
  catch { return json({ error: "Riwayat belum dapat dimuat. Coba lagi." }, 503); }
}
export async function detailHistory(request: Request, id: string) {
  if (!authorized(request)) return json({ error: "Sesi admin diperlukan." }, 401);
  if (!z.uuid().safeParse(id).success) return json({ error: "ID percakapan tidak valid." }, 400);
  try {
    const value = await historyRpc("assistant_history_detail", { p_id: id });
    return value ? json(value) : json({ error: "Percakapan tidak ditemukan atau sudah kedaluwarsa." }, 404);
  } catch { return json({ error: "Detail riwayat belum dapat dimuat." }, 503); }
}
export async function deleteHistory(request: Request, id: string) {
  if (!authorized(request, true)) return json({ error: "Sesi dan origin admin diperlukan." }, 401);
  if (!z.uuid().safeParse(id).success) return json({ error: "ID percakapan tidak valid." }, 400);
  try {
    const input = z.object({ confirmation: z.literal("HAPUS") }).strict().safeParse(await boundedJson(request, 200));
    if (!input.success) return json({ error: "Konfirmasi penghapusan diperlukan." }, 400);
  } catch { return json({ error: "Konfirmasi penghapusan tidak valid." }, 400); }
  try {
    const removed = await historyRpc("assistant_history_delete", { p_id: id });
    return removed ? json({ ok: true }) : json({ error: "Percakapan tidak ditemukan." }, 404);
  } catch { return json({ error: "Riwayat belum dapat dihapus. Coba lagi." }, 503); }
}
