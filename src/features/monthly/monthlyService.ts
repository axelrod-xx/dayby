import { requireSupabase } from '@/src/lib/supabase';
import { requestPlaybackUrls } from '@/src/features/video/playbackService';
import { monthDateBounds } from '@/src/lib/groupTime';

export type MonthlyMoment = {
  id: string;
  post_id: string | null;
  user_id: string;
  date: string;
  captured_at: string;
  display_name: string;
  r2_key: string;
  playback_url: string | null;
  source: 'snapshot' | 'archive';
};

export type MonthlyHighlight = {
  names: string[];
  count: number;
  durationSeconds: number;
  dayCount: number;
};

type ArchiveMoment = Omit<MonthlyMoment, 'source'>;

const MAX_MONTHLY_MOMENTS = 30;

const stableScore = (moment: Pick<ArchiveMoment, 'id' | 'captured_at'>) => {
  const value = `${moment.id}:${moment.captured_at}`;
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

function selectMonthlySample(moments: ArchiveMoment[]): ArchiveMoment[] {
  if (moments.length <= MAX_MONTHLY_MOMENTS) {
    return moments;
  }

  const sorted = [...moments].sort((left, right) => left.captured_at.localeCompare(right.captured_at));
  const buckets = new Map<number, ArchiveMoment[]>();

  sorted.forEach((moment, index) => {
    const bucket = Math.min(MAX_MONTHLY_MOMENTS - 1, Math.floor((index * MAX_MONTHLY_MOMENTS) / sorted.length));
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), moment]);
  });

  const selected: ArchiveMoment[] = [];
  const selectedByUser = new Map<string, number>();
  const totalByUser = new Map<string, number>();

  for (const moment of sorted) {
    totalByUser.set(moment.user_id, (totalByUser.get(moment.user_id) ?? 0) + 1);
  }

  for (let bucket = 0; bucket < MAX_MONTHLY_MOMENTS; bucket += 1) {
    const candidates = buckets.get(bucket) ?? [];

    if (candidates.length === 0) {
      continue;
    }

    const withMemberRoom = candidates.filter((moment) => {
      const userTotal = totalByUser.get(moment.user_id) ?? 1;
      const userLimit = Math.max(1, Math.ceil((userTotal / sorted.length) * MAX_MONTHLY_MOMENTS));
      return (selectedByUser.get(moment.user_id) ?? 0) < userLimit;
    });
    const rankedCandidates = withMemberRoom.length > 0 ? withMemberRoom : candidates;

    const [chosen] = [...rankedCandidates].sort((left, right) => {
      const leftCount = selectedByUser.get(left.user_id) ?? 0;
      const rightCount = selectedByUser.get(right.user_id) ?? 0;

      if (leftCount !== rightCount) {
        return leftCount - rightCount;
      }

      return stableScore(left) - stableScore(right);
    });

    selected.push(chosen);
    selectedByUser.set(chosen.user_id, (selectedByUser.get(chosen.user_id) ?? 0) + 1);
  }

  return selected.sort((left, right) => left.captured_at.localeCompare(right.captured_at));
}

async function listSnapshotMoments(input: {
  groupId: string;
  year: number;
  month: number;
}): Promise<MonthlyMoment[] | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('monthly_highlight_items')
    .select('id, post_id, user_id, source_date, captured_at, display_name, r2_key')
    .eq('group_id', input.groupId)
    .eq('year', input.year)
    .eq('month', input.month)
    .order('position', { ascending: true });

  if (error) {
    if (error.code === '42P01') {
      return null;
    }

    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const playbackUrls = await requestPlaybackUrls(data.map((row) => row.r2_key).filter(Boolean));

  return data.map((row) => ({
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    date: row.source_date,
    captured_at: row.captured_at,
    display_name: row.display_name,
    r2_key: row.r2_key,
    playback_url: playbackUrls.get(row.r2_key) ?? null,
    source: 'snapshot' as const,
  }));
}

async function listArchiveMoments(input: {
  groupId: string;
  year: number;
  month: number;
}): Promise<ArchiveMoment[]> {
  const { start, end } = monthDateBounds(input.year, input.month);
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

  return rows.map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    const asset = Array.isArray(row.video_assets) ? row.video_assets[0] : row.video_assets;
    const r2Key = asset?.r2_key ?? '';

    return {
      id: row.id,
      post_id: row.id,
      user_id: row.user_id,
      date: row.date,
      captured_at: row.captured_at,
      display_name: user?.display_name ?? 'dayby',
      r2_key: r2Key,
      playback_url: playbackUrls.get(r2Key) ?? null,
    };
  });
}

export async function listMonthlyArchiveMoments(input: {
  groupId: string;
  year: number;
  month: number;
}): Promise<MonthlyMoment[]> {
  const archive = await listArchiveMoments(input);
  return archive.map((moment) => ({
    ...moment,
    source: 'archive',
  }));
}

export async function listMonthlyMoments(input: {
  groupId: string;
  year: number;
  month: number;
}): Promise<MonthlyMoment[]> {
  const snapshot = await listSnapshotMoments(input);

  if (snapshot) {
    return snapshot;
  }

  const archive = await listArchiveMoments(input);
  return selectMonthlySample(archive).map((moment) => ({
    ...moment,
    source: 'archive',
  }));
}

export function calculateMonthlyHighlight(moments: MonthlyMoment[]): MonthlyHighlight | null {
  if (moments.length === 0) {
    return null;
  }

  const names = Array.from(new Set(moments.map((moment) => moment.display_name)));
  const days = new Set(moments.map((moment) => moment.date));
  const seconds = moments.length * 2;

  return {
    names,
    count: moments.length,
    durationSeconds: seconds,
    dayCount: days.size,
  };
}
