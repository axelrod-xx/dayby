create table if not exists public.post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create index if not exists post_bookmarks_group_user_idx on public.post_bookmarks(group_id, user_id);
create index if not exists post_bookmarks_post_id_idx on public.post_bookmarks(post_id);

create table if not exists public.monthly_highlight_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  position integer not null check (position between 1 and 30),
  post_id uuid references public.daily_posts(id) on delete set null,
  asset_id uuid not null references public.video_assets(id),
  user_id uuid not null references public.users(id),
  source_date date not null,
  captured_at timestamptz not null,
  display_name text not null,
  r2_key text not null,
  created_at timestamptz not null default now(),
  unique(group_id, year, month, position),
  unique(group_id, year, month, post_id)
);

create index if not exists monthly_highlight_items_group_month_idx
on public.monthly_highlight_items(group_id, year, month, position);

create or replace function private.post_belongs_to_group(target_post_id uuid, target_group_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.daily_posts dp
    where dp.id = target_post_id
      and dp.group_id = target_group_id
      and dp.deleted_at is null
  );
$$;

alter table public.post_bookmarks enable row level security;
alter table public.monthly_highlight_items enable row level security;

drop policy if exists "users can read own bookmarks" on public.post_bookmarks;
create policy "users can read own bookmarks"
on public.post_bookmarks
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "members can create own bookmarks" on public.post_bookmarks;
create policy "members can create own bookmarks"
on public.post_bookmarks
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_group_member(group_id))
  and (select private.post_belongs_to_group(post_id, group_id))
);

drop policy if exists "users can delete own bookmarks" on public.post_bookmarks;
create policy "users can delete own bookmarks"
on public.post_bookmarks
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "members can read monthly highlight items" on public.monthly_highlight_items;
create policy "members can read monthly highlight items"
on public.monthly_highlight_items
for select
to authenticated
using ((select private.is_group_member(group_id)));

grant select, insert, delete on public.post_bookmarks to authenticated;
grant select on public.monthly_highlight_items to authenticated;

alter table public.group_activity_events
drop constraint if exists group_activity_events_event_type_check;

alter table public.group_activity_events
add constraint group_activity_events_event_type_check
check (event_type in ('post', 'view', 'download', 'vote', 'bookmark', 'open', 'archive_restore'));

create or replace function public.record_group_activity(target_group_id uuid, target_event_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if target_event_type not in ('post', 'view', 'download', 'vote', 'bookmark', 'open', 'archive_restore') then
    raise exception 'Unsupported activity event type: %', target_event_type;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = current_user_id
  ) then
    raise exception 'Not a group member';
  end if;

  insert into public.group_activity_events (group_id, user_id, event_type)
  values (target_group_id, current_user_id, target_event_type);

  update public.groups
  set
    last_posted_at = case when target_event_type = 'post' then now() else last_posted_at end,
    last_viewed_at = case when target_event_type in ('view', 'bookmark', 'open', 'archive_restore') then now() else last_viewed_at end,
    last_downloaded_at = case when target_event_type = 'download' then now() else last_downloaded_at end,
    status = case
      when target_event_type in ('post', 'archive_restore') then 'active'
      when target_event_type in ('view', 'download', 'bookmark', 'open')
        and status in ('quiet', 'archived', 'dormant', 'delete_scheduled')
        then 'memory_active'
      else status
    end
  where id = target_group_id;
end;
$$;

grant execute on function public.record_group_activity(uuid, text) to authenticated;
