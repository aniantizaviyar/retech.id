alter table public.business_quotations
  add column if not exists delivery_status text not null default 'not_sent',
  add column if not exists last_email_recipient text,
  add column if not exists brevo_message_id text,
  add column if not exists email_attempts integer not null default 0,
  add column if not exists sent_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists last_email_at timestamptz,
  add column if not exists last_email_event_at timestamptz,
  add column if not exists bounce_reason text;

alter table public.business_quotations drop constraint if exists business_quotations_delivery_status_check;
alter table public.business_quotations add constraint business_quotations_delivery_status_check
  check (delivery_status in ('not_sent', 'submitted', 'sent', 'delivered', 'opened', 'clicked', 'deferred', 'soft_bounce', 'hard_bounce', 'blocked', 'invalid', 'spam', 'unsubscribed', 'error'));

create table if not exists public.business_quotation_email_events (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.business_quotations(id) on delete cascade,
  event text not null check (event in ('not_sent', 'submitted', 'sent', 'delivered', 'opened', 'clicked', 'deferred', 'soft_bounce', 'hard_bounce', 'blocked', 'invalid', 'spam', 'unsubscribed', 'error')),
  recipient text not null,
  provider_message_id text,
  reason text,
  event_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_quotation_email_events_quotation_idx
  on public.business_quotation_email_events (quotation_id, event_at desc);
create index if not exists business_quotation_email_events_message_idx
  on public.business_quotation_email_events (provider_message_id);

alter table public.business_quotation_email_events enable row level security;
revoke all on table public.business_quotation_email_events from anon, authenticated;
grant all on table public.business_quotation_email_events to service_role;

comment on table public.business_quotation_email_events is
'Private audit trail for RETECH quotation email delivery events received from Brevo.';
