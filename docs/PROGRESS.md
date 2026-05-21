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
- Quiet Weekly Memory route added as a secondary progress preview.
- Supabase Edge Functions `r2-upload-url` and `r2-download-url` deployed with JWT verification enabled.
- R2 Edge Function secrets set in Supabase.
- Expo/EAS project created and linked: `@ryoaxelrod/dayby`.
- EAS public env vars configured for development, preview, and production.
- Android development build started on EAS.
- `react-native-video-trim` added for native 2-second trim/compress in development builds.
- External service inventory documented.
- User action checklist restored in readable Japanese.
- First youth-facing UI polish pass added for Home and Group Detail.
- R2 upload path now fails visibly when enabled instead of falling back to local-dev keys.
- Post creation now records local processed MP4 size and blocks oversized MVP uploads before R2.

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
- `/weekly/demo/2026-05-18` returns HTTP 200 and contains `THIS WEEK`
- `/archive` returns HTTP 200 and contains `Archive`
- `/safety/report?groupId=demo` returns HTTP 200 and contains `Send report`
- Home web UI shows the revised `Shoot 10 sec. / Keep 2 sec.` hero and `Memory rhythm` section.
- Home and `/groups/demo` web checks completed with no browser console errors.
- Upload path typechecks with local file-size inspection and visible R2 failure behavior.
- Daily and Monthly routes include export controls; generated MP4 URI wiring is still pending.
- Supabase migrations present remotely: `initial_phase_1`, `allow_group_owner_read`
- Supabase migrations present remotely: `group_invite_join_rpc`, `memory_core_schema`
- Supabase migrations present remotely: `decide_daily_winner_rpc`
- Supabase migrations present remotely: `record_group_activity_rpc`
- Supabase migrations present remotely: `add_trim_metadata`
- Supabase migrations present remotely: `group_lifecycle_rpc`
- Supabase migrations present remotely: `add_weekly_generated_video_type`
- Supabase Edge Functions are ACTIVE: `r2-upload-url`, `r2-download-url`.
- Supabase secrets list contains R2 keys: account id, access key id, secret access key, bucket.
- Unauthenticated Edge Function requests return `401`, confirming JWT protection.
- EAS project info resolves for `@ryoaxelrod/dayby`.
- Android development build finished before native trim dependency: `7039ab95-79ab-4015-a8ff-9537900314c2`.
- Android development build with native trim dependency finished: `491f6ff5-6f40-4a5d-bef9-330da0d9d560`.
- Removed old account-scope EAS env vars from abandoned apps.
- iOS device development build attempted; blocked by missing internal distribution credentials.
- iOS encryption declaration and EAS app version source configured.
- iOS simulator development build profile added for credential-light build checks.
- iOS simulator development build finished: `1f6ab1b8-5bee-4333-825b-484a68f3f5b5`.
- Native trim service typechecks with `react-native-video-trim` dynamic import.
- Android development APK ready: `https://expo.dev/artifacts/eas/a2HhNgdv8TMoGhhCXwZKxE.apk`
- EAS account-scope env list is empty for preview and production; dayby project-scope env remains.
- iOS device build needs interactive Apple credential setup before it can be queued.
- iOS simulator archive ready: `https://expo.dev/artifacts/eas/4T1yyw62ztqbZJ8t8PzEzK.tar.gz`
- iOS device development build is now progressing through interactive Apple credential/device setup.
- iOS device development build finished: `a887a540-2a82-4ddf-8e66-985eb11ce719`.
- iOS device install URL ready: `https://expo.dev/accounts/ryoaxelrod/projects/dayby/builds/a887a540-2a82-4ddf-8e66-985eb11ce719`
- Supabase RLS enabled on `users`, `groups`, `group_members`, `group_invites`
- Supabase RLS enabled on memory core tables.

## In Progress / Next

- Validate Apple and Google providers after account setup.
- Use dev email sign-in while Apple/Google provider setup is pending.
- Install Android development APK and verify native 2-second trim on device.
- Install iOS development build and verify native 2-second trim on device.
- After native trimming, enable `EXPO_PUBLIC_ENABLE_R2_UPLOADS=true` for real R2 upload testing.
- Run signed URL smoke test after Auth rate limit clears or after Apple/Google/dev session is available.
- Check Android development build result and install the APK when complete.
- Add export/save/share for Daily Reel and Monthly Memory.
- Add actual server-generated Daily/Monthly MP4 cache later.
- Keep Weekly Memory visually secondary; Monthly remains the product promise.
- Add automatic scheduled status transitions for Active / Quiet / Archived / Dormant.
- Re-run `npm audit` and `npx expo install --check` when npm registry requests stop timing out.

## Blocked By External Setup

- Supabase publishable key added to local `.env.local`; do not commit this file.
- Apple Sign in with Apple configuration.
- Google OAuth configuration.
- R2 server-side access key created and registered in Supabase Edge Function secrets. Rotate before production.
- iOS and Android development builds for native camera verification.
- iOS development build is ready; real-device camera/trim verification is still pending.
- iOS simulator build can be used for app compilation checks, but camera verification still needs a real device.

## Tool Limits Observed

- Supabase publishable key could be fetched through the connected Supabase tool.
- Supabase Auth provider enablement for Apple/Google is not exposed through the currently available tools.
- Cloudflare R2 permanent S3 access key creation is not exposed through the currently available tools; the visible API can create temporary credentials only when a parent access key already exists.
