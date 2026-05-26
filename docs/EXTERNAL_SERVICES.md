# External Services

## Supabase

- Project name: `dayby`
- Project ref: `doupguwwpshyjdhsfgtr`
- Region: `ap-northeast-2`
- Database: Postgres 17
- Project URL: `https://doupguwwpshyjdhsfgtr.supabase.co`

Applied migrations:

- `initial_phase_1`
- `allow_group_owner_read`
- `group_invite_join_rpc`
- `memory_core_schema`
- `decide_daily_winner_rpc`
- `record_group_activity_rpc`
- `add_trim_metadata`
- `group_lifecycle_rpc`
- `add_weekly_generated_video_type`

Local app values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://doupguwwpshyjdhsfgtr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key has been added to local `.env.local` for development. Do not use the service role key in the app.

## Cloudflare R2

- Bucket name: `dayby`
- Bucket visibility: private

Server-side values:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dayby
```

R2 keys belong only in server-side functions or deployment secrets. They must not be prefixed with `EXPO_PUBLIC_`.

Supabase Edge Functions deployed with JWT verification:

- `r2-upload-url`
- `r2-download-url`

R2 secrets are configured in Supabase Edge Function secrets. Rotate the development R2 token before production because it was visible during setup.

Mobile uploads are also guarded by:

```bash
EXPO_PUBLIC_ENABLE_R2_UPLOADS=false
EXPO_PUBLIC_HOME_DEMO_VIDEO_URL=
```

Keep this `false` until native 2-second trimming outputs a real 2-second MP4. This prevents accidentally uploading the original 10-second capture.

## Expo / EAS

- Expo account: `ryoaxelrod`
- EAS project: `@ryoaxelrod/dayby`
- EAS project ID: `7a735fe7-7788-43a7-b481-9fd3b544be52`
- iOS bundle identifier: `app.dayby.mobile`
- Android package: `app.dayby.mobile`

Development builds:

- Android with native trim: `https://expo.dev/artifacts/eas/a2HhNgdv8TMoGhhCXwZKxE.apk`
- iOS simulator archive: `https://expo.dev/artifacts/eas/4T1yyw62ztqbZJ8t8PzEzK.tar.gz`
- iOS real-device development build: `https://expo.dev/accounts/ryoaxelrod/projects/dayby/builds/a887a540-2a82-4ddf-8e66-985eb11ce719`

The iOS real-device development build finished with an Ad Hoc profile for the registered iPhone.

## GitHub

Repository:

- `https://github.com/axelrod-xx/dayby.git`
- Local branch: `master`
- Remote tracking: `origin/master`
