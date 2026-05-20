import { requireSupabase } from '@/src/lib/supabase';

import type { Group, GroupInvite, GroupMember, GroupMemberProfile, GroupWithMembership } from './types';

export type GroupActivityEventType = 'post' | 'view' | 'download' | 'vote' | 'open' | 'archive_restore';

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

export async function recordGroupActivity(groupId: string, eventType: GroupActivityEventType) {
  const client = requireSupabase();
  const { error } = await client.rpc('record_group_activity', {
    target_event_type: eventType,
    target_group_id: groupId,
  });

  if (error) {
    throw error;
  }
}

export function getGroupActivityLabel(group: Pick<Group, 'last_posted_at' | 'last_viewed_at' | 'last_downloaded_at'>) {
  const dates = [group.last_posted_at, group.last_viewed_at, group.last_downloaded_at]
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value));

  if (dates.length === 0) {
    return 'No activity yet';
  }

  const latest = new Date(Math.max(...dates.map((date) => date.getTime())));
  const days = Math.floor((Date.now() - latest.getTime()) / 86_400_000);

  if (days <= 0) {
    return 'Active today';
  }

  if (days === 1) {
    return 'Active yesterday';
  }

  return `Active ${days} days ago`;
}

export function isArchiveCandidate(group: GroupWithMembership) {
  return ['quiet', 'archived', 'memory_active', 'dormant', 'delete_scheduled'].includes(group.status);
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

const inviteCode = () =>
  Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

export async function listGroupMembers(groupId: string): Promise<GroupMemberProfile[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('group_members')
    .select(
      `
      id,
      group_id,
      user_id,
      role,
      joined_at,
      users (
        display_name,
        avatar_url
      )
    `,
    )
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;

    return {
      id: row.id,
      group_id: row.group_id,
      user_id: row.user_id,
      role: row.role,
      joined_at: row.joined_at,
      display_name: user?.display_name ?? 'dayby friend',
      avatar_url: user?.avatar_url ?? null,
    } as GroupMemberProfile;
  });
}

export async function listGroupInvites(groupId: string): Promise<GroupInvite[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('group_invites')
    .select('*')
    .eq('group_id', groupId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as GroupInvite[];
}

export async function createGroupInvite(groupId: string): Promise<GroupInvite> {
  const client = requireSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('You need to sign in before creating an invite.');
  }

  const { data, error } = await client
    .from('group_invites')
    .insert({
      group_id: groupId,
      code: inviteCode(),
      created_by: user.id,
      max_uses: 20,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as GroupInvite;
}

export async function joinGroupWithCode(code: string): Promise<string> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('join_group_with_code', {
    invite_code: code.trim().toUpperCase(),
  });

  if (error) {
    throw error;
  }

  return data as string;
}
