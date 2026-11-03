import { z } from "zod";
import { normalizePhone } from "../leads";
import type { Answer } from "./contracts";
const text = (max: number) => z.string().min(1).max(max).transform(v => v.normalize("NFKC").trim()).refine(v => !!v && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v));
export const profileInput = z.object({
  name: text(80).refine(v => /^(?=(?:.*\p{L}){2})[\p{L}\p{M}.'’ -]{2,80}$/u.test(v)),
  email: z.string().trim().max(254).email().transform(v => v.toLowerCase()),
  phone: text(30).refine(v => /^[+0-9 ().-]{8,30}$/.test(v)).transform(normalizePhone).refine(Boolean),
  question: text(1200), messageId: z.uuid(), locale: z.enum(["id","en"]),
  consent: z.literal(true), website: z.literal("").default(""),
  turnstileToken: z.string().min(1).max(2048),
}).strict();
export const agentMessageInput = z.object({ message: text(1200), messageId: z.uuid(), locale: z.enum(["id","en"]) }).strict();
export const leadStatuses = ["new","contacted","in_progress","closed"] as const;
export type LeadStatus = typeof leadStatuses[number];
export type AgentExchange = { id: string; client_message_id: string | null; question: string; answer: string; skill: string; sources: Answer["sources"]; created_at: string };
export type AgentSession = { id: string; contact_name: string | null; expires_at: string; pending_question: string | null; pending_message_id: string | null; exchanges: AgentExchange[] };
export type AgentView = { profiled: boolean; displayName?: string; expiresAt?: string; sessionTtlMs: number; messageIds: string[]; messages: Array<{id: string; role:"user"|"agent";text:string;answer?:Answer}>; pending?: {message:string;messageId:string} };
