import { requestSignedVideoUpload, uploadVideoToSignedUrl } from '@/src/features/video/uploadService';
import { env } from '@/src/lib/env';
import { requireSupabase } from '@/src/lib/supabase';

import { recordGroupActivity } from '../groups/groupService';
import type { GroupWithMembership } from '../groups/types';
import { assertTwoSecondUploadReady } from '../video/videoProcessingService';

export type PostableGroup = GroupWithMembership & {
  posted_today: boolean;
};

type CreatePostsInput = {
  uri: string;
  groupIds: string[];
  hasAudio: boolean;
  capturedAt: string;
  sizeBytes?: number;
  trimStartMs: number;
  trimDurationMs: number;
  isNativeTrimmed: boolean;
  processedAt?: string | null;
};

const uuid = () => {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (randomUUID) {
    return randomUUID.call(globalThis.crypto);
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    const next = char === 'x' ? value : (value & 0x3) | 0x8;
    return next.toString(16);
  });
};

export const groupDateString = (date = new Date()) => date.toISOString().slice(0, 10);

export async function listPostableGroups(groups: GroupWithMembership[]): Promise<PostableGroup[]> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user || groups.length === 0) {
    return [];
  }

  const today = groupDateString();
  const { data, error } = await client
    .from('daily_posts')
    .select('group_id')
    .eq('user_id', user.id)
    .eq('date', today)
    .in(
      'group_id',
      groups.map((group) => group.id),
    );

  if (error) {
    throw error;
  }

  const postedIds = new Set((data ?? []).map((post) => post.group_id as string));

  return groups.map((group) => ({
    ...group,
    posted_today: postedIds.has(group.id),
  }));
}

async function createUploadKey(input: {
  uri: string;
  sizeBytes?: number;
}): Promise<string> {
  if (!env.enableR2Uploads) {
    if (__DEV__) {
      return `local-dev/${uuid()}.mp4`;
    }

    throw new Error('R2 uploads are disabled until native 2-second trimming is enabled.');
  }

  try {
    const signed = await requestSignedVideoUpload({
      contentType: 'video/mp4',
      sizeBytes: input.sizeBytes,
    });
    await uploadVideoToSignedUrl({
      uploadUrl: signed.uploadUrl,
      uri: input.uri,
      contentType: 'video/mp4',
    });
    return signed.key;
  } catch (error) {
    if (!__DEV__) {
      throw error;
    }

    return `local-dev/${uuid()}.mp4`;
  }
}

export async function createDailyPosts(input: CreatePostsInput) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before posting.');
  }

  if (input.groupIds.length === 0) {
    throw new Error('Choose at least one group.');
  }

  assertTwoSecondUploadReady({
    isNativeTrimmed: input.isNativeTrimmed,
    trimDurationMs: input.trimDurationMs,
  });

  const r2Key = await createUploadKey({
    uri: input.uri,
    sizeBytes: input.sizeBytes,
  });

  const { data: asset, error: assetError } = await client
    .from('video_assets')
    .insert({
      user_id: user.id,
      r2_key: r2Key,
      duration_ms: 2000,
      has_audio: input.hasAudio,
      captured_at: input.capturedAt,
      size_bytes: input.sizeBytes ?? null,
      trim_start_ms: input.trimStartMs,
      trim_duration_ms: input.trimDurationMs,
      is_native_trimmed: input.isNativeTrimmed,
      processed_at: input.processedAt ?? null,
    })
    .select('id')
    .single();

  if (assetError) {
    throw assetError;
  }

  const today = groupDateString(new Date(input.capturedAt));
  const posts = input.groupIds.map((groupId) => ({
    asset_id: asset.id,
    group_id: groupId,
    user_id: user.id,
    date: today,
    captured_at: input.capturedAt,
  }));

  const { error: postsError } = await client.from('daily_posts').insert(posts);
  if (postsError) {
    throw postsError;
  }

  await Promise.all(input.groupIds.map((groupId) => recordGroupActivity(groupId, 'post')));

  return asset.id as string;
}
