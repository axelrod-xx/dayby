import {
  getLocalVideoFileSize,
  requestSignedVideoUpload,
  uploadVideoToSignedUrl,
} from '@/src/features/video/uploadService';
import { env } from '@/src/lib/env';
import { dateStringInTimeZone } from '@/src/lib/groupTime';
import { I18nError } from '@/src/lib/i18n/errors';
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

export const groupDateString = (date = new Date(), timeZone = 'UTC') => dateStringInTimeZone(date, timeZone);

export async function listPostableGroups(groups: GroupWithMembership[]): Promise<PostableGroup[]> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user || groups.length === 0) {
    return [];
  }

  const todayByGroup = new Map(groups.map((group) => [group.id, groupDateString(new Date(), group.timezone)]));
  const dates = Array.from(new Set(todayByGroup.values()));
  const { data, error } = await client
    .from('daily_posts')
    .select('group_id, date')
    .eq('user_id', user.id)
    .in('date', dates)
    .in(
      'group_id',
      groups.map((group) => group.id),
    );

  if (error) {
    throw error;
  }

  const postedKeys = new Set((data ?? []).map((post) => `${post.group_id as string}:${post.date as string}`));

  return groups.map((group) => ({
    ...group,
    posted_today: postedKeys.has(`${group.id}:${todayByGroup.get(group.id)}`),
  }));
}

async function createUploadKey(input: {
  uri: string;
  sizeBytes: number;
}): Promise<string> {
  if (!env.enableR2Uploads) {
    if (__DEV__) {
      return `local-dev/${uuid()}.mp4`;
    }

    throw new I18nError('post.error.r2Disabled');
  }

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
}

export async function createDailyPosts(input: CreatePostsInput) {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new I18nError('post.error.signInRequired');
  }

  if (input.groupIds.length === 0) {
    throw new I18nError('post.error.chooseGroup');
  }

  const { data: selectedGroups, error: selectedGroupsError } = await client
    .from('groups')
    .select('id, timezone')
    .in('id', input.groupIds);

  if (selectedGroupsError) {
    throw selectedGroupsError;
  }

  const timezoneByGroup = new Map((selectedGroups ?? []).map((group) => [group.id as string, group.timezone as string]));
  if (timezoneByGroup.size !== input.groupIds.length) {
    throw new I18nError('post.error.timezoneMissing');
  }

  assertTwoSecondUploadReady({
    isNativeTrimmed: input.isNativeTrimmed,
    trimDurationMs: input.trimDurationMs,
  });

  const sizeBytes = input.sizeBytes ?? (await getLocalVideoFileSize(input.uri));

  if (typeof sizeBytes !== 'number' || !Number.isFinite(sizeBytes)) {
    throw new I18nError('post.error.sizeUnknown');
  }

  if (sizeBytes > 3_000_000) {
    throw new I18nError('post.error.tooLarge');
  }

  const r2Key = await createUploadKey({
    uri: input.uri,
    sizeBytes,
  });

  const { data: asset, error: assetError } = await client
    .from('video_assets')
    .insert({
      user_id: user.id,
      r2_key: r2Key,
      duration_ms: 2000,
      has_audio: input.hasAudio,
      captured_at: input.capturedAt,
      size_bytes: sizeBytes,
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

  const posts = input.groupIds.map((groupId) => ({
    asset_id: asset.id,
    group_id: groupId,
    user_id: user.id,
    date: groupDateString(new Date(input.capturedAt), timezoneByGroup.get(groupId) ?? 'UTC'),
    captured_at: input.capturedAt,
  }));

  const { error: postsError } = await client.from('daily_posts').insert(posts);
  if (postsError) {
    throw postsError;
  }

  await Promise.all(input.groupIds.map((groupId) => recordGroupActivity(groupId, 'post')));

  return asset.id as string;
}
