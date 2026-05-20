# Architecture

## Stack

- App: React Native, Expo, TypeScript, Expo Router.
- Native runtime: Expo Development Build / Expo Dev Client.
- Auth and DB: Supabase Auth and Postgres.
- Storage: Cloudflare R2 private bucket.
- Server-side operations: Supabase Edge Functions or Cloudflare Workers.
- Payments later: RevenueCat.
- Notifications later: Expo Notifications.

## Recommended Runtime Choice

Use Expo Development Builds from the start.

Expo Go is fine for early UI checks, but dayby needs camera capture, native video trimming, compression, audio stripping, file save, and share flows. Development Builds keep Expo's workflow while allowing native modules when required.

## Video Flow

1. User records up to 10 seconds on device.
2. App trims the capture to 2 seconds on device.
3. App optionally removes audio on device.
4. App compresses/export MP4 target around 720p and roughly 1MB.
5. App requests a signed R2 upload URL from the backend.
6. App uploads the 2-second MP4 to R2.
7. App creates one `video_assets` record.
8. App creates one `daily_posts` record per selected group.
9. The 10-second source is discarded and never uploaded.

## R2 Access Model

- Bucket is private.
- R2 access keys are never shipped in the mobile app.
- DB stores `r2_key`, not a permanent public video URL.
- Backend returns short-lived signed URLs for upload and playback.
- Thumbnails use the same private-key model.

## Server Responsibilities

- Issue signed upload URLs.
- Issue signed playback/download URLs.
- Validate invite joins.
- Decide daily winners.
- Generate or queue generated Daily/Weekly/Monthly MP4s when needed. Weekly is a quiet progress preview; Monthly remains the main memory.
- Enforce retention jobs and notification windows later.

## Date and Time Rules

- Group day is based on `groups.timezone`.
- Posting date, voting window, and winner target date should use group timezone.
- `captured_at` remains `timestamptz`.
- Display time is local to group or viewer depending on screen; MVP should prefer group timezone for consistency.

## Security Boundaries

- Supabase publishable/anon key is allowed in app.
- Supabase service role key is never allowed in app.
- R2 account secrets are never allowed in app.
- RLS is enabled on all public tables.
- Complex admin operations should use backend functions, not client-side trust.
