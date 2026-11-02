-- Applied as Supabase migration 20261102111225; filename aligned to remote history.
-- No anonymous/authenticated Data API access. Only the existing server-side
-- service role may execute these invoker RPCs; the admin cookie is checked in Next.
create schema if not exists assistant_private;
revoke all on schema assistant_private from public, anon, authenticated;
grant usage on schema assistant_private to service_role;

create table assistant_private.conversations (
  id uuid primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  last_activity_at timestamptz not null default now(),
  locale text not null check (locale in ('id','en')),
  preview text not null check (char_length(preview) <= 160),
  exchange_count integer not null default 0 check (exchange_count between 0 and 50),
  followup_status text not null default 'none' check (followup_status in ('none','draft','submitted')),
  consent_version text not null default 'chat-history-v1-7d'
);
create index assistant_conversations_expiry on assistant_private.conversations (expires_at);
create index assistant_conversations_activity on assistant_private.conversations (last_activity_at desc, id);
create table assistant_private.exchanges (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references assistant_private.conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  question text not null check (char_length(question) between 1 and 1200),
  answer text not null check (char_length(answer) between 1 and 6000),
  skill text not null check (skill in ('search_information','estimate_price','request_consultation','create_support_request','check_service_status','guardrail','clarification')),
  provider text not null check (provider in ('guided','cloudflare')),
  sources jsonb not null default '[]' check (jsonb_typeof(sources)='array' and jsonb_array_length(sources)<=3 and char_length(sources::text)<=2000),
  request_id uuid,
  request_kind text check (request_kind in ('consultation','support')),
  followup_status text not null default 'none' check (followup_status in ('none','draft','submitted'))
);
create index assistant_exchanges_conversation on assistant_private.exchanges (conversation_id, created_at, id);
-- A short-lived, content-free deletion marker prevents an active cookie session
-- from immediately recreating a conversation removed by an administrator.
create table assistant_private.deleted_sessions (
  id uuid primary key,
  expires_at timestamptz not null default now() + interval '31 minutes'
);
alter table assistant_private.conversations enable row level security;
alter table assistant_private.exchanges enable row level security;
alter table assistant_private.deleted_sessions enable row level security;
revoke all on all tables in schema assistant_private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema assistant_private to service_role;

create function public.assistant_record_exchange(
  p_session_id uuid, p_locale text, p_question text, p_answer text,
  p_skill text, p_provider text, p_sources jsonb,
  p_request_id uuid default null, p_request_kind text default null
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_conversation assistant_private.conversations;
begin
  -- Bound storage on the Free plan; contention/capacity never blocks the chat.
  if not pg_try_advisory_xact_lock(735121) then return false; end if;
  if exists(select 1 from assistant_private.deleted_sessions where id=p_session_id and expires_at>now()) then return false; end if;
  if (select count(*) from assistant_private.exchanges) >= 5000 then return false; end if;
  insert into assistant_private.conversations(id,locale,preview)
    values(p_session_id,p_locale,left(p_question,160)) on conflict(id) do nothing;
  select * into v_conversation from assistant_private.conversations where id=p_session_id for update;
  if v_conversation.expires_at<=now() or v_conversation.exchange_count>=50 then return false; end if;
  insert into assistant_private.exchanges(conversation_id,question,answer,skill,provider,sources,request_id,request_kind,followup_status)
    values(p_session_id,p_question,p_answer,p_skill,p_provider,p_sources,p_request_id,p_request_kind,
      case when p_request_id is null then 'none' else 'draft' end);
  update assistant_private.conversations set last_activity_at=now(), preview=left(p_question,160),
    exchange_count=exchange_count+1,
    followup_status=case when followup_status='submitted' then 'submitted' when p_request_id is not null then 'draft' else followup_status end
    where id=p_session_id;
  return true;
end $$;

create function public.assistant_history_list(p_page integer default 1)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_total integer; v_rows jsonb;
begin
  if p_page<1 or p_page>250 then raise exception 'Invalid page'; end if;
  select count(*) into v_total from assistant_private.conversations where expires_at>now();
  select coalesce(jsonb_agg(to_jsonb(c) - 'consent_version'),'[]'::jsonb) into v_rows
    from (select * from assistant_private.conversations where expires_at>now()
      order by last_activity_at desc,id limit 20 offset (p_page-1)*20) c;
  return jsonb_build_object('conversations',v_rows,'total',v_total,'page',p_page,'pageSize',20,'retentionDays',7);
end $$;
create function public.assistant_history_detail(p_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('conversation',to_jsonb(c)-'consent_version','exchanges',
    coalesce((select jsonb_agg(to_jsonb(e)-'conversation_id' order by e.created_at,e.id)
      from assistant_private.exchanges e where e.conversation_id=c.id),'[]'::jsonb))
  from assistant_private.conversations c where c.id=p_id and c.expires_at>now();
$$;
create function public.assistant_history_delete(p_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(735121);
  if not exists(select 1 from assistant_private.conversations where id=p_id) then return false; end if;
  insert into assistant_private.deleted_sessions(id) values(p_id)
    on conflict(id) do update set expires_at=now()+interval '31 minutes';
  delete from assistant_private.conversations where id=p_id;
  return true;
end $$;
create function public.assistant_history_mark_submitted(p_session_id uuid,p_request_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(735121);
  update assistant_private.exchanges e set followup_status='submitted'
    where e.conversation_id=p_session_id and e.request_id=p_request_id
    and exists(select 1 from assistant_private.conversations c where c.id=e.conversation_id and c.expires_at>now());
  if found then update assistant_private.conversations set followup_status='submitted' where id=p_session_id; end if;
end $$;

revoke all on function public.assistant_record_exchange(uuid,text,text,text,text,text,jsonb,uuid,text) from public,anon,authenticated;
revoke all on function public.assistant_history_list(integer) from public,anon,authenticated;
revoke all on function public.assistant_history_detail(uuid) from public,anon,authenticated;
revoke all on function public.assistant_history_delete(uuid) from public,anon,authenticated;
revoke all on function public.assistant_history_mark_submitted(uuid,uuid) from public,anon,authenticated;
grant execute on function public.assistant_record_exchange(uuid,text,text,text,text,text,jsonb,uuid,text) to service_role;
grant execute on function public.assistant_history_list(integer) to service_role;
grant execute on function public.assistant_history_detail(uuid) to service_role;
grant execute on function public.assistant_history_delete(uuid) to service_role;
grant execute on function public.assistant_history_mark_submitted(uuid,uuid) to service_role;

create extension if not exists pg_cron;
create function assistant_private.cleanup_history() returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(735121);
  delete from assistant_private.conversations where expires_at<=now();
  delete from assistant_private.deleted_sessions where expires_at<=now();
  delete from cron.job_run_details where jobid in
    (select jobid from cron.job where jobname='retech-assistant-history-cleanup')
    and end_time<now()-interval '7 days';
end $$;
revoke all on function assistant_private.cleanup_history() from public,anon,authenticated,service_role;
-- Expired records are immediately excluded by every read/write RPC. Physical
-- removal runs hourly, independently of visitor traffic. Backups are separate.
select cron.schedule('retech-assistant-history-cleanup','17 * * * *',
  'select assistant_private.cleanup_history();');
notify pgrst,'reload schema';
