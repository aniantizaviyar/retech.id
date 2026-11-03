// Local-only integration harness. NEVER imported by app/ or deployed as a route.
// All security/storage/provider side effects use synthetic fixtures; public-page HTML is proxied.
import { createServer } from "node:http";
import { createChatHandler } from "../lib/assistant/chat-handler";
import { loadKnowledge } from "../lib/assistant/knowledge";
import { executeSkill } from "../lib/assistant/executor";
import { handleRequest } from "../lib/assistant/intake";
import { createAgentHandlers } from "../lib/assistant/agent-handler";
import type { AgentSession } from "../lib/assistant/agent-contracts";
import { redactHistoryText } from "../lib/assistant/history-policy";

Object.assign(process.env, {
  NODE_ENV: "development",
  RATE_LIMIT_SALT: "local-ui-fixture-only-not-a-secret",
  SUPABASE_URL: "https://supabase.example.invalid",
  SUPABASE_SECRET_KEY: "fixture",
  TURNSTILE_SECRET_KEY: "fixture",
  ASSISTANT_AI_ENABLED: "false",
});
delete process.env.SMTP_HOST;
delete process.env.VERCEL;
const nativeFetch = globalThis.fetch;
const leads = new Map<string, Record<string, unknown>>();
const json = (value: unknown, status = 200) => Response.json(value, { status });
const agentSessions=new Map<string,AgentSession>();
const agent=createAgentHandlers({loadKnowledge,execute:executeSkill,store:{
  async session(id){return agentSessions.get(id)??null;},
  async register(id,data){if(agentSessions.has(id))return true;agentSessions.set(id,{id,contact_name:data.name,expires_at:new Date(Date.now()+7*86400_000).toISOString(),pending_question:redactHistoryText(data.question,1200),pending_message_id:data.messageId,exchanges:[]});return true;},
  async save(id,mid,question,answer){const row=agentSessions.get(id)!;const old=row.exchanges.find(e=>e.client_message_id===mid);if(old)return {saved:true,exchange:old};const exchange={id:crypto.randomUUID(),client_message_id:mid,question:redactHistoryText(question,1200),answer:redactHistoryText(answer.text),skill:answer.skill,sources:answer.sources,created_at:new Date().toISOString()};row.exchanges.push(exchange);row.pending_question=null;row.pending_message_id=null;return {saved:true,exchange};},
}});
globalThis.fetch = async (input, init = {}) => {
  const url = String(input),
    body = typeof init.body === "string" ? JSON.parse(init.body) : {};
  if (url.endsWith("/rpc/consume_lead_rate_limit"))
    return json([{ allowed: true, remaining: 19, retry_after: 0 }]);
  if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify")
    return json({ success: true });
  if (url.startsWith("https://supabase.example.invalid/rest/v1/cms_"))
    return json([]);
  if (url.startsWith("https://supabase.example.invalid/rest/v1/leads")) {
    if (init.method === "POST") {
      if (leads.has(body.id)) return json({}, 409);
      leads.set(body.id, body);
      return new Response(null, { status: 201 });
    }
    const id = new URL(url).searchParams.get("id")?.replace(/^eq\./, "") ?? "";
    if (init.method === "PATCH") return new Response(null, { status: 204 });
    return json(leads.has(id) ? [leads.get(id)] : []);
  }
  if (
    ["https://retech.id/", "https://absensi.retech.id/"].includes(url) &&
    init.method === "HEAD"
  )
    return new Response(null, { status: 200 });
  throw new Error("External network call blocked in UI fixture server");
};
const chat = createChatHandler({
  loadKnowledge,
  execute: async (...args) => {
    const [call] = args;
    if (
      call.name === "search_information" &&
      call.arguments.query === "website local slow test"
    )
      await new Promise((resolve) => setTimeout(resolve, 20000));
    if (
      call.name === "search_information" &&
      call.arguments.query === "website local failure test"
    )
      throw new Error("Synthetic fixture failure");
    return executeSkill(...args);
  },
  modelRoute: async () => null,
  providerReady: () => false,
});
const server = createServer(async (req, res) => {
  try {
    const path = req.url || "/";
    let result: Response;
    if (path.startsWith("/api/assistant/")) {
      if (path === "/api/assistant/capabilities")
        result = json({ aiAvailable: false });
      else {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 20000) throw new Error("Oversize fixture request");
          chunks.push(chunk);
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value)
            headers.set(key, Array.isArray(value) ? value.join(",") : value);
        const cancellation = new AbortController();
        req.on("aborted", () => cancellation.abort());
        res.on("close", () => {
          if (!res.writableEnded) cancellation.abort();
        });
        const request = new Request(`http://127.0.0.1:3113${path}`, {
          method: req.method,
          headers,
          body: Buffer.concat(chunks).toString("utf8"),
          signal: cancellation.signal,
        });
        result =
          path === "/api/assistant/chat"
            ? await agent.chat(request)
            : path === "/api/assistant/session"
              ? await agent.session(request)
            : path === "/api/assistant/profile"
              ? await agent.profile(request)
            : path === "/api/assistant/requests"
              ? await handleRequest(request)
              : json({}, 404);
      }
    } else {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405);
        res.end();
        return;
      }
      const upstream = new Headers();
      for (const [key, value] of Object.entries(req.headers))
        if (value)
          upstream.set(key, Array.isArray(value) ? value.join(",") : value);
      upstream.set("host", "localhost:3114");
      upstream.delete("x-forwarded-host");
      upstream.delete("forwarded");
      result = await nativeFetch(`http://localhost:3114${path}`, {
        redirect: "manual",
        headers: upstream,
      });
    }
    const outgoing = new Headers(result.headers);
    for (const name of [
      "content-encoding",
      "content-length",
      "transfer-encoding",
    ])
      outgoing.delete(name);
    res.writeHead(result.status, Object.fromEntries(outgoing));
    if (result.body) {
      const reader = result.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    res.end();
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Local preview fixture unavailable");
  }
});
server.listen(3113, "127.0.0.1", () =>
  console.log(
    "LOCAL FIXTURE ONLY: http://127.0.0.1:3113/ — no live database/email/LLM writes",
  ),
);
