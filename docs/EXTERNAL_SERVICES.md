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

Local app value still needed:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://doupguwwpshyjdhsfgtr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key must be copied from the Supabase dashboard. Do not use the service role key in the app.

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

## GitHub

GitHub repository is not created yet.

Until the remote exists, use local Git commits. After creating the remote repository, add it with:

```bash
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```
