alter table public.video_assets
add column if not exists trim_start_ms integer not null default 0 check (trim_start_ms >= 0),
add column if not exists trim_duration_ms integer not null default 2000 check (trim_duration_ms between 1500 and 2500),
add column if not exists is_native_trimmed boolean not null default true,
add column if not exists processed_at timestamptz;

create index if not exists video_assets_processed_at_idx on public.video_assets(processed_at);
