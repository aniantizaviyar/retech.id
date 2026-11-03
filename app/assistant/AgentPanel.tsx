"use client";
import Image from "next/image";
import { useCallback,useEffect,useRef,useState,type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import type { Answer } from "@/lib/assistant/contracts";
import type { AgentView } from "@/lib/assistant/agent-contracts";
import { PENDING_KEY,parsePending,pendingForStorage,createPendingQuestion,type PendingQuestion } from "@/lib/assistant/agent-client";
import { readAnswer,safeSource } from "@/lib/assistant/client";
import { TurnstileWidget } from "../TurnstileWidget";
import styles from "./AgentPanel.module.css";
type Message={id:string;role:"user"|"agent";text:string;answer?:Answer};
function remember(p:PendingQuestion|null) { try { if(p) sessionStorage.setItem(PENDING_KEY,pendingForStorage(p)); else sessionStorage.removeItem(PENDING_KEY); } catch { /* Memory-only fallback if browser storage is disabled. */ } }
async function jsonResponse(response:Response) { const data=await response.json(); if(!response.ok) throw new Error(data.error||"Permintaan belum dapat diproses."); return data; }
function ProfileForm({pending,locale,onSaved,onEdit}:{pending:PendingQuestion;locale:Locale;onSaved:(v:AgentView)=>void;onEdit:()=>void}) {
  const en=locale==="en",[token,setToken]=useState(""),[version,setVersion]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const verify=useCallback((v:string)=>setToken(v),[]),unavailable=useCallback(()=>{setToken("");setError(en?"Security verification unavailable. Retry below.":"Verifikasi keamanan belum tersedia. Muat ulang di bawah.");},[en]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(busy||!token)return;
    const form=new FormData(event.currentTarget); setBusy(true);setError("");
    try {
      const data=await jsonResponse(await fetch("/api/assistant/profile",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.get("name"),email:form.get("email"),phone:form.get("phone"),website:form.get("website")||"",consent:form.get("consent")==="on",question:pending.message,messageId:pending.messageId,locale,turnstileToken:token}),signal:AbortSignal.timeout(15000)}));
      onSaved(data);
    } catch(cause) {setError(cause instanceof Error?cause.message:"Kontak belum dapat disimpan.");setBusy(false);setToken("");setVersion(v=>v+1);}
  }
  return <form className={styles.profile} onSubmit={submit} data-clarity-mask="true"><span className={styles.step}>{en?"STEP 1 OF 2 · YOUR CONTACT":"LANGKAH 1 DARI 2 · KONTAK ANDA"}</span><h3>{en?"Let's get acquainted.":"Kenalan dulu, yuk."}</h3><p>{en?"Share your contact details so the RETECH team can follow up. Your question is kept while you complete this form.":"Isi kontak agar tim RETECH dapat menindaklanjuti. Pertanyaanmu tetap tersimpan saat form ini diisi."}</p>
    <label>{en?"Full name":"Nama lengkap"}<input name="name" autoComplete="name" minLength={2} maxLength={80} required disabled={busy}/></label>
    <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required disabled={busy}/></label>
    <label>{en?"Phone / WhatsApp":"Nomor telepon / WhatsApp"}<input name="phone" type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9 ().-]{8,30}" minLength={8} maxLength={30} required disabled={busy}/></label>
    <label className={styles.trap} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className={styles.consent}><input name="consent" type="checkbox" required disabled={busy}/><span>{en?"I agree that RETECH may store my name, email, phone and this conversation for 7 days for admin/sales follow-up.":"Saya setuju RETECH menyimpan nama, email, telepon, dan percakapan ini selama 7 hari untuk ditindaklanjuti tim melalui admin."} <a href={localePath(locale,"/privacy-policy#assistant")} target="_blank" rel="noopener noreferrer">{en?"Privacy policy":"Kebijakan privasi"} ↗</a></span></label>
    <div className={styles.verification}><TurnstileWidget key={version} action="assistant_profile" locale={locale} responsive onVerify={verify} onUnavailable={unavailable}/>{!token&&<button type="button" className={styles.textButton} onClick={()=>{setError("");setVersion(v=>v+1);}}>{en?"Reload verification":"Muat ulang verifikasi"}</button>}</div>
    {error&&<p className={styles.error} role="alert">{error}</p>}<button className={styles.primary} disabled={!token||busy}>{busy?(en?"Saving…":"Menyimpan…"):(en?"Continue to my answer →":"Lanjutkan ke jawaban →")}</button><button className={styles.textButton} type="button" onClick={onEdit} disabled={busy}>{en?"Edit my question":"Ubah pertanyaan"}</button>
  </form>;
}
export default function AgentPanel({locale,onClose}:{locale:Locale;onClose:()=>void}) {
  const en=locale==="en",[messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[profiled,setProfiled]=useState(false),[displayName,setDisplayName]=useState(""),[pending,setPending]=useState<PendingQuestion|null>(null),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[retry,setRetry]=useState<PendingQuestion|null>(null),[reload,setReload]=useState(0);
  const log=useRef<HTMLDivElement>(null),inputRef=useRef<HTMLInputElement>(null),active=useRef<AbortController|null>(null),inFlight=useRef(false),expiry=useRef<ReturnType<typeof setTimeout>|null>(null);
  const deliver=useCallback(async(p:PendingQuestion)=>{
    if(inFlight.current)return;inFlight.current=true;setBusy(true);setError("");setRetry(null);remember(p);
    const controller=new AbortController();active.current=controller;
    setMessages(current=>current.some(m=>m.id===`${p.messageId}-user`)?current:[...current,{id:`${p.messageId}-user`,role:"user",text:p.message}]);
    try {
      const response=await fetch("/api/assistant/chat",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:p.message,messageId:p.messageId,locale}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});
      if(!response.ok) {await jsonResponse(response);return;}
      const body=await response.text(); if(body.length>40000)throw new Error("Invalid response");
      const packet=body.split("\n\n").find(v=>v.startsWith("event: done\n"));
      const answer=packet?readAnswer(JSON.parse(packet.slice(packet.indexOf("data: ")+6))):null;
      if(!answer)throw new Error(en?"The answer could not be verified. Retry the same message.":"Jawaban belum dapat diverifikasi. Coba ulang pesan yang sama.");
      setMessages(current=>[...current.filter(m=>m.id!==`${p.messageId}-agent`),{id:`${p.messageId}-agent`,role:"agent",text:answer.text,answer}]);remember(null);setPending(null);
    } catch(cause) {if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"Chat unavailable");setRetry(p);}
    finally {inFlight.current=false;setBusy(false);}
  },[locale,en]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/assistant/session",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale}),signal:controller.signal}).then(jsonResponse).then((data:AgentView)=>{
      if(controller.signal.aborted)return;setProfiled(data.profiled);setDisplayName(data.displayName??"");setMessages(data.messages);setReady(true);setError("");
      let stored:PendingQuestion|null=null;try{stored=parsePending(sessionStorage.getItem(PENDING_KEY));}catch{}
      if(stored&&data.messageIds.includes(stored.messageId)){remember(null);stored=null;}
      const next=data.pending?{...data.pending,expires:Date.now()+data.sessionTtlMs}:stored;setPending(next);
      if(next){if(data.profiled)void deliver(next);else setMessages(current=>[...current,{id:`${next.messageId}-user`,role:"user",text:next.message}]);}
      if(expiry.current)clearTimeout(expiry.current);expiry.current=setTimeout(()=>{setReady(false);setError(en?"Session expired. Reload the chat; your pending question is kept temporarily.":"Sesi berakhir. Muat ulang chat; pertanyaan sementara tetap disimpan.");},data.sessionTtlMs);
    }).catch(cause=>{if(!controller.signal.aborted)setError(cause.message);});
    return()=>{controller.abort();active.current?.abort();if(expiry.current)clearTimeout(expiry.current);};
  },[locale,reload,deliver,en]);
  useEffect(()=>{const node=log.current;if(!node)return;const form=node.querySelector("form");if(!profiled&&pending&&form)node.scrollTop=form.getBoundingClientRect().top-node.getBoundingClientRect().top+node.scrollTop-12;else node.scrollTop=node.scrollHeight;},[messages,busy,pending,profiled]);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close);},[onClose]);
  function begin(value:string){const message=value.trim();if(!message||message.length>1200||!ready||busy)return;const p=createPendingQuestion(message);setInput("");setPending(p);remember(p);if(profiled)void deliver(p);else setMessages(current=>[...current,{id:`${p.messageId}-user`,role:"user",text:message}]);}
  function submit(event:FormEvent){event.preventDefault();begin(input);}
  const topics=en?["Server migration","VPS & cloud","Attendance","Web & mobile apps","Service workflow","Case studies"]:["Migrasi server","VPS & cloud","Attendance","Web & aplikasi","Alur layanan","Case studies"];
  const needsProfile=!!pending&&!profiled;
  return <section id="retech-assistant-dialog" className={styles.panel} role="dialog" aria-label="RETECH Chat" data-clarity-mask="true"><header className={styles.header}><Image src="/retech-logo-transparent.png" alt="RETECH" width={40} height={36}/><div><strong>RETECH Chat</strong><small>{en?"Automated guide · team follow-up":"Panduan otomatis · tindak lanjut tim"}</small></div><button onClick={onClose} aria-label={en?"Close chat":"Tutup chat"}>×</button></header>
    <div className={styles.log} ref={log} role="log" aria-label={en?"Conversation":"Percakapan"} aria-live="polite">
      {!messages.length&&!pending&&<div className={styles.welcome}><span className={styles.kicker}>YOUR IT PARTNER</span><h2>{en?"Let's find your IT solution.":"Solusi IT dimulai dari percakapan."}</h2><p>{en?"Tell us what you need. Complete a short contact form, then explore RETECH's official service information.":"Ceritakan kebutuhanmu. Isi kontak singkat, lalu temukan informasi resmi layanan RETECH."}</p><div className={styles.welcomeTopics}>{topics.map(t=><button key={t} onClick={()=>begin(t)} disabled={!ready}>{t} ↗</button>)}</div><small>{en?"No external AI. No passwords or sensitive data, please.":"Tanpa AI eksternal. Jangan kirim password atau data sensitif."}</small></div>}
      {profiled&&<p className={styles.identity}>{en?`Thanks, ${displayName}. Your contact and chat are available to the RETECH admin team.`:`Terima kasih, ${displayName}. Kontak dan chatmu tersedia untuk tindak lanjut tim RETECH.`}</p>}
      {messages.map(m=><article key={m.id} className={`${styles.message} ${m.role==="user"?styles.user:styles.agent}`}><small>{m.role==="user"?(en?"YOU":"ANDA"):"RETECH · BOT"}</small><p>{m.text}</p>{m.answer?.sources.length? <div className={styles.sources}>{m.answer.sources.filter(s=>safeSource(s.href)).map((s,i)=><a key={`${s.href}-${i}`} href={s.href} {...(s.href.startsWith("https:")?{target:"_blank",rel:"noopener noreferrer"}:{})}>{s.title} ↗</a>)}</div>:null}</article>)}
      {needsProfile&&pending&&<ProfileForm key={pending.messageId} pending={pending} locale={locale} onSaved={data=>{setProfiled(true);setDisplayName(data.displayName??"");setMessages(data.messages);void deliver({...pending,...data.pending});}} onEdit={()=>{setInput(pending.message);setPending(null);setMessages([]);remember(null);inputRef.current?.focus();}}/>}
      {busy&&<p className={styles.progress} role="status">{en?"Checking RETECH references…":"Memeriksa referensi RETECH…"}</p>}
      {error&&<div className={styles.error} role="alert"><p>{error}</p>{retry&&ready?<button onClick={()=>void deliver(retry)} disabled={busy}>{en?"Retry the same message":"Coba ulang pesan"}</button>:<button onClick={()=>setReload(v=>v+1)}>{en?"Reload chat session":"Muat ulang sesi chat"}</button>}</div>}
    </div>
    {profiled&&<div className={styles.topics}>{topics.map(t=><button key={t} disabled={busy||!ready} onClick={()=>begin(t)}>{t}</button>)}</div>}
    {!needsProfile&&<form className={styles.composer} onSubmit={submit}><label className="sr-only" htmlFor="retech-agent-question">{en?"Ask RETECH":"Tanya RETECH"}</label><input ref={inputRef} id="retech-agent-question" value={input} onChange={e=>setInput(e.target.value)} maxLength={1200} disabled={!ready||busy} placeholder={en?"What can we help with?":"Apa yang bisa kami bantu?"} autoComplete="off"/><button disabled={!input.trim()||!ready||busy} aria-label={en?"Send message":"Kirim pesan"}>↑</button></form>}
    <footer className={styles.footer}>{en?"7-day retention after consent. Essential session: 30 min.":"Retensi 7 hari setelah izin. Sesi esensial: 30 menit."} <a href={localePath(locale,"/privacy-policy#assistant")} target="_blank" rel="noopener noreferrer">{en?"Privacy":"Privasi"} ↗</a></footer>
  </section>;
}
