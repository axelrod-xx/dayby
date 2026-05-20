# Decisions

## 2026-05-20

- Product name is lowercase `dayby`.
- Supabase project is new.
- Cloudflare R2 bucket is new.
- Auth requires Apple Login and Google Login.
- iOS and Android are both first-class from the first release.
- Use private R2 bucket with signed URLs.
- Use Expo + TypeScript + Expo Router.
- Use Expo SDK 55 because the initial SDK 54 scaffold had dependency audit warnings and SDK 55 resolves them cleanly.
- Recommend Expo Development Builds / Expo Dev Client for native video work.
- Store only 2-second trimmed MP4s in R2.
- Store R2 keys in Postgres instead of permanent public URLs.
- Keep in-app BGM permanently out of scope.
- Keep main video body free of constant watermark.
- Ranking/monthly highlight is group-level and default off.

## Pending Decisions

- Exact mobile video processing library or native module.
- Whether email/password remains as a visible fallback or only a development/admin path.
- First production app bundle identifiers.
- Supabase region.
- R2 bucket region/jurisdiction strategy.
