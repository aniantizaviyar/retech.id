# RETECH assistant history

> Historical initial design. Superseded on 2026-11-03 by the [internal chat agent](docs/internal-chat-agent-20261103.md): required consented contact form, private lead inbox and no production LLM calls. Contact profiles share the conversation's 7-day retention and are removed with administrator deletion.

## Behavior

- Admin: **AI Assistant → Riwayat Chat**. Existing admin authentication is unchanged.
- Separate visitor history opt-in is off by default, independent of optional Cloudflare AI consent.
- Only the current visitor question and the actual server-produced answer are recorded. Submitted client history is never imported as a transcript.
- Existing signed, HttpOnly, SameSite=Strict, 30-minute session cookie contains an ID, not chat text. No new persistent browser storage or tracking cookie is added.
- Database: Supabase `assistant_private` schema, service-role-only invoker RPCs, RLS enabled, no anonymous/authenticated grants. No secrets in the frontend.
- Common email, phone/number and credential patterns are masked before persistence. This is best effort, not guaranteed anonymization. Contact forms and signed action tokens are never copied into history.
- Consultation/support references and submission status are shown without duplicating the inquiry contact details. Deleting a chat never deletes an inquiry, invoice or quotation.

## Retention / capacity

- A conversation expires 7 days after its first recorded exchange; later activity does not extend its retention.
- All list/detail/write RPCs exclude expired records immediately.
- `retech-assistant-history-cleanup` runs at minute 17 of every UTC hour, physically deleting expired conversations and their exchanges. Up to one extra hour can elapse before physical cleanup. Provider backups and operational logs have separate retention.
- Deleting a conversation immediately cascades to all its exchanges. A content-free marker lasts 31 minutes to stop an active session recreating the deleted history; the marker is also cleaned hourly.
- Maximum 50 exchanges/session and 5,000 exchanges in the retained store. Capacity/contention/storage failure does not interrupt chat; the visitor is told when a requested exchange could not be recorded.
- Admin lists 20 conversations/page. No attachments, embeddings, realtime subscriptions or paid services were added.
- Database was about 13 MB before this change, on Supabase Free. Deletes allow normal autovacuum to reuse space; do not run `VACUUM FULL` on production for this feature.

## Verification

`npm run test:assistant` includes history consent/redaction, auth/Origin, UUID/pagination/body validation, fixed delete RPC, safe errors, text-only UI, plus the existing skills/session/invoice/quotation regression suite.

Database transactional fixtures verified insert/detail, request status, expiry filtering, delete cascade, deleted-session protection, cleanup execution and anonymous/authenticated denial. All test records were rolled back.

Inspect the cleanup job without reading chat contents:

```sql
select jobid, jobname, schedule, active from cron.job
where jobname = 'retech-assistant-history-cleanup';
select status, start_time, end_time from cron.job_run_details
where jobid in (select jobid from cron.job where jobname = 'retech-assistant-history-cleanup')
order by start_time desc limit 5;
```

Never print messages or raw database/provider errors in application logs. Never give the browser a Supabase service key. Existing security-advisor warnings on unrelated legacy RPCs are outside this feature; the new history functions are security invoker and denied to anon/authenticated.
