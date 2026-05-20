# Progress

## Current Phase

Phase 1: Auth and Profile foundation.

## Completed

- Project documentation scaffold.
- Expo + TypeScript + Expo Router scaffold.
- Expo SDK 55 dependency alignment.
- Supabase `dayby` project discovered and initial migrations applied.
- Cloudflare R2 `dayby` bucket confirmed.
- Supabase client foundation with missing-config guard.
- Apple and Google sign-in UI route.
- Native iOS Apple Sign In path.
- Supabase OAuth browser path for Google and non-iOS Apple.
- Profile setup route with display name and timezone persistence.
- Home and Groups placeholder flows.
- Phase 1 database migration for users, groups, members, invites, indexes, triggers, helper functions, and RLS.
- Phase 2 group create/list/detail first pass.
- External service inventory documented.

## Verified

- `npm run typecheck`
- `npm audit --audit-level=moderate`
- Expo Web starts on `http://localhost:8081`
- `/` returns HTTP 200 and contains `dayby`
- `/sign-in` returns HTTP 200 and contains `Continue with Apple`
- `/profile-setup` returns HTTP 200 and contains `Set your name`
- `/groups/create` returns HTTP 200 and contains `Create group`
- Supabase migrations present remotely: `initial_phase_1`, `allow_group_owner_read`
- Supabase RLS enabled on `users`, `groups`, `group_members`, `group_invites`

## In Progress / Next

- Validate Apple and Google providers after account setup.
- Add invite code/link flow.
- Add member list and group settings.
- Add R2 signed upload/download function design and implementation.

## Blocked By External Setup

- Supabase publishable key for `.env.local`.
- Apple Sign in with Apple configuration.
- Google OAuth configuration.
- R2 server-side access key for signed upload/download endpoint.
- GitHub remote repository creation.
