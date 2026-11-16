-- Keep delivery recipients in the private quotation snapshot, not the customer
-- master, so future customer changes cannot add recipients to old quotations.
alter table public.business_quotations
  add column customer_cc text[] not null default '{}'::text[],
  add constraint business_quotations_customer_cc_limit
    check (cardinality(customer_cc) <= 10 and array_position(customer_cc, null::text) is null);

comment on column public.business_quotations.customer_cc is
  'Optional CC for quotation email; not rendered in the PDF.';
