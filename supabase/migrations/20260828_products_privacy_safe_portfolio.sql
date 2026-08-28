create table if not exists public.cms_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  data_id jsonb not null default '{}'::jsonb,
  data_en jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 99,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cms_products_set_updated_at on public.cms_products;
create trigger cms_products_set_updated_at before update on public.cms_products
for each row execute function public.set_updated_at();

alter table public.cms_products enable row level security;
revoke all on table public.cms_products from anon, authenticated;
grant all on table public.cms_products to service_role;

update public.portfolio_projects set gallery = '[
  {"src":"/privacy-safe/logistics-platform.png","alt":"Visual konseptual platform logistik dengan tracking, status rute, dan estimasi tarif","alt_en":"Conceptual logistics platform with tracking, route status, and rate estimation"}
]'::jsonb where slug = 'logistics-company-website';

update public.portfolio_projects set gallery = '[
  {"src":"/privacy-safe/operations-cms.png","alt":"Visual konseptual dashboard CMS dengan workflow konten, approval, dan analitik","alt_en":"Conceptual CMS dashboard with content workflow, approvals, and analytics"}
]'::jsonb where slug = 'operations-dashboard-cms';

update public.portfolio_projects set gallery = '[
  {"src":"/privacy-safe/hrms-attendance.png","alt":"Visual konseptual HRMS dengan analitik kehadiran, shift, dan approval cuti","alt_en":"Conceptual HRMS with attendance analytics, shifts, and leave approvals"}
]'::jsonb where slug = 'hrms-attendance-platform';

update public.portfolio_projects set gallery = '[
  {"src":"/privacy-safe/infrastructure-observability.png","alt":"Visual konseptual monitoring infrastruktur dengan health score, bandwidth, dan status layanan","alt_en":"Conceptual infrastructure monitoring with health score, bandwidth, and service status"}
]'::jsonb where slug = 'infrastructure-monitoring';

update public.portfolio_projects set gallery = '[
  {"src":"/privacy-safe/android-attendance.png","alt":"Visual konseptual aplikasi Android untuk check-in aman, validasi lokasi, dan riwayat kehadiran","alt_en":"Conceptual Android application for secure check-in, location validation, and attendance history"}
]'::jsonb where slug = 'android-attendance-app';

comment on table public.cms_products is 'Public bilingual product catalog managed through RETECH CMS.';
