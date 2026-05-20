# User Actions

These tasks require account ownership or secrets and should be done by the project owner.

## Supabase

1. Enable Apple provider in Supabase Auth.
2. Enable Google provider in Supabase Auth.
3. Add mobile redirect URLs once bundle identifiers and URL schemes are finalized.
4. Copy the publishable key into local `.env.local`.
5. Keep the service role key private and never paste it into app code.

## Apple

1. Enroll or use an existing Apple Developer account.
2. Create the iOS bundle identifier for dayby.
3. Configure Sign in with Apple.
4. Prepare App Store Connect access for later TestFlight.

## Google

1. Create or use a Google Cloud project.
2. Configure OAuth consent screen.
3. Create OAuth clients for iOS and Android.
4. Add redirect/client values required by Supabase Auth.

## Cloudflare R2

1. Keep the `dayby` R2 bucket private.
2. Create an access key for server-side signing only.
3. Decide lifecycle rules for short-lived non-winner clips later.
4. Do not make the bucket public.

## Expo / EAS

1. Create or use an Expo account.
2. Decide app slug and owner.
3. Later, run EAS setup for iOS and Android development builds.

## Values Needed Locally

Add these to `.env.local` when available:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_BASE_URL=
```

Do not add R2 secrets or Supabase service role keys to `.env.local` for the mobile app.
