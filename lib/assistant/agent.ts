import "server-only";
import { createAgentHandlers } from "./agent-handler";
import { loadKnowledge } from "./knowledge";
import { executeSkill } from "./executor";
// Deliberately no provider adapter, model SDK or external LLM configuration.
export const agentHandlers=createAgentHandlers({loadKnowledge,execute:executeSkill});
