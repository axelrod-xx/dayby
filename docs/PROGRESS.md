# Progress

## Current Phase

Phase 8: Preservation and archive foundation.

## Completed

- Project documentation scaffold.
- Expo + TypeScript + Expo Router scaffold.
- Expo SDK 55 dependency alignment.
- Supabase `dayby` project discovered and initial migrations applied.
- Cloudflare R2 `dayby` bucket confirmed.
- Supabase client foundation with missing-config guard.
- Apple and Google sign-in UI route.
- Development email sign-in route gated by `EXPO_PUBLIC_ENABLE_DEV_AUTH`.
- Native iOS Apple Sign In path.
- Supabase OAuth browser path for Google and non-iOS Apple.
- Profile setup route with display name and timezone persistence.
- Home and Groups placeholder flows.
- Phase 1 database migration for users, groups, members, invites, indexes, triggers, helper functions, and RLS.
- Phase 2 group create/list/detail first pass.
- Phase 2 invite code creation, member list, and join-by-code route.
- Phase 3 camera recording route first pass.
- Phase 3 trim preview placeholder route.
- Phase 4 R2 upload/download signed URL Edge Function stubs.
- Phase 4 post-to-groups flow with single asset and multiple daily posts.
- R2 upload guard added: uploads stay disabled until real native 2-second trimming is implemented.
- Phase 4+ tables for assets, daily posts, votes, winners, generated videos, activity events, reports, and subscriptions.
- Phase 5 Daily Reel fetch/display route.
- Phase 6 Vote route and one-vote insert flow.
- Phase 6 winner decision RPC with random tie handling.
- Phase 7 Monthly Memory preview route.
- Phase 8 group activity RPC for post/view/download/vote/open/archive_restore.
- Phase 8 Archive route for quiet and archived groups.
- Group list now separates active groups from quiet/archive candidates.
- Phase 9 report form and group detail safety entry point.
- Phase 3/4 trim metadata contract: selected start, 2-second duration, native-trim flag, and upload guard.
- Phase 3 Trim screen now requires processing before choosing groups.
- Phase 4 Post screen carries trim metadata into `video_assets`.
- Phase 8 lifecycle RPC for Active / Quiet / Archived / Memory Active / Dormant transitions.
- EAS build profiles added for iOS/Android development, preview, and production.
- Local tracked-file secret scanner added.
- Daily Reel and Monthly Memory export controls added with save/share hooks.
- Supabase Edge Functions `r2-upload-url` and `r2-download-url` deployed with JWT verification enabled.
- R2 Edge Function secrets set in Supabase.
- Expo/EAS project created and linked: `@ryoaxelrod/dayby`.
- EAS public env vars configured for development, preview, and production.
- Android development build started on EAS.
- External service inventory documented.

## Verified

- `npm run typecheck`
- `npm run check:secrets`
- `npm audit --audit-level=moderate`
- Expo Web starts on `http://localhost:8081`
- `/` returns HTTP 200 and contains `dayby`
- `/sign-in` returns HTTP 200 and contains `Continue with Apple`
- `/sign-in` shows dev email login when `EXPO_PUBLIC_ENABLE_DEV_AUTH=true`
- `/profile-setup` returns HTTP 200 and contains `Set your name`
- `/groups/create` returns HTTP 200 and contains `Create group`
- `/groups/join` returns HTTP 200 and contains `Invite code`
- `/camera` returns HTTP 200 and contains `Camera`
- `/post` returns HTTP 200 and contains `Post to groups`
- `/trim?uri=&muted=0` returns HTTP 200 and contains `Process 2 sec`
- `/post?uri=local-dev/test.mp4&muted=0&trimStartMs=0&trimDurationMs=2000&isNativeTrimmed=0` returns HTTP 200 and shows dev upload guard copy
- `/daily/demo/2026-05-20` returns HTTP 200 and contains `Daily Reel`
- `/vote/demo/2026-05-20` returns HTTP 200 and contains `Best 2 sec`
- `/monthly/demo/2026/5` returns HTTP 200 and contains `moments`
- `/archive` returns HTTP 200 and contains `Archive`
- `/safety/report?groupId=demo` returns HTTP 200 and contains `Send report`
- Daily and Monthly routes include export controls; generated MP4 URI wiring is still pending.
- Supabase migrations present remotely: `initial_phase_1`, `allow_group_owner_read`
- Supabase migrations present remotely: `group_invite_join_rpc`, `memory_core_schema`
- Supabase migrations present remotely: `decide_daily_winner_rpc`
- Supabase migrations present remotely: `record_group_activity_rpc`
- Supabase migrations present remotely: `add_trim_metadata`
- Supabase migrations present remotely: `group_lifecycle_rpc`
- Supabase Edge Functions are ACTIVE: `r2-upload-url`, `r2-download-url`.
- Supabase secrets list contains R2 keys: account id, access key id, secret access key, bucket.
- Unauthenticated Edge Function requests return `401`, confirming JWT protection.
- EAS project info resolves for `@ryoaxelrod/dayby`.
- Android development build is in progress: `7039ab95-79ab-4015-a8ff-9537900314c2`.
- Supabase RLS enabled on `users`, `groups`, `group_members`, `group_invites`
- Supabase RLS enabled on memory core tables.

## In Progress / Next

- Validate Apple and Google providers after account setup.
- Use dev email sign-in while Apple/Google provider setup is pending.
- Add actual native 2-second trimming implementation.
- Choose and wire native video processing library inside Expo Dev Client.
- After native trimming, enable `EXPO_PUBLIC_ENABLE_R2_UPLOADS=true` for real R2 upload testing.
- Run signed URL smoke test after Auth rate limit clears or after Apple/Google/dev session is available.
- Check Android development build result and install the APK when complete.
- Add export/save/share for Daily Reel and Monthly Memory.
- Add actual server-generated Daily/Monthly MP4 cache later.
- Add automatic scheduled status transitions for Active / Quiet / Archived / Dormant.
- Re-run `npm audit` and `npx expo install --check` when npm registry requests stop timing out.

## Blocked By External Setup

- Supabase publishable key added to local `.env.local`; do not commit this file.
- Apple Sign in with Apple configuration.
- Google OAuth configuration.
- R2 server-side access key created and registered in Supabase Edge Function secrets. Rotate before production.
- iOS and Android development builds for native camera verification.
- iOS development build still needs Apple Developer credentials/signing.

## Tool Limits Observed

- Supabase publishable key could be fetched through the connected Supabase tool.
- Supabase Auth provider enablement for Apple/Google is not exposed through the currently available tools.
- Cloudflare R2 permanent S3 access key creation is not exposed through the currently available tools; the visible API can create temporary credentials only when a parent access key already exists.
