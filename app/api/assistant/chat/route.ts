import { agentHandlers } from "@/lib/assistant/agent";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = agentHandlers.chat;
