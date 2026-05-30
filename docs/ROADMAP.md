# Roadmap

## Phase 0: Project Foundation

- Confirm project directory and Git state.
- Create project management docs.
- Scaffold Expo + TypeScript + Expo Router.
- Add environment templates.
- Add baseline dependencies.

## Phase 1: Auth and Profile

- Supabase client.
- Apple Login and Google Login.
- Session persistence.
- Profile setup.
- User profile sync with `auth.users`.
- Home shell.

## Phase 2: Groups

- Group create/list/detail.
- Member list.
- Invite code/link.
- Join group.
- Group settings.
- Role checks.

## Phase 3: Capture and Trim

- Camera capture up to 10 seconds.
- Trim to 2 seconds.
- Preview.
- Audio on/off.
- Compression target.
- Local discard of source capture.

## Phase 4: Upload and Posting

- R2 signed upload URL endpoint.
- Upload 2-second MP4.
- Create `video_assets`.
- Multi-group `daily_posts`.
- Posting status and duplicate-post handling.

## Phase 5: Daily Reel

- Fetch previous day posts.
- Sort by captured time.
- Continuous playback.
- Overlay `time · display name`.
- Save/share export path.

## Phase 6: Private Bookmarks and Archive

- Remove Vote UI and daily winner dependency from app-facing flows.
- Add private bookmark action for Daily Reel moments.
- Add one bookmark per member per post.
- Keep bookmarks private; expose no public counts.
- Keep every non-deleted group post available in the archive.
- Add post-owner delete path that quietly removes the post from archive and future highlights.

## Phase 7: Monthly Memory

- Weekly preview as a quiet progress reward.
- Fetch archive/sample moments by month.
- Monthly highlight preview capped at 30 clips.
- Date/time/name overlay.
- Intro and end card.
- Snapshot/frozen highlight metadata for generated monthly videos.
- Save/share export.

## Phase 8: Retention and Archive

- Activity events.
- Quiet/Archived states.
- Delete candidate states.
- Notification design.

## Phase 9: Safety

- User delete post.
- Admin delete post.
- Report flow.
- Leave group.
- Basic block strategy.

## Phase 10: Payments Later

- Member limit gates.
- Subscription records.
- RevenueCat integration.
- Event pass and larger groups.
