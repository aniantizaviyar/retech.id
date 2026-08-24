import { readAdminSessionFromRequest } from "@/lib/admin-auth";
import type { QuotationEmailEvent } from "@/lib/quotations";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const query = new URLSearchParams({ select: "id,quotation_id,event,recipient,provider_message_id,reason,event_at,created_at", quotation_id: `eq.${id}`, order: "event_at.desc", limit: "100" });
  const response = await supabaseAdminFetch(`/rest/v1/business_quotation_email_events?${query.toString()}`);
  if (!response.ok) return Response.json({ error: "Riwayat email belum dapat dimuat." }, { status: 502 });
  return Response.json({ records: await response.json() as QuotationEmailEvent[] });
}
