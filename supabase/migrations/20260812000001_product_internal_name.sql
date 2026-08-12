-- Medhour Pharmacy — internal stock name on products
--
-- The pharmacy's own stock system ("MEDHOUR PRICE LIST.xlsx") uses short
-- internal names such as `COTTOL WOOL 500gm china`. The storefront shows a
-- tidied customer-facing name, so we keep the untouched original here to let
-- staff reconcile the website against their till/stock export.

alter table public.products
  add column if not exists internal_name text;

comment on column public.products.internal_name is
  'Verbatim item name from the pharmacy stock system. Reference only — never shown to customers.';

create index if not exists products_internal_name_idx
  on public.products (internal_name);
