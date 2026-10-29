# RETECH Assistant — architecture and operator guide

Implementation date: 29 October 2026. Scope: the public retech.id assistant, not a customer-account agent.

## What changed

The old widget answered browser-side regular-expression branches without an LLM or server-side grounding. It has been replaced by a lazy client panel, a server-side public knowledge layer, deterministic skill handlers, confirmed inquiry submission and an optional Cloudflare Workers AI intent router. The existing logo, navigation, inquiry form, admin authorization and billing logic are preserved.

Cloudflare AI is **disabled until explicitly configured**. Guided skills work independently of it. Do not describe a release as LLM-active merely because its provider adapter is installed.

```text
Lazy launcher → Chat panel → same-origin POST /api/assistant/chat
                               │
                  byte/schema/Origin/rate/session/Turnstile checks
                               │
                   deterministic intent + short user context
                               │ ambiguous + opt-in + enabled only
                     Cloudflare AI → one validated function call
                               │
                       fixed skill executor
                 ┌─────────────┼────────────────┐
          public references  catalog math  allowlisted HEAD checks
                               │
                 consultation/support draft (10 min)
                               │ user reviews + consents + verifies
                   POST /api/assistant/requests
                               │
                 one idempotent inquiry in existing leads table
                               │
                 optional fixed-recipient SMTP team notification
```

## Skills and API contracts

The authoritative strict Zod schemas and JSON Schema function definitions are in `lib/assistant/contracts.ts`; dispatcher and system prompt are in `lib/assistant/domain.ts`.

| Function                 | Accepted arguments                                                              | Capability boundary                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `search_information`     | `query` ≤500 characters                                                         | Published public services/products/FAQs/pricing and fixed company facts only                        |
| `estimate_price`         | fixed product enum; optional known plan, integer quantity 1–10,000, months 1–12 | Integer catalog arithmetic; no arbitrary prices, discounts, taxes, invoices or charges              |
| `request_consultation`   | `topic` ≤500 characters                                                         | Prepares a form, not a calendar booking                                                             |
| `create_support_request` | `summary` ≤500 characters                                                       | Prepares an inquiry, not an authenticated/external helpdesk ticket                                  |
| `check_service_status`   | `website` or `attendance`                                                       | One HEAD request to a fixed public root URL, redirects disabled; never private tenant/server health |

`POST /api/assistant/chat` accepts one message ≤1,200 characters, locale `id`/`en`, at most six prior **user** messages ≤600 characters each, optional Turnstile token and `aiConsent`. Unknown keys, system/assistant history roles, control characters, invalid normalized lengths and oversized bodies are rejected. Actual streamed request bytes are capped at 12,000, not merely Content-Length.

The response is SSE: `ready`, `status`, `delta`, `done`, or `error`. `ready` gives remaining session TTL and provider availability, not secrets. Final answer metadata includes skill and source links. Text chunks are grounded server-composed output; **this is not unfiltered model-token streaming**.

`POST /api/assistant/requests` accepts a signed session-bound draft, validated contact name/phone, optional notes, explicit consent and fresh Turnstile token. Consultation time is interpreted in WIB/Asia/Jakarta, 15 minutes–90 days ahead. It returns a reference only after database insertion. State is always `pending_team_confirmation`, not confirmed. Replays of the same draft/data return the same reference without another email; changed data under the same reference is rejected.

`GET /api/assistant/capabilities` exposes only availability and five public capability names.

## Public knowledge / lightweight RAG

`lib/assistant/knowledge.ts` reads published CMS services, products, FAQs and pricing through the existing server-side public getters. No customer, invoice, mailbox or employee API is imported. Curated selectors resolve explicit product/contact/privacy questions; small lexical retrieval ranks the remaining public references. No external URL ingestion, user document uploads, embeddings service or vector database is required.

Attendance pricing is centralized in `lib/attendance-catalog.ts` and used by both its landing page and calculator: Free up to 10 employees, Pro Rp12,500/seat/month and Business Rp20,000/seat/month. Paid estimates bill all purchased seats; they do not subtract the Free allowance. Legacy Attendance CMS plans/FAQs are excluded from this knowledge layer. QR pricing comes from its published catalog. Multi-outlet/custom and VPS pricing require a quotation. Public VPS facts preserve optional Plesk/cPanel/no-panel choices.

Published content is still data, not permission or instructions. Keep CMS publishing rights restricted; grounding cannot prove the commercial accuracy of content an administrator publishes.

## LLM configuration and cost controls

Use the same Cloudflare account that owns the approved Workers AI setup. Follow the official [REST setup](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) and its Workers AI token template. Scope to the intended account and Workers AI only. The current documentation specifies Workers AI Read and Edit for a manually created token. Do not use the Global API Key, DNS/zone access or a token with account-wide administrator rights. Creating a token is a new persistent credential and requires operator approval.

Set these as server-only Vercel environment variables; never paste token values in chat, source, screenshots, NEXT_PUBLIC variables or build logs:

```dotenv
ASSISTANT_AI_ENABLED=false
CLOUDFLARE_AI_ACCOUNT_ID=<32-character account ID>
CLOUDFLARE_AI_TOKEN=<scoped Workers AI token>
```

After installation and a successful provider smoke test, enable `ASSISTANT_AI_ENABLED=true` and redeploy. Existing `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RATE_LIMIT_SALT` (at least 16 characters), `TURNSTILE_SECRET_KEY` and the public Turnstile site key remain required for protected guided operation. The production hostname is restricted to retech.id/www.retech.id. Request IP identity uses Vercel's platform-controlled header, not a caller-supplied Cloudflare/IP header.

Chosen model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` via Cloudflare's compatible Chat Completions endpoint, no extra AI SDK. At most one provider request, 256 output tokens, 8-second timeout and no automatic retry or paid-provider fallback. A persistent account-wide application cap allows 40 model attempts per UTC day. This cap is shared across visitors and survives serverless instances. Provider overload, quota, invalid tool output or timeout falls back to guided clarification.

The provider is called only for unclear requests and only after visitor opt-in. It receives bounded public facts and up to three redacted prior user messages. Form contact fields, cookies, database credentials and customer records are never supplied. Pattern redaction is **not guaranteed anonymization**; names and unrecognized sensitive formats may remain, so the widget warns against sensitive input.

Cloudflare currently includes 10,000 Neurons/day on its free allocation; request count is not the same as Neuron usage. Verify the account's actual plan, other applications' usage and model eligibility. No paid upgrade or billing commitment is authorized by this implementation. See [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [model](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/) and [data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/). We use stateless direct inference, not AI Gateway content logging/caching, fine-tuning or user-file storage.

## Guardrails and least privilege

- `SYSTEM_PROMPT` is the full deployed prompt, not a client prompt. Retrieved content and conversation text are explicitly untrusted data.
- A model can select only one strict allowlisted function. Unknown tools/arguments and URLs are rejected. No agent loops, shell execution, arbitrary fetch, private-account lookup or model-driven database query exists.
- All actions requiring a write are split into draft/review/submit. Backend HMAC signatures bind the 10-minute draft and random UUID to a 30-minute HttpOnly, SameSite=Strict, Secure production session cookie.
- Same-origin POST and browser-origin checks prevent cross-site drive-by calls. Turnstile action/hostname are checked in production. Its official test keys appear only in local test builds, never in the production configuration.
- Persistent limits: chat IP 20/10 minutes, session 30/10 minutes; actions IP/session 5/10 minutes; model 40/UTC day. HMAC identifiers are stored instead of raw IP values. Rate-store failures fail closed (503), quota limits return 429.
- Supabase's existing rate RPC is restricted to service_role/postgres and the existing leads table has RLS enabled. No grants, RLS changes or new tables were introduced. The application reuses the existing backend service credential; code restricts it to fixed operations. A separately scoped database RPC/role is a future defense-in-depth improvement, not a claim that the reused service credential is intrinsically low-privilege.
- SMTP is TLS-verified and fixed-recipient only; HTML is escaped. A saved inquiry remains saved when SMTP fails. SMTP acceptance is not delivery/bounce confirmation. The existing Leads admin menu is still Coming Soon; the current operational channels are the existing inquiry database and configured team notification, not a newly implemented helpdesk inbox.
- Client renders plain React text and filtered source links, masks the entire panel for Clarity, stores no conversation in localStorage/sessionStorage, and has cancellation, error, retry-verification, keyboard Escape and focus return. Panel/forms/Turnstile are lazy loaded after opening.

These controls reduce injection/abuse risk but do not prove immunity to all jailbreaks, XSS elsewhere in the site, compromised CMS publishing, stolen server secrets or botnets. An independent penetration test remains useful before broader account capabilities are considered.

## Source map

- `app/ChatWidget.tsx`, `app/ChatWidget.module.css`: lightweight launcher and bounded responsive shell.
- `app/assistant/ChatPanel.tsx`, CSS module: chat, consent, source links and confirmed request forms.
- `app/api/assistant/{chat,requests,capabilities}/route.ts`: Next.js server endpoints.
- `lib/assistant/{contracts,domain,knowledge,security,provider,executor,intake,chat-handler}.ts`: server logic and isolated pure contracts.
- `lib/assistant/client.ts`: lightweight response/source validation without putting server configuration or Zod in the initial widget bundle.
- `app/privacy-policy/page.tsx`: bilingual processing, opt-in and session disclosures.
- `tests/assistant.test.ts`: isolated automated tests, no production submissions.
- `tests/assistant-runtime-regression.test.ts`: admin session/logout, invoice/quotation authorization and local MIME-generation regression tests after dependency updates.
- `tests/assistant-ui-server.ts`: localhost-only synthetic integration harness; never imported by the app.

## Operator review

Do not expand to tenant/account status until an authenticated customer context, explicit authorization checks, minimally scoped API and auditable access policy exist. Do not turn support inquiries into paid work orders, confirmed meetings or subscription changes without a separate customer confirmation workflow. Review rate-limit metadata retention/cleanup according to actual traffic and operational policy.
