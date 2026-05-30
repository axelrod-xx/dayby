# RLS Policy

## Principles

- Enable RLS on every table exposed in `public`.
- Use indexed columns in policies.
- Wrap `auth.uid()` as `(select auth.uid())` in policy expressions.
- Do not use user-editable metadata for authorization.
- Put complex helper functions in a private schema.

## Access Rules

### users

- Select: self and users sharing at least one group.
- Insert: only matching authenticated user id during profile creation.
- Update: self only.

### groups

- Select: members only.
- Insert: authenticated user can create a group they own.
- Update: owner/admin only.
- Delete: owner only, or backend service.

### group_members

- Select: members of the same group.
- Insert: owner/admin or trusted invite-join backend function.
- Update: owner/admin only.
- Delete: owner/admin, or self for leaving a group.

### group_invites

- Select/create/update: owner/admin only.
- Join by code should use a backend function that checks expiry, revocation, max uses, and member limit.

### video_assets

- Insert: owner user only.
- Select: owner user, or group members where a daily post references the asset.
- Update/delete: owner or backend moderation flow.

### daily_posts

- Select: group members only.
- Insert: authenticated user must be posting as self and must be a group member.
- Update/delete: post owner can delete own post; owner/admin can moderate.
- Database unique key enforces one post per user per group per date.

### post_bookmarks

- Select: user can see only their own bookmarks.
- Insert: user must bookmark as self, be a group member, and target a visible post in the same group.
- Delete: user can remove only their own bookmark.
- Database unique key enforces one bookmark per user per post.

### monthly_highlight_items

- Select: group members only.
- Insert/update/delete: backend service only. The app should not let users regenerate or hand-edit the shared monthly snapshot.

### generated_videos

- Select: group members only.
- Insert/update/delete: backend service only.

### reports

- Insert: authenticated users.
- Select/update: reporter for own report status, and group owner/admin for reports attached to their group.

### upload_url_requests

- Select: user can see only their own upload URL request history.
- Insert: user can record only their own upload URL request.
- Update/delete: unavailable to the app.

## Backend-Only Operations

- Create signed R2 upload URL.
- Create signed playback/download URL.
- Join group invite safely.
- Generate monthly highlight snapshots.
- Generate Daily/Weekly/Monthly video artifacts.
- Run retention and deletion scheduling.
