create or replace function public.join_group_with_code(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text;
  invite_record public.group_invites%rowtype;
  member_count integer;
begin
  normalized_code := upper(trim(invite_code));

  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  select *
  into invite_record
  from public.group_invites gi
  where gi.code = normalized_code
    and gi.revoked_at is null
    and (gi.expires_at is null or gi.expires_at > now())
    and (gi.max_uses is null or gi.used_count < gi.max_uses)
  limit 1;

  if invite_record.id is null then
    raise exception 'invalid or expired invite code';
  end if;

  select count(*)
  into member_count
  from public.group_members gm
  where gm.group_id = invite_record.group_id;

  if member_count >= (
    select g.member_limit
    from public.groups g
    where g.id = invite_record.group_id
  ) then
    raise exception 'group member limit reached';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (invite_record.group_id, (select auth.uid()), 'member')
  on conflict (group_id, user_id) do nothing;

  update public.group_invites
  set used_count = used_count + 1
  where id = invite_record.id
    and not exists (
      select 1
      from public.group_members gm
      where gm.group_id = invite_record.group_id
        and gm.user_id = (select auth.uid())
        and gm.joined_at < now() - interval '1 second'
    );

  return invite_record.group_id;
end;
$$;

grant execute on function public.join_group_with_code(text) to authenticated;
