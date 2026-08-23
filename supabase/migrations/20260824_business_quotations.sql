create sequence if not exists public.business_quotation_number_seq start 1;

create or replace function public.next_quotation_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'RTD/QTN/' || to_char(current_date, 'YYYY') || '/' || lpad(nextval('public.business_quotation_number_seq')::text, 4, '0');
$$;

create table if not exists public.business_quotations (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  issue_date date not null default current_date,
  valid_until date not null,
  customer_company text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  subject text not null,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  discount_amount numeric(16, 2) not null default 0 check (discount_amount >= 0),
  timeline text,
  payment_terms text,
  scope_included text[] not null default '{}',
  scope_excluded text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_quotations_status_idx on public.business_quotations (status);
create index if not exists business_quotations_created_at_idx on public.business_quotations (created_at desc);

drop trigger if exists business_quotations_set_updated_at on public.business_quotations;
create trigger business_quotations_set_updated_at before update on public.business_quotations
for each row execute function public.set_updated_at();

alter table public.business_quotations enable row level security;
revoke all on table public.business_quotations from anon, authenticated;
grant all on table public.business_quotations to service_role;
revoke all on sequence public.business_quotation_number_seq from anon, authenticated;
grant usage, select on sequence public.business_quotation_number_seq to service_role;
revoke all on function public.next_quotation_number() from public, anon, authenticated;
grant execute on function public.next_quotation_number() to service_role;

comment on table public.business_quotations is
'Private RETECH quotation records. Service-role access only; customer snapshots are never exposed publicly.';
