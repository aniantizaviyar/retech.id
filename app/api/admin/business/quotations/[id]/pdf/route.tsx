import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { readAdminSessionFromRequest } from "@/lib/admin-auth";
import { QuotationPdf } from "@/lib/quotation-pdf";
import type { Quotation } from "@/lib/quotations";
import { supabaseAdminFetch } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!readAdminSessionFromRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const response = await supabaseAdminFetch(`/rest/v1/business_quotations?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!response.ok) return Response.json({ error: "Quotation belum dapat dimuat." }, { status: 502 });
  const records = await response.json() as Quotation[];
  if (!records.length) return Response.json({ error: "Quotation tidak ditemukan." }, { status: 404 });
  const [logo, signature, stamp] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "retech-logo-transparent.png")),
    readFile(path.join(process.cwd(), "public", "documents", "retech-signature.png")),
    readFile(path.join(process.cwd(), "public", "documents", "retech-stamp-transparent.png")),
  ]);
  const pdf = await renderToBuffer(<QuotationPdf quotation={{ ...records[0], discount_amount: Number(records[0].discount_amount), items: records[0].items.map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) }} logoSrc={`data:image/png;base64,${logo.toString("base64")}`} signatureSrc={`data:image/png;base64,${signature.toString("base64")}`} stampSrc={`data:image/png;base64,${stamp.toString("base64")}`} />);
  const filename = `RETECH-Quotation-${records[0].quote_number.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
  const disposition = new URL(request.url).searchParams.get("download") === "1" ? "attachment" : "inline";
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename="${filename}.pdf"`, "Cache-Control": "private, no-store" } });
}
