import { env } from '@/src/lib/env';
import { requireSupabase } from '@/src/lib/supabase';

export type DailyMoment = {
  post_id: string;
  group_id: string;
  user_id: string;
  display_name: string;
  date: string;
  captured_at: string;
  time_label: string;
  r2_key: string;
  has_audio: boolean;
  playback_url: string | null;
};

const timeLabel = (capturedAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(capturedAt));

async function requestPlaybackUrl(r2Key: string): Promise<string | null> {
  if (!env.apiBaseUrl || r2Key.startsWith('local-dev/')) {
    return null;
  }

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session) {
    return null;
  }

  const response = await fetch(`${env.apiBaseUrl}/r2-download-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: r2Key }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { downloadUrl?: string };
  return body.downloadUrl ?? null;
}

export async function listDailyMoments(groupId: string, date: string): Promise<DailyMoment[]> {
  const client = requireSupabase();
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

  const moments = await Promise.all(
    (data ?? []).map(async (row) => {
      const user = Array.isArray(row.users) ? row.users[0] : row.users;
      const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
      const r2Key = asset?.r2_key ?? '';

      return {
        post_id: row.id,
        group_id: row.group_id,
        user_id: row.user_id,
        display_name: user?.display_name ?? 'dayby friend',
        date: row.date,
        captured_at: row.captured_at,
        time_label: timeLabel(row.captured_at),
        r2_key: r2Key,
        has_audio: asset?.has_audio ?? true,
        playback_url: await requestPlaybackUrl(r2Key),
      } satisfies DailyMoment;
    }),
  );

  return moments;
}

export const previousDateString = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};
