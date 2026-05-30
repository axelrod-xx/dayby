# Product Spec

## Summary

dayby turns a friend group's daily 2-second moments into a private archive and a 1-minute monthly memory.

Primary copy direction: `Two seconds a day. One minute a month.`

The app is not a video editor, not a public social feed, not a voting game, and not a music app. It helps a private group preserve the texture of a month, then leaves music and final posting context to Instagram, TikTok, Reels, Stories, LINE, or the user's camera roll.

Current product direction: `全部は残る。でも見せる時は1分にして届く。`

The monthly memory is a sample of the group's atmosphere, not a ranking of the funniest clips.

## Core Loop

1. Today: capture up to 10 seconds.
2. Today: trim the capture to exactly 2 seconds.
3. Today: post the same 2-second asset to one or more groups.
4. Tomorrow: watch yesterday's group Daily Reel as a time-ordered collection.
5. Any time: privately bookmark moments worth finding again.
6. Every post remains in the group's complete archive unless the owner removes it.
7. During the week: a quiet Weekly Memory can be previewed, but it is not the main product promise.
8. Month end: a 1-minute Monthly Highlight arrives automatically, sampled from the archive.

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
- Private bookmark per member per post.
- No public view counts, vote counts, streaks, or rankings.
- Complete archive of group posts by day.
- Quiet Weekly Memory as a lightweight progress preview.
- Monthly Highlight from archive posts and metadata, capped at 30 two-second moments.
- Save/share exports without in-app BGM.
- Basic report, delete, and admin moderation paths.
- Activity records for retention policy.

## Explicitly Out of MVP

- In-app BGM.
- Recommended songs.
- Filters, stickers, advanced editing, AI editing.
- Public feed, followers, chat, like lists.
- Post count rankings or non-post shaming.
- Public view counts or public bookmark counts.
- Voting, winners, or daily scoreboards.
- 10-second original cloud storage.
- Constant video watermark.
- Cloudflare Stream or Mux as the primary storage model.

## UX Direction

- Quiet, modern, simple.
- English-first UI.
- Memory-first, not editor-first.
- The public-facing promise emphasizes daily 2-second memories becoming a 1-minute month.
- The 10-second capture limit is a camera-time instruction, not the headline.
- Daily Reel emphasizes time and person: `18:42 · RYO`.
- Bookmarking is private and quiet. It can influence curation, but it should never create a visible score.
- Weekly Memory is intentionally secondary: visible, useful, not pushed.
- Monthly Highlight emphasizes date, weekday, time, person, and group.
- The complete archive is for the group. The 1-minute highlight is for sharing.
- The main video body stays clean.
- A modest final `made with dayby` end card is acceptable.
