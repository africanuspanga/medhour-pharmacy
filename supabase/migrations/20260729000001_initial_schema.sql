-- Medhour Pharmacy — initial schema
-- Run with: supabase db push  (or paste into the SQL editor)

-- ============ Extensions ============
create extension if not exists "pgcrypto";

-- ============ Profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Categories & Brands ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============ Products ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  generic_name text,
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  sku text unique,
  description text,
  short_description text,
  usage_info text,
  warnings text,
  keywords text[],
  pack_size text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int not null default 5,
  requires_prescription boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active) where is_active;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ Inventory ============
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change int not null,
  movement_type text not null check (movement_type in ('order_placed','order_cancelled','manual_adjustment','restock')),
  reason text,
  order_id uuid,
  admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ Carts ============
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

-- ============ Addresses ============
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  region text not null,
  district text not null,
  address_line text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ Prescriptions ============
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  phone text not null,
  file_path text not null,
  notes text,
  fulfilment_method text check (fulfilment_method in ('delivery','pickup')),
  delivery_address text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','clarification_requested')),
  admin_notes text,
  order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ Orders ============
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'MED-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')
  ),
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  delivery_method text not null check (delivery_method in ('delivery','pickup')),
  region text,
  district text,
  delivery_address text,
  landmark text,
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  payment_method text not null check (payment_method in ('cash_on_delivery','pay_on_pickup','mobile_money')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded','cash_on_delivery')),
  order_status text not null default 'pending'
    check (order_status in ('pending','confirmed','preparing','ready_for_pickup','out_for_delivery','completed','cancelled')),
  customer_notes text,
  admin_notes text,
  prescription_id uuid references public.prescriptions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_status_idx on public.orders (order_status);

alter table public.inventory_movements
  add constraint inventory_movements_order_fk
  foreign key (order_id) references public.orders (id) on delete set null;

alter table public.prescriptions
  add constraint prescriptions_order_fk
  foreign key (order_id) references public.orders (id) on delete set null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  pack_size text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null,
  requires_prescription boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  prescription_id uuid references public.prescriptions (id) on delete cascade,
  admin_id uuid references public.profiles (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ============ Helper: is current user an admin? ============
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.prescriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.admin_notes enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()));

-- Categories & brands: public read of active, admin write
create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "brands_public_read" on public.brands for select using (true);
create policy "brands_admin_write" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

-- Products: public read of active, admin write
create policy "products_public_read" on public.products
  for select using ((is_active and archived_at is null) or public.is_admin());
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- Inventory movements: admin only
create policy "inventory_admin" on public.inventory_movements
  for all using (public.is_admin()) with check (public.is_admin());

-- Carts: owner only
create policy "carts_owner" on public.carts
  for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "cart_items_owner" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid())
  );

-- Addresses: owner only
create policy "addresses_owner" on public.addresses
  for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

-- Prescriptions: insert by anyone (guest upload), read own or admin, admin write
create policy "prescriptions_insert" on public.prescriptions
  for insert with check (true);
create policy "prescriptions_read" on public.prescriptions
  for select using (auth.uid() = customer_id or public.is_admin());
create policy "prescriptions_admin_write" on public.prescriptions
  for update using (public.is_admin()) with check (public.is_admin());

-- Orders: insert by anyone (guest checkout), read own or admin, admin update
create policy "orders_insert" on public.orders
  for insert with check (customer_id is null or auth.uid() = customer_id);
create policy "orders_read" on public.orders
  for select using (auth.uid() = customer_id or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items_insert" on public.order_items
  for insert with check (true);
create policy "order_items_read" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "order_status_history_insert" on public.order_status_history
  for insert with check (public.is_admin());
create policy "order_status_history_read" on public.order_status_history
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

create policy "admin_notes_admin" on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ Storage buckets ============
-- Product images: public read. Prescriptions: PRIVATE — never public URLs.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do nothing;

-- Product images: anyone can read, admins can write
create policy "product_images_storage_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_storage_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_storage_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_storage_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- Prescriptions: upload by anyone, read own files or admin (signed URLs only)
create policy "prescriptions_storage_upload" on storage.objects
  for insert with check (bucket_id = 'prescriptions');
create policy "prescriptions_storage_read" on storage.objects
  for select using (bucket_id = 'prescriptions' and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1]));
create policy "prescriptions_storage_admin_delete" on storage.objects
  for delete using (bucket_id = 'prescriptions' and public.is_admin());
