import "server-only";
import type { Answer } from "./contracts";
import type { AgentSession } from "./agent-contracts";
import { historyRpc } from "./history";
import { redactHistoryText, redactAgentAnswerText } from "./history-policy";
import { safeSource } from "./client";

export const agentStore = {
  session: (id: string): Promise<AgentSession | null> => historyRpc("assistant_agent_session", {p_id:id}),
  register: (id:string, data:{name:string;email:string;phone:string;question:string;messageId:string;locale:string}) => historyRpc("assistant_agent_register", {
    p_id:id,p_name:data.name,p_email:data.email,p_phone:data.phone,p_question:redactHistoryText(data.question,1200),p_message_id:data.messageId,p_locale:data.locale,
  }) as Promise<boolean>,
  save: (id:string,messageId:string,question:string,answer:Answer,kind:"consultation"|"support"|null) => historyRpc("assistant_agent_exchange", {
    p_id:id,p_message_id:messageId,p_question:redactHistoryText(question,1200),p_answer:redactAgentAnswerText(answer.text),p_skill:answer.skill,
    p_sources:answer.sources.filter(s=>safeSource(s.href)).slice(0,3).map(s=>({title:redactHistoryText(s.title,150),href:s.href})),p_kind:kind,
  }) as Promise<{saved:boolean;exchange?:AgentSession["exchanges"][number]}>,
};
export type AgentStore = typeof agentStore;
