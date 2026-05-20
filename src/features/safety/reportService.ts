import { requireSupabase } from '@/src/lib/supabase';

export type ReportReason = 'uncomfortable' | 'privacy' | 'harassment' | 'other';

const reasonLabels: Record<ReportReason, string> = {
  uncomfortable: 'This feels uncomfortable',
  privacy: 'Privacy or consent concern',
  harassment: 'Harassment or bullying',
  other: 'Something else',
};

export const reportReasons = Object.entries(reasonLabels).map(([value, label]) => ({
  label,
  value: value as ReportReason,
}));

export async function createReport(input: {
  groupId?: string | null;
  postId?: string | null;
  reason: ReportReason;
  note?: string;
}) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before sending a report.');
  }

  const reason = input.note?.trim() ? `${reasonLabels[input.reason]}: ${input.note.trim()}` : reasonLabels[input.reason];
  const { error } = await client.from('reports').insert({
    reporter_id: user.id,
    group_id: input.groupId || null,
    post_id: input.postId || null,
    reason,
  });

  if (error) {
    throw error;
  }
}
