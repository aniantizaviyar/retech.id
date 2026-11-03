-- Applied as Supabase migration 20261103031610; filename aligned with remote history.
-- Approved 2026-11-03: required contact form, existing admin only, 7-day TTL.
-- No public table grants, extra identities, external CRM or LLM integration.
alter table assistant_private.conversations
  add column contact_name text check(char_length(contact_name) between 2 and 80),
  add column contact_email text check(char_length(contact_email) between 3 and 254),
  add column contact_phone text check(char_length(contact_phone) between 8 and 20),
  add column contact_consented_at timestamptz,
  add column lead_status text not null default 'new' check(lead_status in ('new','contacted','in_progress','closed')),
  add column lead_status_updated_at timestamptz,
  add column pending_question text check(char_length(pending_question)<=1200),
  add column pending_message_id uuid,
  add constraint assistant_profile_complete check (
    (contact_name is null and contact_email is null and contact_phone is null and contact_consented_at is null)
    or (contact_name is not null and contact_email is not null and contact_phone is not null and contact_consented_at is not null));
alter table assistant_private.exchanges add column client_message_id uuid;
create unique index assistant_agent_message_once on assistant_private.exchanges(conversation_id,client_message_id) where client_message_id is not null;
create index assistant_agent_lead_status on assistant_private.conversations(lead_status,last_activity_at desc) where contact_name is not null;

create function public.assistant_agent_session(p_id uuid) returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('id',c.id,'contact_name',c.contact_name,'expires_at',c.expires_at,
   'pending_question',c.pending_question,'pending_message_id',c.pending_message_id,
   'exchanges',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'client_message_id',e.client_message_id,
     'question',e.question,'answer',e.answer,'skill',e.skill,'sources',e.sources,'created_at',e.created_at) order by e.created_at,e.id)
     from assistant_private.exchanges e where e.conversation_id=c.id),'[]'::jsonb))
 from assistant_private.conversations c where c.id=p_id and c.expires_at>now();
$$;
create function public.assistant_agent_register(p_id uuid,p_name text,p_email text,p_phone text,p_question text,p_message_id uuid,p_locale text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare c assistant_private.conversations;
begin
 perform pg_advisory_xact_lock(735121);
 if exists(select 1 from assistant_private.deleted_sessions where id=p_id and expires_at>now()) then return false; end if;
 select * into c from assistant_private.conversations where id=p_id for update;
 if found then
   if c.expires_at<=now() then return false; end if;
   if c.contact_name is not null then
     return c.contact_name=p_name and c.contact_email=p_email and c.contact_phone=p_phone
       and (c.pending_message_id=p_message_id or exists(select 1 from assistant_private.exchanges where conversation_id=p_id and client_message_id=p_message_id));
   end if;
 else
   if (select count(*) from assistant_private.conversations)>=2000 then return false; end if;
   insert into assistant_private.conversations(id,locale,preview) values(p_id,p_locale,left(p_question,160));
 end if;
 update assistant_private.conversations set contact_name=p_name,contact_email=p_email,contact_phone=p_phone,
   contact_consented_at=now(),consent_version='chat-agent-v2-7d',pending_question=p_question,pending_message_id=p_message_id,
   locale=p_locale,preview=left(p_question,160) where id=p_id;
 return true;
end $$;
create function public.assistant_agent_exchange(p_id uuid,p_message_id uuid,p_question text,p_answer text,p_skill text,p_sources jsonb,p_kind text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c assistant_private.conversations; e assistant_private.exchanges;
begin
 perform pg_advisory_xact_lock(735121);
 select * into c from assistant_private.conversations where id=p_id for update;
 if not found or c.expires_at<=now() or c.contact_name is null then return jsonb_build_object('saved',false); end if;
 select * into e from assistant_private.exchanges where conversation_id=p_id and client_message_id=p_message_id;
 if found then return jsonb_build_object('saved',true,'exchange',to_jsonb(e)-'conversation_id'); end if;
 if c.pending_message_id is not null and c.pending_message_id<>p_message_id then return jsonb_build_object('saved',false); end if;
 if c.exchange_count>=50 or (select count(*) from assistant_private.exchanges)>=5000 then return jsonb_build_object('saved',false); end if;
 insert into assistant_private.exchanges(conversation_id,client_message_id,question,answer,skill,provider,sources,request_id,request_kind,followup_status)
   values(p_id,p_message_id,case when c.pending_message_id=p_message_id then c.pending_question else p_question end,p_answer,p_skill,'guided',p_sources,
     case when p_kind is not null then p_message_id end,p_kind,case when p_kind is null then 'none' else 'submitted' end) returning * into e;
 update assistant_private.conversations set exchange_count=exchange_count+1,last_activity_at=now(),preview=left(e.question,160),
   pending_question=case when pending_message_id=p_message_id then null else pending_question end,
   pending_message_id=case when pending_message_id=p_message_id then null else pending_message_id end,
   followup_status=case when p_kind is null then followup_status else 'submitted' end where id=p_id;
 return jsonb_build_object('saved',true,'exchange',to_jsonb(e)-'conversation_id');
end $$;
create function public.assistant_agent_inbox(p_page integer default 1,p_leads_only boolean default false,p_status text default null)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare v_rows jsonb; v_total integer;
begin
 if p_page<1 or p_page>250 or (p_status is not null and p_status not in ('new','contacted','in_progress','closed')) then raise exception 'Invalid filter'; end if;
 select count(*) into v_total from assistant_private.conversations where expires_at>now()
   and (not p_leads_only or contact_name is not null) and (p_status is null or lead_status=p_status);
 select coalesce(jsonb_agg(to_jsonb(c)-'pending_question'-'pending_message_id'),'[]'::jsonb) into v_rows from
   (select * from assistant_private.conversations where expires_at>now() and (not p_leads_only or contact_name is not null)
     and (p_status is null or lead_status=p_status) order by last_activity_at desc,id limit 20 offset (p_page-1)*20) c;
 return jsonb_build_object('conversations',v_rows,'total',v_total,'page',p_page,'pageSize',20,'retentionDays',7);
end $$;
create function public.assistant_agent_set_status(p_id uuid,p_status text) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 if p_status not in ('new','contacted','in_progress','closed') then raise exception 'Invalid status'; end if;
 update assistant_private.conversations set lead_status=p_status,lead_status_updated_at=now()
   where id=p_id and contact_name is not null and expires_at>now();
 return found;
end $$;
revoke all on function public.assistant_agent_session(uuid) from public,anon,authenticated;
revoke all on function public.assistant_agent_register(uuid,text,text,text,text,uuid,text) from public,anon,authenticated;
revoke all on function public.assistant_agent_exchange(uuid,uuid,text,text,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.assistant_agent_inbox(integer,boolean,text) from public,anon,authenticated;
revoke all on function public.assistant_agent_set_status(uuid,text) from public,anon,authenticated;
grant execute on function public.assistant_agent_session(uuid) to service_role;
grant execute on function public.assistant_agent_register(uuid,text,text,text,text,uuid,text) to service_role;
grant execute on function public.assistant_agent_exchange(uuid,uuid,text,text,text,jsonb,text) to service_role;
grant execute on function public.assistant_agent_inbox(integer,boolean,text) to service_role;
grant execute on function public.assistant_agent_set_status(uuid,text) to service_role;
-- Parent TTL/cascade and its existing hourly cron also purge profile fields and pending text.
notify pgrst,'reload schema';
