import { requireSupabase } from '@/src/lib/supabase';

import { recordGroupActivity } from '../groups/groupService';

export async function listMyBookmarkedPostIds(groupId: string): Promise<Set<string>> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return new Set();
  }

  const { data, error } = await client
    .from('post_bookmarks')
    .select('post_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((bookmark) => bookmark.post_id as string));
}

export async function setPostBookmarked(input: {
  groupId: string;
  postId: string;
  bookmarked: boolean;
}) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before saving a moment.');
  }

  if (input.bookmarked) {
    const { error } = await client.from('post_bookmarks').insert({
      group_id: input.groupId,
      post_id: input.postId,
      user_id: user.id,
    });

    if (error && error.code !== '23505') {
      throw error;
    }

    await recordGroupActivity(input.groupId, 'bookmark');
    return;
  }

  const { error } = await client
    .from('post_bookmarks')
    .delete()
    .eq('group_id', input.groupId)
    .eq('post_id', input.postId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}
