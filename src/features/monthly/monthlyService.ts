import { requireSupabase } from '@/src/lib/supabase';

export type MonthlyMoment = {
  id: string;
  date: string;
  captured_at: string;
  time_label: string;
  display_name: string;
  r2_key: string;
};

export type MonthlyHighlight = {
  names: string[];
  count: number;
};

const timeLabel = (capturedAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(capturedAt));

export async function listMonthlyMoments(input: {
  groupId: string;
  year: number;
  month: number;
}): Promise<MonthlyMoment[]> {
  const start = `${input.year}-${String(input.month).padStart(2, '0')}-01`;
  const endDate = new Date(Date.UTC(input.year, input.month, 1));
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
      time_label: timeLabel(capturedAt),
      display_name: user?.display_name ?? 'dayby friend',
      r2_key: asset?.r2_key ?? '',
    };
  });
}

export function calculateMonthlyHighlight(moments: MonthlyMoment[]): MonthlyHighlight | null {
  if (moments.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const moment of moments) {
    counts.set(moment.display_name, (counts.get(moment.display_name) ?? 0) + 1);
  }

  const max = Math.max(...counts.values());
  return {
    names: Array.from(counts.entries())
      .filter(([, count]) => count === max)
      .map(([name]) => name),
    count: max,
  };
}

export async function decideDailyWinner(input: { groupId: string; date: string }) {
  const client = requireSupabase();
  const { error } = await client.rpc('decide_daily_winner', {
    target_group_id: input.groupId,
    target_date: input.date,
  });

  if (error) {
    throw error;
  }
}
