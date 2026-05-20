import { requireSupabase } from '@/src/lib/supabase';

export async function getMyVote(groupId: string, targetDate: string): Promise<string | null> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await client
    .from('votes')
    .select('post_id')
    .eq('group_id', groupId)
    .eq('voter_id', user.id)
    .eq('target_date', targetDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.post_id ?? null;
}

export async function voteForPost(input: {
  groupId: string;
  postId: string;
  targetDate: string;
}) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before voting.');
  }

  const { error } = await client.from('votes').insert({
    group_id: input.groupId,
    voter_id: user.id,
    post_id: input.postId,
    target_date: input.targetDate,
  });

  if (error) {
    throw error;
  }
}
