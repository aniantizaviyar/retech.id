alter table public.business_invoices
  add column if not exists delivery_status text not null default 'not_sent',
  add column if not exists last_email_recipient text,
  add column if not exists email_attempts integer not null default 0,
  add column if not exists sent_at timestamptz,
  add column if not exists last_email_at timestamptz,
  add column if not exists last_email_event_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists bounce_reason text,
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists last_reminder_at timestamptz,
  add column if not exists reminder_count integer not null default 0;

create table if not exists public.business_invoice_email_events (
  id bigint generated always as identity primary key,
  invoice_id uuid not null references public.business_invoices(id) on delete cascade,
  event text not null,
  recipient text not null,
  provider_message_id text,
  reason text,
  event_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.business_customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null default 'Service',
  description text,
  unit text not null default 'paket',
  unit_price numeric(16,2) not null default 0 check (unit_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.business_receipt_number_seq start 1;
create or replace function public.next_receipt_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'RTD/RCT/' || to_char(current_date, 'YYYY') || '/' || lpad(nextval('public.business_receipt_number_seq')::text, 4, '0');
$$;

alter table public.business_payments add column if not exists receipt_number text;
create unique index if not exists business_payments_receipt_number_idx on public.business_payments(receipt_number) where receipt_number is not null;
create index if not exists business_invoice_email_events_invoice_idx on public.business_invoice_email_events(invoice_id, event_at desc);
create index if not exists business_invoices_due_date_idx on public.business_invoices(due_date, status);
create index if not exists business_customers_company_idx on public.business_customers(company_name);
create index if not exists business_products_name_idx on public.business_products(name);

alter table public.business_invoice_email_events enable row level security;
alter table public.business_customers enable row level security;
alter table public.business_products enable row level security;
grant all on table public.business_invoice_email_events, public.business_customers, public.business_products to service_role;
grant usage, select on sequence public.business_invoice_email_events_id_seq, public.business_receipt_number_seq to service_role;
grant execute on function public.next_receipt_number() to service_role;

comment on table public.business_invoice_email_events is 'Private Brevo delivery and reminder history for invoices.';
comment on table public.business_customers is 'Private RETECH customer master data.';
comment on table public.business_products is 'Private RETECH product and service price book.';
