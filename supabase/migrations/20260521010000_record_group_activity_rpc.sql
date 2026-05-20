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

  if target_event_type not in ('post', 'view', 'download', 'vote', 'open', 'archive_restore') then
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
    last_viewed_at = case when target_event_type in ('view', 'open', 'archive_restore') then now() else last_viewed_at end,
    last_downloaded_at = case when target_event_type = 'download' then now() else last_downloaded_at end,
    status = case
      when target_event_type in ('post', 'archive_restore') then 'active'
      when target_event_type in ('view', 'download', 'open')
        and status in ('quiet', 'archived', 'dormant', 'delete_scheduled')
        then 'memory_active'
      else status
    end
  where id = target_group_id;
end;
$$;

grant execute on function public.record_group_activity(uuid, text) to authenticated;
