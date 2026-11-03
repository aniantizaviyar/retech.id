import "server-only";
import { z } from "zod";
import type { Answer, Knowledge, ToolCall } from "./contracts";
import { chatInput, toolCall } from "./contracts";
import { agentMessageInput, profileInput, type AgentExchange, type AgentSession, type AgentView } from "./agent-contracts";
import { agentStore, type AgentStore } from "./agent-store";
import { assertOrigin, AssistantError, boundedJson, errorResponse, getSession, newSession, rateRequest, sessionCookie, verifyChallenge, type Session } from "./security";
import { routeIntent, unsafeRequest } from "./domain";
const privateHeaders = {"Cache-Control":"private, no-store", "Vary":"Cookie", "X-Content-Type-Options":"nosniff"};
const fromExchange = (e:AgentExchange):Answer => ({text:e.answer,skill:e.skill,sources:e.sources,provider:"guided",historySaved:true});
function view(data:AgentSession|null,session:Session):AgentView {
  return {profiled:!!data?.contact_name,displayName:data?.contact_name?.split(" ")[0],expiresAt:data?.expires_at,sessionTtlMs:Math.max(0,session.expires-Date.now()),
    messageIds:(data?.exchanges??[]).map(e=>e.client_message_id).filter((id):id is string=>!!id),
    messages:(data?.exchanges??[]).flatMap(e=>[{id:`${e.id}-user`,role:"user" as const,text:e.question},{id:e.id,role:"agent" as const,text:e.answer,answer:fromExchange(e)}]),
    ...(data?.pending_question && data.pending_message_id ? {pending:{message:data.pending_question,messageId:data.pending_message_id}} : {}),
  };
}
function completed(answer:Answer) {
  // Deterministic, already validated and persisted output; not model-token streaming.
  const body=`event: ready\ndata: ${JSON.stringify({aiAvailable:false})}\n\nevent: done\ndata: ${JSON.stringify(answer)}\n\n`;
  return new Response(body,{headers:{...privateHeaders,"Content-Type":"text/event-stream; charset=utf-8","X-Accel-Buffering":"no"}});
}
export function createAgentHandlers(deps:{loadKnowledge(locale:"id"|"en",signal:AbortSignal):Promise<Knowledge>;execute(call:ToolCall,k:Knowledge,en:boolean,session:Session,signal:AbortSignal):Promise<Answer>;store?:AgentStore}) {
  const store=deps.store??agentStore;
  return {
    async session(request:Request) {
      try {
        assertOrigin(request);
        if (!z.object({locale:z.enum(["id","en"])}).strict().safeParse(await boundedJson(request,100)).success) throw new AssistantError(400,"validation","Parameter sesi tidak valid.");
        const existing=getSession(request), session=existing??newSession();
        await rateRequest(request,existing);
        const data=existing?await store.session(session.id):null;
        return Response.json(view(data,session),{headers:{...privateHeaders,...(!existing?{"Set-Cookie":sessionCookie(session)}:{})}});
      } catch(error) { return errorResponse(error); }
    },
    async profile(request:Request) {
      try {
        assertOrigin(request); const session=getSession(request);
        if(!session) throw new AssistantError(403,"session","Sesi berakhir atau cookie esensial tidak tersedia. Muat ulang chat.");
        await rateRequest(request,session,true);
        const parsed=profileInput.safeParse(await boundedJson(request,7000));
        if(!parsed.success) throw new AssistantError(400,"validation","Periksa nama, email, nomor telepon, dan persetujuan privasi.");
        await verifyChallenge(parsed.data.turnstileToken,request,"assistant_profile");
        if(!await store.register(session.id,parsed.data)) throw new AssistantError(409,"profile","Sesi sudah terdaftar, ditutup, atau kapasitas sementara penuh. Muat ulang chat untuk memeriksa status.");
        const data=await store.session(session.id);
        if(!data?.contact_name) throw new AssistantError(503,"storage","Kontak belum dapat dikonfirmasi tersimpan. Coba lagi pada form yang sama.");
        return Response.json({ok:true,...view(data,session)},{headers:privateHeaders});
      } catch(error) { return errorResponse(error); }
    },
    async chat(request:Request) {
      try {
        assertOrigin(request); const session=getSession(request);
        if(!session) throw new AssistantError(403,"session","Sesi berakhir. Buka ulang chat.");
        await rateRequest(request,session);
        const parsed=agentMessageInput.safeParse(await boundedJson(request,7000));
        if(!parsed.success) throw new AssistantError(400,"validation","Pesan atau ID pesan tidak valid. Muat ulang widget jika versinya sudah lama.");
        const data=await store.session(session.id);
        if(!data?.contact_name) throw new AssistantError(409,"profile_required","Isi form kontak dan persetujuan sebelum melanjutkan.");
        const previous=data.exchanges.find(e=>e.client_message_id===parsed.data.messageId);
        if(previous) return completed(fromExchange(previous));
        const question=data.pending_message_id===parsed.data.messageId ? data.pending_question??parsed.data.message : parsed.data.message;
        const en=parsed.data.locale==="en";
        const input=chatInput.parse({message:question,locale:parsed.data.locale,history:data.exchanges.slice(-6).map(e=>({role:"user",text:e.question.slice(0,600)}))});
        let answer:Answer,kind:"consultation"|"support"|null=null;
        if(unsafeRequest(question)) answer={skill:"guardrail",sources:[],text:en?"I cannot reveal secrets or change access/prices. Never send credentials; ask about RETECH services.":"Saya tidak dapat membuka rahasia atau mengubah akses/harga. Jangan kirim kredensial; tanyakan layanan RETECH."};
        else {
          const knowledge=await deps.loadKnowledge(parsed.data.locale,request.signal);
          const call=toolCall.parse(routeIntent(input)??{name:"search_information",arguments:{query:question.slice(0,500)}});
          if(call.name==="request_consultation"||call.name==="create_support_request") {
            kind=call.name==="request_consultation"?"consultation":"support";
            answer={skill:call.name,sources:[{title:en?"Contact RETECH":"Kontak RETECH",href:"/#contact"}],text:en?`Your ${kind} request is recorded for team follow-up. Reference RDS-${parsed.data.messageId.toUpperCase()}. The team must confirm scope, time and any fees; this is not a confirmed appointment or paid work order.`:`Permintaan ${kind==="consultation"?"konsultasi/demo":"support"} tercatat untuk ditindaklanjuti tim. Referensi RDS-${parsed.data.messageId.toUpperCase()}. Scope, waktu, dan biaya (jika ada) perlu konfirmasi tim; ini bukan jadwal pasti atau perintah kerja berbayar.`};
          } else answer=await deps.execute(call,knowledge,en,session,request.signal);
        }
        answer={...answer,provider:"guided"}; delete answer.action;
        const saved=await store.save(session.id,parsed.data.messageId,question,answer,kind);
        if(!saved.saved||!saved.exchange) throw new AssistantError(503,"storage","Pesan belum dapat disimpan. Coba lagi dengan tombol yang sama; jangan kirim data sensitif.");
        return completed(fromExchange(saved.exchange));
      } catch(error) { return errorResponse(error); }
    },
  };
}
