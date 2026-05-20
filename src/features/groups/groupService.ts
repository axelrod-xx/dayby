import { requireSupabase } from '@/src/lib/supabase';

import type { Group, GroupMember, GroupWithMembership } from './types';

type CreateGroupInput = {
  name: string;
  timezone: string;
  memberLimit: number;
  monthlyHighlightEnabled: boolean;
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

export const getLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export async function listMyGroups(): Promise<GroupWithMembership[]> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await client
    .from('group_members')
    .select(
      `
      role,
      groups (
        id,
        name,
        owner_id,
        timezone,
        member_limit,
        plan,
        monthly_highlight_enabled,
        download_enabled,
        status,
        last_posted_at,
        last_viewed_at,
        last_downloaded_at,
        created_at,
        updated_at
      )
    `,
    )
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => {
      const group = Array.isArray(row.groups) ? row.groups[0] : row.groups;
      if (!group) {
        return null;
      }

      return {
        ...(group as Group),
        member_role: row.role as GroupMember['role'],
      };
    })
    .filter((group): group is GroupWithMembership => Boolean(group));
}

export async function getGroup(groupId: string): Promise<GroupWithMembership | null> {
  const groups = await listMyGroups();
  return groups.find((group) => group.id === groupId) ?? null;
}

export async function createGroup(input: CreateGroupInput): Promise<string> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before creating a group.');
  }

  const groupId = uuid();
  const name = input.name.trim();

  if (!name) {
    throw new Error('Group name is required.');
  }

  const { error: groupError } = await client.from('groups').insert({
    id: groupId,
    name,
    owner_id: user.id,
    timezone: input.timezone,
    member_limit: input.memberLimit,
    monthly_highlight_enabled: input.monthlyHighlightEnabled,
  });

  if (groupError) {
    throw groupError;
  }

  const { error: memberError } = await client.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    role: 'owner',
  });

  if (memberError) {
    throw memberError;
  }

  return groupId;
}
