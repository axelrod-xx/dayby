# Database Design

## Initial Tables

The schema starts small but keeps the product constraints in the database.

- `users`: public profile linked to `auth.users`.
- `groups`: group settings, timezone, plan, retention activity fields.
- `group_members`: membership and roles.
- `group_invites`: invite codes and links.
- `video_assets`: one uploaded 2-second asset.
- `daily_posts`: asset posted to a group for a group-local date.
- `votes`: one member vote per target date.
- `daily_winners`: one kept moment per group per day.
- `generated_videos`: Daily/Monthly generated MP4 cache.
- `group_activity_events`: post/view/download/vote/open events.
- `reports`: safety and moderation reports.
- `subscriptions`: later payment/subscription state.

## Key Constraints

- `daily_posts unique(group_id, user_id, date)` enforces one post per user per group per day.
- `votes unique(group_id, voter_id, target_date)` enforces one vote per member per day.
- `daily_winners unique(group_id, date)` enforces one winner per group per day.
- `group_members unique(group_id, user_id)` prevents duplicate membership.
- `video_assets.duration_ms` should be constrained around 2 seconds.

## Important Indexes

- `group_members(user_id)`
- `group_members(group_id)`
- `groups(owner_id)`
- `group_invites(code)`
- `video_assets(user_id)`
- `daily_posts(group_id, date, captured_at)`
- `daily_posts(asset_id)`
- `daily_posts(user_id, date)`
- `votes(group_id, target_date)`
- `votes(post_id)`
- `daily_winners(group_id, date)`
- `generated_videos(group_id, type, year, month, target_date)`
- `group_activity_events(group_id, created_at)`

## Migration Policy

- Use Supabase migrations for schema changes.
- Enable RLS in the same migration that creates public tables.
- Never rely on app logic alone for one-post or one-vote rules.
- Keep generated videos as cacheable artifacts; long-term memory is the winner asset plus metadata.

## Open Design Notes

- `video_url` should not be stored as a permanent public URL. Prefer `r2_key` and signed URL generation.
- Vote visibility should be conservative before result announcement.
- Winner decision should be server-side to avoid client manipulation.
