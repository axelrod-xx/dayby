import { requireSupabase } from '@/src/lib/supabase';

export type WeeklyMoment = {
  id: string;
  date: string;
  captured_at: string;
  day_label: string;
  time_label: string;
  display_name: string;
  r2_key: string;
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
  const next = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = next.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setUTCDate(next.getUTCDate() + diff);
  return next.toISOString().slice(0, 10);
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
  const endDate = new Date(`${input.weekStart}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 7);
  const end = endDate.toISOString().slice(0, 10);
  const client = requireSupabase();
  const { data, error } = await client
    .from('daily_winners')
    .select(
      `
      id,
      date,
      users (
        display_name
      ),
      daily_posts (
        captured_at
      ),
      video_assets (
        r2_key
      )
    `,
    )
    .eq('group_id', input.groupId)
    .gte('date', start)
    .lt('date', end)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    const post = Array.isArray(row.daily_posts) ? row.daily_posts[0] : row.daily_posts;
    const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
    const capturedAt = post?.captured_at ?? `${row.date}T00:00:00.000Z`;

    return {
      id: row.id,
      date: row.date,
      captured_at: capturedAt,
      day_label: dayLabel(row.date),
      time_label: timeLabel(capturedAt),
      display_name: user?.display_name ?? 'dayby friend',
      r2_key: asset?.r2_key ?? '',
    };
  });
}
