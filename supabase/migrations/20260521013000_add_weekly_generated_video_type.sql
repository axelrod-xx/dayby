alter table public.generated_videos
drop constraint if exists generated_videos_type_check;

alter table public.generated_videos
add constraint generated_videos_type_check
check (type in ('daily', 'weekly', 'monthly', 'yearly', 'event'));
