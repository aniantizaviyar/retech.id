create table if not exists public.saas_tenants (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.business_customers(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  display_name text not null,
  product text not null check (product in ('qr-order-pos', 'attendance')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'suspended', 'cancelled')),
  primary_contact_email text,
  primary_contact_phone text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saas_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  product text not null check (product in ('qr-order-pos', 'attendance')),
  plan_code text not null,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  amount numeric(16,2) not null default 0 check (amount >= 0),
  currency text not null default 'IDR',
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'grace_period', 'suspended', 'cancelled')),
  seat_quantity integer not null default 1 check (seat_quantity > 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_until timestamptz,
  auto_renew boolean not null default true,
  payment_provider text,
  external_reference text,
  last_payment_at timestamptz,
  entitlements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists saas_tenants_set_updated_at on public.saas_tenants;
create trigger saas_tenants_set_updated_at before update on public.saas_tenants
for each row execute function public.set_updated_at();
drop trigger if exists saas_subscriptions_set_updated_at on public.saas_subscriptions;
create trigger saas_subscriptions_set_updated_at before update on public.saas_subscriptions
for each row execute function public.set_updated_at();

create index if not exists saas_tenants_customer_idx on public.saas_tenants(customer_id);
create index if not exists saas_tenants_product_status_idx on public.saas_tenants(product, status);
create index if not exists saas_subscriptions_tenant_idx on public.saas_subscriptions(tenant_id, created_at desc);
create index if not exists saas_subscriptions_status_period_idx on public.saas_subscriptions(status, current_period_end);
create unique index if not exists saas_subscriptions_external_reference_idx on public.saas_subscriptions(external_reference) where external_reference is not null;

alter table public.saas_tenants enable row level security;
alter table public.saas_subscriptions enable row level security;
revoke all on table public.saas_tenants, public.saas_subscriptions from anon, authenticated;
grant all on table public.saas_tenants, public.saas_subscriptions to service_role;

comment on table public.saas_tenants is 'Private tenant registry for RETECH subscription products.';
comment on table public.saas_subscriptions is 'Private subscription lifecycle and entitlement registry. Activation must follow a verified payment event.';
