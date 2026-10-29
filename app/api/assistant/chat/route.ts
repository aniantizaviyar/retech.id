import { createChatHandler } from "@/lib/assistant/chat-handler";
import { loadKnowledge } from "@/lib/assistant/knowledge";
import { modelRoute, providerReady } from "@/lib/assistant/provider";
import { executeSkill } from "@/lib/assistant/executor";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createChatHandler({
  loadKnowledge,
  modelRoute,
  providerReady,
  execute: executeSkill,
});
