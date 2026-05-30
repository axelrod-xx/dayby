import { requireSupabase } from '@/src/lib/supabase';
import { requestPlaybackUrls } from '@/src/features/video/playbackService';
import { previousDateStringInTimeZone } from '@/src/lib/groupTime';

export type DailyMoment = {
  post_id: string;
  group_id: string;
  user_id: string;
  is_mine: boolean;
  display_name: string;
  date: string;
  captured_at: string;
  r2_key: string;
  has_audio: boolean;
  playback_url: string | null;
};

export async function listDailyMoments(groupId: string, date: string): Promise<DailyMoment[]> {
  const client = requireSupabase();
  const {
    data: { user: currentUser },
  } = await client.auth.getUser();
  const { data, error } = await client
    .from('daily_posts')
    .select(
      `
      id,
      group_id,
      user_id,
      date,
      captured_at,
      users (
        display_name
      ),
      video_assets (
        r2_key,
        has_audio
      )
    `,
    )
    .eq('group_id', groupId)
    .eq('date', date)
    .is('deleted_at', null)
    .order('captured_at', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const playbackUrls = await requestPlaybackUrls(
    rows
      .map((row) => {
        const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
        return asset?.r2_key ?? '';
      })
      .filter(Boolean),
  );

  const moments = rows.map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
    const r2Key = asset?.r2_key ?? '';

    return {
      post_id: row.id,
      group_id: row.group_id,
      user_id: row.user_id,
      is_mine: row.user_id === currentUser?.id,
      display_name: user?.display_name ?? 'dayby',
      date: row.date,
      captured_at: row.captured_at,
      r2_key: r2Key,
      has_audio: asset?.has_audio ?? true,
      playback_url: playbackUrls.get(r2Key) ?? null,
    } satisfies DailyMoment;
  });

  return moments;
}

export async function removeDailyPost(input: { groupId: string; postId: string }) {
  const client = requireSupabase();
  const { error } = await client
    .from('daily_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('group_id', input.groupId)
    .eq('id', input.postId);

  if (error) {
    throw error;
  }
}

export const previousDateString = (timeZone = 'UTC') => previousDateStringInTimeZone(timeZone);
