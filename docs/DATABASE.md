# Database Design

## Initial Tables

The schema starts small but keeps the product constraints in the database.

- `users`: public profile linked to `auth.users`.
- `groups`: group settings, timezone, plan, retention activity fields.
- `group_members`: membership and roles.
- `group_invites`: invite codes and links.
- `video_assets`: one uploaded 2-second asset.
- `daily_posts`: asset posted to a group for a group-local date.
- `post_bookmarks`: private per-user saves for posts.
- `monthly_highlight_items`: frozen source list for a generated monthly highlight.
- `generated_videos`: Daily/Weekly/Monthly generated MP4 cache.
- `group_activity_events`: post/view/download/bookmark/open events.
- `reports`: safety and moderation reports.
- `subscriptions`: later payment/subscription state.

Legacy migrations may still contain `votes` and `daily_winners` while old development databases are migrated. They are no longer app-facing product primitives.

## Key Constraints

- `daily_posts unique(group_id, user_id, date)` enforces one post per user per group per day.
- `post_bookmarks unique(post_id, user_id)` enforces one private bookmark per member per post.
- `monthly_highlight_items unique(group_id, year, month, position)` freezes a stable monthly order.
- `monthly_highlight_items unique(group_id, year, month, post_id)` prevents duplicate clips in one monthly highlight.
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
- `post_bookmarks(group_id, user_id)`
- `post_bookmarks(post_id)`
- `monthly_highlight_items(group_id, year, month, position)`
- `generated_videos(group_id, type, year, month, target_date)`
- `group_activity_events(group_id, created_at)`

## Migration Policy

- Use Supabase migrations for schema changes.
- Enable RLS in the same migration that creates public tables.
- Never rely on app logic alone for one-post or one-bookmark rules.
- Keep generated videos as cacheable artifacts; long-term memory is the archive plus frozen monthly highlight metadata.

## Open Design Notes

- `video_url` should not be stored as a permanent public URL. Prefer `r2_key` and signed URL generation.
- Bookmark visibility should be personal. Aggregate bookmark signals can be used by backend curation, but should not be exposed as social numbers.
- Monthly highlight generation should be server-side to preserve the frozen snapshot.
