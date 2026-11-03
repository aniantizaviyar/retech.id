import { redactHistoryText } from "./history-policy";
export type PendingQuestion={message:string;messageId:string;expires:number};
export const PENDING_KEY="retech-agent-pending-v2";
export function createPendingQuestion(message:string,now=Date.now()):PendingQuestion {return {message,messageId:crypto.randomUUID(),expires:now+30*60_000};}
export function parsePending(value:string|null,now=Date.now()):PendingQuestion|null {
  try { const v=JSON.parse(value??"null"); return v && typeof v.message==="string" && v.message.length>0 && v.message.length<=1200 && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v.messageId) && typeof v.expires==="number" && v.expires>now && v.expires<=now+30*60_000 ? v : null; } catch { return null; }
}
export function pendingForStorage(p:PendingQuestion) { return JSON.stringify({...p,message:redactHistoryText(p.message,1200)}); }
