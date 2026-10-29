import { handleRequest } from "@/lib/assistant/intake";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = handleRequest;
