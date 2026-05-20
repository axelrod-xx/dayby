create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  owner_id uuid not null references public.users(id),
  timezone text not null,
  member_limit integer not null default 8 check (member_limit between 2 and 50),
  plan text not null default 'free' check (plan in ('free', 'plus', 'event', 'org')),
  monthly_highlight_enabled boolean not null default false,
  download_enabled boolean not null default true,
  status text not null default 'active' check (
    status in (
      'active',
      'quiet',
      'archived',
      'memory_active',
      'dormant',
      'delete_scheduled',
      'deleted'
    )
  ),
  last_posted_at timestamptz,
  last_viewed_at timestamptz,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  code text unique not null,
  created_by uuid not null references public.users(id),
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists groups_owner_id_idx on public.groups(owner_id);
create index if not exists group_members_group_id_idx on public.group_members(group_id);
create index if not exists group_members_user_id_idx on public.group_members(user_id);
create index if not exists group_invites_group_id_idx on public.group_invites(group_id);
create index if not exists group_invites_created_by_idx on public.group_invites(created_by);
create index if not exists group_invites_code_idx on public.group_invites(code);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function private.set_updated_at();

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
before update on public.groups
for each row execute function private.set_updated_at();

create or replace function private.is_group_member(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_group_admin(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = (select auth.uid())
      and gm.role in ('owner', 'admin')
  );
$$;

create or replace function private.is_group_owner(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups g
    where g.id = target_group_id
      and g.owner_id = (select auth.uid())
  );
$$;

create or replace function private.shares_group_with(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user_id
  );
$$;

alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;

drop policy if exists "users can read self and shared group profiles" on public.users;
create policy "users can read self and shared group profiles"
on public.users
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.shares_group_with(id))
);

drop policy if exists "users can insert own profile" on public.users;
create policy "users can insert own profile"
on public.users
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile"
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "members can read groups" on public.groups;
create policy "members can read groups"
on public.groups
for select
to authenticated
using ((select private.is_group_member(id)));

drop policy if exists "users can create owned groups" on public.groups;
create policy "users can create owned groups"
on public.groups
for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "admins can update groups" on public.groups;
create policy "admins can update groups"
on public.groups
for update
to authenticated
using ((select private.is_group_admin(id)))
with check ((select private.is_group_admin(id)));

drop policy if exists "members can read group members" on public.group_members;
create policy "members can read group members"
on public.group_members
for select
to authenticated
using ((select private.is_group_member(group_id)));

drop policy if exists "owners can insert their owner membership" on public.group_members;
create policy "owners can insert their owner membership"
on public.group_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and (select private.is_group_owner(group_id))
);

drop policy if exists "admins can manage group members" on public.group_members;
create policy "admins can manage group members"
on public.group_members
for update
to authenticated
using ((select private.is_group_admin(group_id)))
with check ((select private.is_group_admin(group_id)));

drop policy if exists "admins and self can delete group members" on public.group_members;
create policy "admins and self can delete group members"
on public.group_members
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_group_admin(group_id))
);

drop policy if exists "admins can read invites" on public.group_invites;
create policy "admins can read invites"
on public.group_invites
for select
to authenticated
using ((select private.is_group_admin(group_id)));

drop policy if exists "admins can create invites" on public.group_invites;
create policy "admins can create invites"
on public.group_invites
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_group_admin(group_id))
);

drop policy if exists "admins can update invites" on public.group_invites;
create policy "admins can update invites"
on public.group_invites
for update
to authenticated
using ((select private.is_group_admin(group_id)))
with check ((select private.is_group_admin(group_id)));
