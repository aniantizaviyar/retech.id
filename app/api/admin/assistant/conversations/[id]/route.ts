import { detailHistory, deleteHistory } from "@/lib/assistant/history-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return detailHistory(request, (await context.params).id); }
export async function DELETE(request: Request, context: Context) { return deleteHistory(request, (await context.params).id); }
