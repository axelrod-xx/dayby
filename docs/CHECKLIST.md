# Checklists

## Before Coding a Feature

- Confirm it supports the core loop.
- Confirm it does not introduce BGM, public feed, chat, or rankings outside the agreed scope.
- Confirm any server-side write has DB constraints or RLS support.
- Confirm video storage cost is controlled.

## Before Uploading Video

- Source was captured locally.
- Source was trimmed to 2 seconds locally.
- Source 10-second file is not uploaded.
- Output is compressed MP4.
- Audio setting was applied.
- Upload uses signed URL.

## Before Shipping a Phase

- TypeScript passes.
- Main flows run locally.
- RLS assumptions are documented.
- User-facing copy stays quiet and memory-focused.
- No secrets are committed.
