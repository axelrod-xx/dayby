create table if not exists public.video_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  r2_key text not null unique,
  thumbnail_r2_key text,
  duration_ms integer not null default 2000 check (duration_ms between 1500 and 2500),
  size_bytes bigint check (size_bytes is null or size_bytes > 0),
  has_audio boolean not null default true,
  captured_at timestamptz not null,
  expires_at timestamptz,
  keep_until date,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_posts (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.video_assets(id),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id),
  date date not null,
  captured_at timestamptz not null,
  is_winner boolean not null default false,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(group_id, user_id, date)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  voter_id uuid not null references public.users(id),
  post_id uuid not null references public.daily_posts(id),
  target_date date not null,
  created_at timestamptz not null default now(),
  unique(group_id, voter_id, target_date)
);

create table if not exists public.daily_winners (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  date date not null,
  post_id uuid references public.daily_posts(id) on delete set null,
  asset_id uuid not null references public.video_assets(id),
  winner_user_id uuid not null references public.users(id),
  decided_at timestamptz not null default now(),
  unique(group_id, date)
);

create table if not exists public.generated_videos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  type text not null check (type in ('daily', 'monthly', 'yearly', 'event')),
  target_date date,
  year integer,
  month integer,
  r2_key text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_activity_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid references public.users(id),
  event_type text not null check (event_type in ('post', 'view', 'download', 'vote', 'open', 'archive_restore')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id),
  group_id uuid references public.groups(id) on delete cascade,
  post_id uuid references public.daily_posts(id) on delete set null,
  reason text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  group_id uuid references public.groups(id) on delete cascade,
  plan text,
  provider text,
  status text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_assets_user_id_idx on public.video_assets(user_id);
create index if not exists daily_posts_asset_id_idx on public.daily_posts(asset_id);
create index if not exists daily_posts_group_date_captured_idx on public.daily_posts(group_id, date, captured_at);
create index if not exists daily_posts_user_date_idx on public.daily_posts(user_id, date);
create index if not exists votes_group_target_date_idx on public.votes(group_id, target_date);
create index if not exists votes_post_id_idx on public.votes(post_id);
create index if not exists daily_winners_group_date_idx on public.daily_winners(group_id, date);
create index if not exists generated_videos_group_target_idx on public.generated_videos(group_id, type, year, month, target_date);
create index if not exists group_activity_events_group_created_idx on public.group_activity_events(group_id, created_at);
create index if not exists reports_group_id_idx on public.reports(group_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_group_id_idx on public.subscriptions(group_id);

drop trigger if exists generated_videos_set_updated_at on public.generated_videos;
create trigger generated_videos_set_updated_at
before update on public.generated_videos
for each row execute function private.set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function private.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function private.set_updated_at();

create or replace function private.asset_visible_to_current_user(target_asset_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.video_assets va
    where va.id = target_asset_id
      and va.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.daily_posts dp
    join public.group_members gm on gm.group_id = dp.group_id
    where dp.asset_id = target_asset_id
      and gm.user_id = (select auth.uid())
  );
$$;

create or replace function private.post_belongs_to_group_date(target_post_id uuid, target_group_id uuid, target_date date)
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
      and dp.date = target_date
      and dp.deleted_at is null
  );
$$;

create or replace function private.post_asset_owned_by_current_user(target_asset_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.video_assets va
    where va.id = target_asset_id
      and va.user_id = (select auth.uid())
  );
$$;

alter table public.video_assets enable row level security;
alter table public.daily_posts enable row level security;
alter table public.votes enable row level security;
alter table public.daily_winners enable row level security;
alter table public.generated_videos enable row level security;
alter table public.group_activity_events enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;

create policy "asset owners and group members can read assets"
on public.video_assets
for select
to authenticated
using ((select private.asset_visible_to_current_user(id)));

create policy "users can create own assets"
on public.video_assets
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "asset owners can update assets"
on public.video_assets
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "members can read daily posts"
on public.daily_posts
for select
to authenticated
using ((select private.is_group_member(group_id)));

create policy "members can create own daily posts"
on public.daily_posts
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_group_member(group_id))
  and (select private.post_asset_owned_by_current_user(asset_id))
);

create policy "post owners and admins can update daily posts"
on public.daily_posts
for update
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_group_admin(group_id))
)
with check (
  user_id = (select auth.uid())
  or (select private.is_group_admin(group_id))
);

create policy "voters can read own votes"
on public.votes
for select
to authenticated
using (voter_id = (select auth.uid()));

create policy "members can create own votes"
on public.votes
for insert
to authenticated
with check (
  voter_id = (select auth.uid())
  and (select private.is_group_member(group_id))
  and (select private.post_belongs_to_group_date(post_id, group_id, target_date))
);

create policy "members can read winners"
on public.daily_winners
for select
to authenticated
using ((select private.is_group_member(group_id)));

create policy "members can read generated videos"
on public.generated_videos
for select
to authenticated
using ((select private.is_group_member(group_id)));

create policy "members can create activity events"
on public.group_activity_events
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_group_member(group_id))
);

create policy "admins can read activity events"
on public.group_activity_events
for select
to authenticated
using ((select private.is_group_admin(group_id)));

create policy "users can create reports"
on public.reports
for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy "reporters can read own reports"
on public.reports
for select
to authenticated
using (reporter_id = (select auth.uid()));

create policy "users can read own subscriptions"
on public.subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));
