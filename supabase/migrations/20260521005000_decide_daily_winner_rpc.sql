create or replace function public.decide_daily_winner(target_group_id uuid, target_date date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_post public.daily_posts%rowtype;
  winner_id uuid;
begin
  if not (select private.is_group_admin(target_group_id)) then
    raise exception 'admin access required';
  end if;

  select dp.*
  into chosen_post
  from public.daily_posts dp
  left join public.votes v on v.post_id = dp.id
  where dp.group_id = target_group_id
    and dp.date = target_date
    and dp.deleted_at is null
  group by dp.id
  order by count(v.id) desc, random()
  limit 1;

  if chosen_post.id is null then
    raise exception 'no daily posts found';
  end if;

  insert into public.daily_winners (
    group_id,
    date,
    post_id,
    asset_id,
    winner_user_id,
    decided_at
  )
  values (
    target_group_id,
    target_date,
    chosen_post.id,
    chosen_post.asset_id,
    chosen_post.user_id,
    now()
  )
  on conflict (group_id, date) do update
  set post_id = excluded.post_id,
      asset_id = excluded.asset_id,
      winner_user_id = excluded.winner_user_id,
      decided_at = excluded.decided_at
  returning id into winner_id;

  update public.daily_posts
  set is_winner = id = chosen_post.id
  where group_id = target_group_id
    and date = target_date;

  update public.video_assets
  set keep_until = greatest(coalesce(keep_until, current_date), current_date + interval '4 years')
  where id = chosen_post.asset_id;

  return winner_id;
end;
$$;

grant execute on function public.decide_daily_winner(uuid, date) to authenticated;
