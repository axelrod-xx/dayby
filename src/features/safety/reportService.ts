import { requireSupabase } from '@/src/lib/supabase';
import { I18nError } from '@/src/lib/i18n/errors';

export type ReportReason = 'uncomfortable' | 'privacy' | 'harassment' | 'other';

const reasonLabels: Record<ReportReason, string> = {
  uncomfortable: 'This feels uncomfortable',
  privacy: 'Privacy or consent concern',
  harassment: 'Harassment or bullying',
  other: 'Something else',
};

export const reportReasons: ReportReason[] = ['uncomfortable', 'privacy', 'harassment', 'other'];

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
    throw new I18nError('safety.error.signInRequired');
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
