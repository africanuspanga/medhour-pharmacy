-- Contact form messages
-- Submissions are inserted by a server action using the service-role client
-- (bypasses RLS). Only admins can read or manage messages.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "contact_messages_admin_read" on public.contact_messages
  for select using (public.is_admin());

create policy "contact_messages_admin_update" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

create policy "contact_messages_admin_delete" on public.contact_messages
  for delete using (public.is_admin());
