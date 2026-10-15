-- Required before enabling the ReTendance connector in production.
-- Does not touch POS subscriptions or customer/employee data.
-- If existing attendance duplicates are present, this intentionally fails;
-- resolve them manually without deleting billing history, then retry.
create unique index if not exists saas_attendance_single_open_subscription_idx
  on public.saas_subscriptions (tenant_id)
  where product = 'attendance' and status <> 'cancelled';
