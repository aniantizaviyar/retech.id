create sequence if not exists public.business_invoice_number_seq start 1;

create or replace function public.next_invoice_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'RTD/INV/' || to_char(current_date, 'YYYY') || '/' || lpad(nextval('public.business_invoice_number_seq')::text, 4, '0');
$$;

create table if not exists public.business_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  branch text,
  currency text not null default 'IDR',
  instructions text,
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists business_payment_accounts_default_idx
  on public.business_payment_accounts (is_default) where is_default;

create table if not exists public.business_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  quotation_id uuid references public.business_quotations(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date not null,
  customer_company text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  subject text not null,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  discount_amount numeric(16, 2) not null default 0 check (discount_amount >= 0),
  payment_account_id uuid references public.business_payment_accounts(id) on delete restrict,
  payment_account_snapshot jsonb not null default '{}'::jsonb,
  payment_terms text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.business_invoices(id) on delete restrict,
  payment_account_id uuid not null references public.business_payment_accounts(id) on delete restrict,
  payment_date date not null default current_date,
  amount numeric(16, 2) not null check (amount > 0),
  method text not null default 'Bank Transfer',
  reference_number text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_invoices_status_idx on public.business_invoices (status);
create index if not exists business_invoices_created_at_idx on public.business_invoices (created_at desc);
create index if not exists business_payments_invoice_idx on public.business_payments (invoice_id, payment_date desc);

drop trigger if exists business_payment_accounts_set_updated_at on public.business_payment_accounts;
create trigger business_payment_accounts_set_updated_at before update on public.business_payment_accounts
for each row execute function public.set_updated_at();
drop trigger if exists business_invoices_set_updated_at on public.business_invoices;
create trigger business_invoices_set_updated_at before update on public.business_invoices
for each row execute function public.set_updated_at();
drop trigger if exists business_payments_set_updated_at on public.business_payments;
create trigger business_payments_set_updated_at before update on public.business_payments
for each row execute function public.set_updated_at();

alter table public.business_payment_accounts enable row level security;
alter table public.business_invoices enable row level security;
alter table public.business_payments enable row level security;
revoke all on table public.business_payment_accounts, public.business_invoices, public.business_payments from anon, authenticated;
grant all on table public.business_payment_accounts, public.business_invoices, public.business_payments to service_role;
revoke all on sequence public.business_invoice_number_seq from anon, authenticated;
grant usage, select on sequence public.business_invoice_number_seq to service_role;
revoke all on function public.next_invoice_number() from public, anon, authenticated;
grant execute on function public.next_invoice_number() to service_role;

insert into public.business_payment_accounts (label, bank_name, account_name, account_number, currency, instructions, is_active, is_default)
select 'OCBC - Rekening Utama', 'Bank OCBC', 'PT RETECH DIGITAL SOLUTION', '693800148498', 'IDR', 'Cantumkan nomor invoice pada berita transfer.', true, true
where not exists (select 1 from public.business_payment_accounts where account_number = '693800148498');

comment on table public.business_payment_accounts is 'Private receiving accounts available for RETECH invoices.';
comment on table public.business_invoices is 'Private RETECH invoices with immutable payment-account snapshots.';
comment on table public.business_payments is 'Private payment records linked to RETECH invoices.';
