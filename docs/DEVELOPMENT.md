# Development Setup

## Requirements

- Node.js LTS.
- npm.
- Expo CLI through `npx expo`.
- Android Studio for Android emulator builds.
- Xcode on macOS for iOS simulator/device builds.
- Expo account and EAS CLI later for development builds and release builds.

## Install

```bash
npm install
```

## Run

```bash
npm run start
npm run android
npm run ios
npm run web
npm run dev:clear
```

## Environment

Copy `.env.example` to `.env.local` for local values.

Only variables prefixed with `EXPO_PUBLIC_` are available to the app bundle. Do not put service-role secrets, R2 access keys, or private signing secrets in any `EXPO_PUBLIC_` value.

## External Services

Supabase and Cloudflare R2 are new-project dependencies. See `docs/USER_ACTIONS.md` for the setup tasks that require account access.

## Development Build Policy

Use Expo Development Builds for dayby's real app testing.

Expo Go can check basic UI, but video trimming and native modules may require a development build. Rebuild the dev client after adding native modules.

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

Use the `preview` profile for internal distribution and `production` for store-ready builds.

## Verification

Before marking a phase done:

- Run TypeScript checks.
- Run tracked-file secret checks with `npm run check:secrets`.
- Run lint if configured.
- Start the app.
- Verify the relevant flow on both iOS and Android when native behavior is involved.
