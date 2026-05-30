import { requireSupabase } from '@/src/lib/supabase';
import { requestPlaybackUrls } from '@/src/features/video/playbackService';
import { addDaysToDateString, currentWeekStartStringInTimeZone } from '@/src/lib/groupTime';

export type WeeklyMoment = {
  id: string;
  date: string;
  captured_at: string;
  day_label: string;
  time_label: string;
  display_name: string;
  r2_key: string;
  playback_url: string | null;
};

const timeLabel = (capturedAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(capturedAt));

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${date}T00:00:00.000Z`));

export function currentWeekStartString(date = new Date()) {
  return currentWeekStartStringInTimeZone('UTC', date);
}

export function weekRangeLabel(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export async function listWeeklyMoments(input: {
  groupId: string;
  weekStart: string;
}): Promise<WeeklyMoment[]> {
  const start = input.weekStart;
  const end = addDaysToDateString(input.weekStart, 7);
  const client = requireSupabase();
  const { data, error } = await client
    .from('daily_posts')
    .select(
      `
      id,
      user_id,
      date,
      captured_at,
      users (
        display_name
      ),
      video_assets (
        r2_key
      )
    `,
    )
    .eq('group_id', input.groupId)
    .gte('date', start)
    .lt('date', end)
    .is('deleted_at', null)
    .order('date', { ascending: true });

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

  return rows.map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
    const capturedAt = row.captured_at ?? `${row.date}T00:00:00.000Z`;
    const r2Key = asset?.r2_key ?? '';

    return {
      id: row.id,
      date: row.date,
      captured_at: capturedAt,
      day_label: dayLabel(row.date),
      time_label: timeLabel(capturedAt),
      display_name: user?.display_name ?? 'dayby friend',
      r2_key: r2Key,
      playback_url: playbackUrls.get(r2Key) ?? null,
    };
  });
}
