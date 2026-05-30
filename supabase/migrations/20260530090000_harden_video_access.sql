create table if not exists public.upload_url_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 3000000),
  created_at timestamptz not null default now()
);

create index if not exists upload_url_requests_user_created_idx
on public.upload_url_requests(user_id, created_at desc);

alter table public.upload_url_requests enable row level security;

grant select, insert on public.upload_url_requests to authenticated;

drop policy if exists "users can read own upload url requests" on public.upload_url_requests;
create policy "users can read own upload url requests"
on public.upload_url_requests
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users can create own upload url requests" on public.upload_url_requests;
create policy "users can create own upload url requests"
on public.upload_url_requests
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "group admins can read reports" on public.reports;
create policy "group admins can read reports"
on public.reports
for select
to authenticated
using (
  group_id is not null
  and (select private.is_group_admin(group_id))
);

drop policy if exists "group admins can update reports" on public.reports;
create policy "group admins can update reports"
on public.reports
for update
to authenticated
using (
  group_id is not null
  and (select private.is_group_admin(group_id))
)
with check (
  group_id is not null
  and (select private.is_group_admin(group_id))
);
