alter table public.groups
add column if not exists lifecycle_checked_at timestamptz,
add column if not exists delete_scheduled_at timestamptz,
add column if not exists delete_after timestamptz;

create or replace function public.refresh_group_lifecycle_states()
returns table (
  group_id uuid,
  old_status text,
  new_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with stats as (
    select
      g.id,
      g.status,
      g.created_at,
      g.last_posted_at,
      greatest(g.last_posted_at, g.last_viewed_at, g.last_downloaded_at, g.created_at) as last_memory_activity_at,
      exists (
        select 1
        from public.daily_posts dp
        where dp.group_id = g.id
      ) as has_posts
    from public.groups g
    where g.status <> 'deleted'
  ),
  next_states as (
    select
      stats.id,
      stats.status as old_status,
      case
        when not stats.has_posts and stats.created_at < now() - interval '30 days' then 'deleted'
        when stats.created_at < now() - interval '4 years'
          and stats.last_memory_activity_at < now() - interval '12 months'
          then 'dormant'
        when stats.last_posted_at is not null
          and stats.last_posted_at >= now() - interval '30 days'
          then 'active'
        when stats.last_memory_activity_at >= now() - interval '12 months'
          and coalesce(stats.last_posted_at, stats.created_at) < now() - interval '90 days'
          then 'memory_active'
        when coalesce(stats.last_posted_at, stats.created_at) < now() - interval '90 days'
          then 'archived'
        when coalesce(stats.last_posted_at, stats.created_at) < now() - interval '30 days'
          then 'quiet'
        else 'active'
      end as new_status
    from stats
  ),
  updated as (
    update public.groups g
    set
      status = ns.new_status,
      lifecycle_checked_at = now(),
      delete_scheduled_at = case
        when ns.new_status = 'dormant' and g.delete_scheduled_at is null then now()
        when ns.new_status <> 'dormant' then null
        else g.delete_scheduled_at
      end,
      delete_after = case
        when ns.new_status = 'dormant' and g.delete_after is null then now() + interval '90 days'
        when ns.new_status <> 'dormant' then null
        else g.delete_after
      end
    from next_states ns
    where g.id = ns.id
      and (
        g.status is distinct from ns.new_status
        or g.lifecycle_checked_at is null
        or g.lifecycle_checked_at < now() - interval '1 day'
      )
    returning g.id, ns.old_status, g.status
  )
  select updated.id, updated.old_status, updated.status
  from updated;
end;
$$;

revoke execute on function public.refresh_group_lifecycle_states() from public;
revoke execute on function public.refresh_group_lifecycle_states() from anon;
revoke execute on function public.refresh_group_lifecycle_states() from authenticated;
