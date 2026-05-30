# Design Direction

Last updated: 2026-05-30

This document preserves the current visual and interaction direction so future implementation does not drift while the product model changes from voting to archive/highlight.

## Product Feel

dayby should feel like a private memory tool, not a public social app.

The interface should be quiet, direct, and slightly cinematic. It should make posting and watching feel light, not performative.

Design keywords:

- private
- calm
- monthly
- friend-made
- memory-first
- low-pressure

Avoid:

- rankings
- public counters
- streak energy
- dense gamification
- loud creator-tool styling
- generic marketing sections inside the app

## Visual System

Use the current cool blue direction as the default app shell.

Core colors already visible in the app:

- Ink: `#102033`
- Action blue: `#2F80ED`
- Pale blue surface: `#EAF4FF`
- App background: `#F7FBFF`
- Secondary text: `#4E6A80`
- Muted text: `#617B8F`
- Borders: `#D8E9F5`, `#BAD4EC`
- Dark memory surface: `#102033`

The app should not become a one-color blue wash. Use white surfaces, pale blue panels, dark video screens, and restrained contrast to keep hierarchy clear.

## Layout Rules

- First screen should be the actual app experience, not a landing page.
- Use full-width screen flow with simple panels.
- Cards are acceptable for repeated items, modals, and tool-like controls.
- Do not nest cards inside cards.
- Prefer border-top section dividers for secondary information.
- Keep border radii around `14-16` in existing screens unless a repeated item needs to feel tighter.
- Keep video/memory screens dark and content-first.
- Keep operational screens light and scan-friendly.

## Typography

- Use heavy short headings for primary moments.
- Use compact headings inside panels.
- Keep letter spacing at `0` except uppercase kicker labels, where `1` is already established.
- Avoid oversized type inside small controls.
- Button text must fit without wrapping awkwardly.

## Localization Layout

- English, Japanese, and Korean must all fit the existing calm visual system.
- Buttons and segmented controls should use `numberOfLines={1}` and `adjustsFontSizeToFit` where labels can expand.
- Prefer short translated copy over literal long translations.
- Do not increase hero scale to solve translation length. Keep hierarchy stable and tighten copy instead.
- Date and time labels should use locale-aware formatting, while group timezone calculations stay machine-stable.

## Interaction Principles

- Posting should remain a small daily action.
- Watching should not require judging friends.
- Bookmarking is private and optional.
- Monthly highlight should feel delivered, not generated on demand.
- Destructive actions should be quiet and reversible where possible, with no group-wide callout.

## Copy Direction

Good:

- `Keep today`
- `Saved for me`
- `Open yesterday`
- `This month is ready`
- `A one-minute sample of the month`
- `Everything stays in the archive`

Avoid:

- `Vote for yesterday`
- `Which one wins?`
- `Top moment`
- `Most viewed`
- `Generate highlight?`
- `Your streak`

## Screen Notes

### Home

Home should reinforce the rhythm:

1. Keep 2 seconds today.
2. Watch the group day.
3. Receive the month.

No voting prompt should appear.

### Group Detail

Group detail should make the next action obvious: post today, open yesterday, or open this month.

Monthly copy should emphasize archive plus one-minute highlight, not daily winners.

### Daily Reel

Daily Reel is a time-ordered group collection.

Users can privately save a moment. Saved state should be visible only to the current user.

Do not show view counts, save counts, or rankings.

### Monthly Memory

Monthly Memory should show the 1-minute highlight and make the archive completeness clear.

The end card may say `made with dayby`, but the main body should stay clean.
