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

### votes

- Select: voter can see own vote. Aggregate results should be exposed through controlled views/functions after deadline.
- Insert: voter must be group member, vote as self, and target a post in the same group/date.
- Update: not allowed in MVP, or allow replacement before deadline through a function.
- Database unique key enforces one vote per user per group per date.

### daily_winners

- Select: group members only.
- Insert/update/delete: backend service only.

### generated_videos

- Select: group members only.
- Insert/update/delete: backend service only.

### reports

- Insert: authenticated users.
- Select/update: reporter for own report status or admin tooling later.

## Backend-Only Operations

- Create signed R2 upload URL.
- Create signed playback/download URL.
- Join group invite safely.
- Decide daily winner.
- Generate Daily/Monthly video artifacts.
- Run retention and deletion scheduling.
