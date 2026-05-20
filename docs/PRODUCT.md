# Product Spec

## Summary

dayby turns a friend group's daily 2-second moments into a monthly memory.

The app is not a video editor, not a public social feed, and not a music app. It helps a private group keep the moments that mattered, then leaves music and final posting context to Instagram, TikTok, Reels, Stories, LINE, or the user's camera roll.

## Core Loop

1. Today: capture up to 10 seconds.
2. Today: trim the capture to exactly 2 seconds.
3. Today: post the same 2-second asset to one or more groups.
4. Tomorrow: watch yesterday's group Daily Reel.
5. Tomorrow: vote for the one moment worth keeping.
6. Every day: one winner becomes the group's saved daily memory.
7. During the week: a quiet Weekly Memory can be previewed, but it is not the main product promise.
8. Month end: daily winners become a roughly 1-minute Monthly Memory.

## MVP Features

- Apple Login and Google Login.
- Profile setup with display name, avatar, and timezone.
- Group create, list, detail, invite code/link, join, members, roles.
- 10-second capture and 2-second device-side trim.
- Audio on/off choice before upload.
- R2 upload for the 2-second MP4 only.
- Multi-group posting with a single shared video asset.
- One post per user per group per local group day.
- Daily Reel ordered by captured time.
- One vote per member for the previous day.
- Winner decision at the deadline, including tie handling.
- Quiet Weekly Memory as a lightweight progress preview.
- Monthly Memory from daily winners and metadata.
- Save/share exports without in-app BGM.
- Basic report, delete, and admin moderation paths.
- Activity records for retention policy.

## Explicitly Out of MVP

- In-app BGM.
- Recommended songs.
- Filters, stickers, advanced editing, AI editing.
- Public feed, followers, chat, like lists.
- Post count rankings or non-post shaming.
- 10-second original cloud storage.
- Constant video watermark.
- Cloudflare Stream or Mux as the primary storage model.

## UX Direction

- Quiet, modern, simple.
- English-first UI.
- Memory-first, not editor-first.
- Daily Reel emphasizes time and person: `18:42 · RYO`.
- Weekly Memory is intentionally secondary: visible, useful, not pushed.
- Monthly Memory emphasizes date, weekday, time, and group.
- The main video body stays clean.
- A modest final `made with dayby` end card is acceptable.
