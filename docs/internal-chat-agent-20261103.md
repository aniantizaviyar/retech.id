# RETECH internal chat agent — architecture and benchmark

Approved scope: mandatory Name/Email/Phone form, existing RETECH admin only, explicit visitor consent, 7-day retention. No new Sales account or external CRM permission is granted.

## Benchmark

Inspected the public [Biznet GIO](https://www.biznetgio.com/) widget through Chrome and compared the six supplied screenshots. The browser already held the user's ongoing support conversation. No new message, contact details, attachment, account, purchase, or support ticket was submitted to Biznet. Findings are observational, not a claim about their backend or LLM implementation.

Observed sequence: branded welcome → initial topic → prompts for name, email and phone → conversation with a named operator. The welcome and conversation views are distinct. History survives reopening. Chat is a bounded scrolling region with a pinned composer and clear message ownership.

Applied to RETECH:

| Area | Implementation |
| --- | --- |
| Brand | Original RETECH logo and Editorial Blue colors; no borrowed Biznet branding |
| Identity | Explicit automated agent label; no fictional human operator or guaranteed staff availability |
| Capture | One concise three-field form after the initial question; unchecked required privacy consent |
| Context | Pending question survives refresh; retry uses a stable message UUID |
| Answers | Internal intent routing + published knowledge; prices/status computed by code |
| Handoff | Admin inbox/status and manual Email/WhatsApp shortcuts, not an external ticket or confirmed booking |
| Consent | Contact/transcript consent is separate from cookie/analytics preferences |

A global cookie-consent banner was not silently added: changing analytics execution and privacy choices is a separate scope. Essential session and temporary tab storage are disclosed; contact fields are not persisted in browser storage.

## Public flow

`question → contact form + consent + Turnstile → profile transaction → answer persisted → answer shown → admin follow-up`

`POST /api/assistant/session` creates/restores an essential signed 30-minute HttpOnly/SameSite Strict cookie. It returns only the owning session's display name, masked transcript and pending question, never full email or phone. No caller-supplied session ID is accepted.

Before consent the pending question is held only in tab-local sessionStorage, masked for common sensitive patterns and expired after 30 minutes. Name/email/phone form values are memory-only. Once consent is submitted, `/api/assistant/profile` stores the contact profile and initial question transactionally in the existing private schema. A refresh between registration and answer can resume the same pending message.

`POST /api/assistant/chat` requires a signed session with a registered profile. Supplied history, prices, roles and tool names are rejected. A stable message UUID prevents duplicate exchanges during retries; the first question comes from saved server context. The answer is stored before the API reports success. A failed save never falsely reports a submitted consultation/support request.

## Internal knowledge

Structured documents use `{id,title,href,text,keywords}`. ID namespaces: `service:`, `workflow:`, `product:`, `case:`, `faq:`, `pricing:`, plus curated about/contact/privacy/VPS facts.

Sources: published CMS services/products/FAQs/pricing and published portfolio records, with local public fallbacks. Service workflow comes from its `process` array. Case studies include public challenge/solution/outcome, not confidential project documents or customer records. ReTendance uses the audited catalog; VPS prices remain quotation-based. No embeddings, vector service or model inference is used.

Routing: guardrails → private-account restriction → status/support/consultation intent → deterministic estimate → topic/keyword retrieval → safe clarification. Workflow and case-study questions receive their specific reference category. Up to three validated public sources are rendered as plain React text/link output.

Production chat/capabilities import no Cloudflare Workers AI provider. Legacy provider/factory files remain for rollback/regression tests, but are not reachable through production chat routes. Existing keys and tokens are not edited or revoked. Cloudflare Turnstile remains anti-bot infrastructure, not an answering LLM.

## Storage and admin

Private `conversations` holds consented contact fields, pending question, lead status and fixed `expires_at`. `exchanges` holds masked question/answer pairs, sources, skill and unique `(conversation_id,client_message_id)`. No raw IP/user-agent, secret, action token, attachment or model prompt is added to the inbox.

All new RPCs are SECURITY INVOKER, empty search_path, executable by service_role only. Existing private tables retain RLS with no anon/authenticated table access. Public requests derive the session ID from a verified HMAC cookie; admin requests retain existing admin auth and mutation Origin checks. Secret keys remain server-only.

Admin: Chat Agent → Leads & Chat Inbox, and Business → Leads (profiled-only view). Statuses: New, Contacted, In progress, Closed. Lists paginate 20 rows. Automatic refresh every 10 seconds only while visible and not in a delete/status operation; this is near-real-time polling, not a WebSocket subscription. Opening a WhatsApp/Email shortcut is manual; no outbound message is automatically sent.

The 7-day TTL never slides on new messages or status updates. Existing hourly cleanup deletes the conversation, contact fields, pending text and child exchanges. Administrator deletion cascades to the same data, while separate inquiry/invoice/quotation records remain untouched. A short-lived content-free marker prevents an active deleted session from recreating its data. Backups/provider logs have separate retention.

Capacity remains bounded: 50 exchanges/session, 5,000 retained exchanges and 2,000 conversations. No paid service, plan upgrade, realtime channel or new API credential is introduced.

## Verification checklist

- Form gate cannot be bypassed through the chat API.
- Invalid names/emails/phones, absent consent, honeypot, oversized/unknown parameters are rejected.
- Origin, signed session, rate limit and Turnstile action/hostname checked.
- No LLM calls, regardless of old environment flags.
- Refresh before/after form submission preserves the question; idempotent retry prevents duplicate transcripts.
- Own-session restoration never accepts another visitor's ID.
- Admin read/delete/status require existing authorization; no secret or unsafe HTML rendering.
- Database fixtures check fixed TTL, expiry, cascade deletion, status filters, idempotency and role grants with rollback.
- Test contact data uses reserved example.invalid addresses; no real customer data is used in test submissions.
