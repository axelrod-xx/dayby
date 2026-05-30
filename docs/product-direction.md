# dayby Product Direction

Last updated: 2026-05-30

This memo captures the current product direction for replacing voting with a lower-pressure memory system. It is intentionally product-facing first, then implementation-facing.

## Core Statement

全部は残る。でも見せる時は1分にして届く。

dayby is not trying to find the funniest or most popular moment. It is trying to preserve the feeling of a private friend group's month.

The monthly memory should be a sample of the month's atmosphere, not a ranking of the best clips.

## Why Not Voting

Voting adds explicit friction and makes the daily loop feel like a task.

It also changes the emotional meaning of the product:

- Someone is selected.
- Someone is not selected.
- The group implicitly decides what was worth keeping.

That creates obligation and comparison, which conflicts with the no-streaks, low-pressure direction.

## Why Not Public View Counts

Public view counts are worse than voting for small friend groups.

In an 8-person group, visible counts quickly become a social scoreboard:

- "Her clip got 20 views and mine got 3."
- "They watched everyone else's clip but not mine."
- Users may replay their own clip to push the number up.
- Posting time affects views more than quality.
- Autoplay views are not the same as genuine interest.

View counts can be useful as private signals, but they should not be shown as numbers.

## Two-Layer Memory Model

dayby should separate preservation from sharing.

### Layer 1: Complete Archive

The archive keeps all group posts, organized by date and time.

It is for the group, not for public sharing. It does not need to be a single long exported video. It can be a calendar, timeline, or day-by-day reel.

The archive solves the completeness problem: the group's month is not reduced to winners.

### Layer 2: Monthly Highlight

The monthly highlight is a fixed 1-minute shareable memory.

It is generated automatically and delivered at month end. The user should feel that it has arrived, not that they have been asked to build it.

Preferred copy direction:

- 今月のうちら、できたよ
- 8月のグループ、見てみる？

Avoid copy that feels like work:

- ハイライトを生成しますか？
- 今月のレビューを見る

## Monthly Highlight Curation

Goal: 60 seconds / 2 seconds per post = 30 slots.

The algorithm should not optimize for popularity. It should optimize for the feeling of the month.

Priority order:

1. Date distribution
   - Cover the beginning, middle, and end of the month.
   - Sample from as many posted days as possible, up to 30 days.

2. Member distribution
   - Prevent one member from dominating the highlight.
   - Use each member's share of monthly posts as a soft upper bound.

3. Bookmarks
   - Prefer moments that members privately bookmarked.
   - Do not expose who bookmarked what.
   - Do not let bookmarks override date and member distribution.

4. Intentional randomness
   - Leave room for ordinary, blurry, quiet, or silly moments.
   - The highlight should not become only "the best" clips.

Private playback signals such as views, replays, loop time, and completion rate can lightly weight selection inside the random step. They should not become the main ranking system.

## Bookmark Direction

Replace voting with private bookmarks.

Long-pressing a daily post can mean "keep this for me" or "I like this moment", but it should not create a public score.

Bookmarks can influence the monthly highlight and help users find saved moments later.

## Deletion And Snapshot Rules

Users need quiet control over their own posts.

| Timing | Behavior |
| --- | --- |
| Before monthly highlight generation | Remove from archive and exclude from highlight candidates. |
| After monthly highlight generation | Remove from archive, but keep the already-generated monthly highlight unchanged. |
| Delete notification | Do not notify the group. The post disappears quietly. |
| External sharing | Only the 1-minute monthly highlight can be exported. The complete archive cannot be exported. |

The generated monthly highlight is a frozen snapshot. This preserves the shared first-view experience for the group.

## Implementation Impact

Current codebase direction:

| Change | Likely area |
| --- | --- |
| Remove voting surface | `app/vote/[groupId]/[date].tsx` |
| Replace vote service with bookmark service | `src/features/bookmarks/bookmarkService.ts` |
| Rework monthly selection logic | `src/features/monthly/monthlyService.ts` |
| Add private bookmark action | `app/daily/[groupId]/[date].tsx` |
| Add deletion and highlight snapshot foundations | Post and monthly memory flows |
| Replace home vote prompts with archive prompts | `app/(tabs)/index.tsx` |
| Redefine Daily Reel as the group's daily collection | `app/daily/[groupId]/[date].tsx` |

## Open Product Questions

- Should the complete archive be available forever, or follow a retention policy?
- Can group admins remove a member's post from the frozen monthly highlight for safety reasons?
- Should bookmarks be only personal, or should aggregate bookmark signals be used privately by the algorithm?
- What is the exact copy for the delivered monthly highlight notification?
- Should there be a manual "regenerate highlight" escape hatch for the group, or would that create too much authorship pressure?
