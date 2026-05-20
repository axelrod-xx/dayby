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

Local app value still needed:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://doupguwwpshyjdhsfgtr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key has been added to local `.env.local` for development. Do not use the service role key in the app.

## Cloudflare R2

- Bucket name: `dayby`
- Bucket visibility: private

Server-side values needed later:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dayby
R2_PUBLIC_BASE_URL=
```

R2 keys belong only in server-side functions or deployment secrets. They must not be prefixed with `EXPO_PUBLIC_`.

Supabase Edge Function stubs added:

- `r2-upload-url`
- `r2-download-url`

They are not deployed yet because R2 server-side secrets are not configured.

Mobile uploads are also guarded by:

```bash
EXPO_PUBLIC_ENABLE_R2_UPLOADS=false
```

Keep this `false` until native 2-second trimming outputs a real 2-second MP4. This prevents accidentally uploading the original 10-second capture.

## GitHub

GitHub repository is not created yet.
GitHub repository:

- `https://github.com/axelrod-xx/dayby.git`
- Local branch: `master`
- Remote tracking: `origin/master`
