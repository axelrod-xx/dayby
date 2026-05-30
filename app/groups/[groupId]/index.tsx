import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  createGroupInvite,
  getGroup,
  listGroupInvites,
  listGroupMembers,
  recordGroupActivity,
} from '@/src/features/groups/groupService';
import type { GroupInvite, GroupMemberProfile } from '@/src/features/groups/types';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';
import { previousDateString } from '@/src/features/reels/reelService';
import { currentWeekStartString } from '@/src/features/weekly/weeklyService';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<PostableGroup | null>(null);
  const [members, setMembers] = useState<GroupMemberProfile[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const weekStart = currentWeekStartString(now);

  const load = async () => {
    if (!groupId) {
      return;
    }

    const [nextGroup, nextMembers, nextInvites] = await Promise.all([
      getGroup(groupId),
      listGroupMembers(groupId),
      listGroupInvites(groupId),
    ]);

    const [postableGroup] = nextGroup ? await listPostableGroups([nextGroup]) : [];
    setGroup(postableGroup ?? null);
    setMembers(nextMembers);
    setInvites(nextInvites);
  };

  useEffect(() => {
    if (!groupId) {
      return;
    }

    load()
      .catch((error) => Alert.alert('Could not load group', error.message))
      .finally(() => setLoading(false));

    recordGroupActivity(groupId, 'open').catch(() => undefined);
  }, [groupId]);

  const addInvite = async () => {
    if (!groupId) {
      return;
    }

    try {
      setCreatingInvite(true);
      const invite = await createGroupInvite(groupId);
      setInvites((current) => [invite, ...current]);
    } catch (error) {
      Alert.alert('Could not create invite', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const shareInvite = async () => {
    const invite = invites[0];
    if (!invite || !group) {
      Alert.alert('Create a code first', 'Make an invite code before sharing this group.');
      return;
    }

    await Share.share({
      message: `Join ${group.name} on dayby.\nInvite code: ${invite.code}\nTwo seconds a day. One minute a month.`,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#102033" />
      </View>
    );
  }

  if (!group) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Group not found</Text>
        <Text style={styles.copy}>You may need to join this group first.</Text>
      </ScrollView>
    );
  }

  const canManageInvites = group.member_role === 'owner' || group.member_role === 'admin';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Group memory</Text>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.copy}>
          {members.length}/{group.member_limit} friends / {group.timezone}
        </Text>
        <View style={styles.friendStrip}>
          {members.slice(0, 5).map((member) => (
            <View key={member.id} style={styles.friendBubble}>
              <Text style={styles.friendInitial}>{member.display_name.slice(0, 1).toUpperCase()}</Text>
            </View>
          ))}
          {members.length > 5 ? (
            <View style={styles.friendBubble}>
              <Text style={styles.friendInitial}>+{members.length - 5}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.todayPanel}>
        <Text style={styles.panelKicker}>Today</Text>
        <Text style={styles.todayTitle}>{group.posted_today ? 'Posted today.' : "Keep today's 2 seconds."}</Text>
        <Text style={styles.panelText}>
          {group.posted_today
            ? 'Your moment is already in this group. Open yesterday when you want the group day back.'
            : 'A tiny moment from today, saved with the people who were there.'}
        </Text>
        <View style={styles.action}>
          {group.posted_today ? (
            <Link
              href={{
                pathname: '/daily/[groupId]/[date]',
                params: { groupId: group.id, date: previousDateString() },
              }}
              asChild>
              <PrimaryButton onPress={() => undefined} variant="light">
                Open yesterday
              </PrimaryButton>
            </Link>
          ) : (
            <Link href={'/camera' as Href} asChild>
              <PrimaryButton onPress={() => undefined} variant="accent">
                Keep today
              </PrimaryButton>
            </Link>
          )}
        </View>
      </View>

      {members.length <= 1 && canManageInvites ? (
        <View style={styles.inviteNudge}>
          <Text style={styles.inviteNudgeTitle}>This gets better when your friends are in it.</Text>
          <Text style={styles.panelText}>Send the code now, then let the month become something worth showing later.</Text>
          <View style={styles.action}>
            {invites[0] ? (
              <PrimaryButton onPress={() => void shareInvite()} variant="accent">
                Send invite
              </PrimaryButton>
            ) : (
              <PrimaryButton loading={creatingInvite} onPress={() => void addInvite()} variant="accent">
                Create invite code
              </PrimaryButton>
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Yesterday</Text>
            <Text style={styles.panelText}>Watch the group day by time. Save favorites privately.</Text>
          </View>
          <Link
            href={{
              pathname: '/daily/[groupId]/[date]',
              params: { groupId: group.id, date: previousDateString() },
            }}
            asChild>
            <Text style={styles.inlineAction}>Open</Text>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.memoryPreview}>
          <Text style={styles.memoryKicker}>OUR MONTH</Text>
          <Text style={styles.memoryTitle}>{group.name.toUpperCase()}</Text>
          <Text style={styles.memoryCopy}>Everything stays in the archive. The month becomes one minute.</Text>
          <Link
            href={{
              pathname: '/monthly/[groupId]/[year]/[month]',
              params: { groupId: group.id, year: String(currentYear), month: String(currentMonth) },
            }}
            asChild>
            <Text style={styles.memoryAction}>Open this month</Text>
          </Link>
        </View>
      </View>

      <View style={styles.subtlePanel}>
        <Text style={styles.subtleTitle}>This week is taking shape</Text>
        <Text style={styles.panelText}>A small preview exists, but the month is the memory.</Text>
        <View style={styles.action}>
          <Link
            href={{
              pathname: '/weekly/[groupId]/[weekStart]',
              params: { groupId: group.id, weekStart },
            }}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              Peek this week
            </PrimaryButton>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Members</Text>
        <View style={styles.list}>
          {members.map((member) => (
            <View key={member.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{member.display_name}</Text>
                <Text style={styles.rowMeta}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {canManageInvites ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Invite friends</Text>
          <Text style={styles.panelText}>A simple code is easier to send in LINE, Instagram, or a group chat.</Text>
          {invites[0] ? (
            <View style={styles.codeBox}>
              <Text style={styles.code}>{invites[0].code}</Text>
              <Text style={styles.rowMeta}>
                {invites[0].used_count}
                {invites[0].max_uses ? `/${invites[0].max_uses}` : ''} uses
              </Text>
            </View>
          ) : null}
          <View style={styles.action}>
            <PrimaryButton loading={creatingInvite} onPress={() => void addInvite()} variant="light">
              New invite code
            </PrimaryButton>
            {invites[0] ? (
              <PrimaryButton onPress={() => void shareInvite()} variant="light">
                Send latest code
              </PrimaryButton>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Settings</Text>
        <Text style={styles.panelText}>
          {group.plan} plan / monthly highlight included / downloads {group.download_enabled ? 'on' : 'off'}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Safety</Text>
        <Text style={styles.panelText}>Report a moment or group issue without calling anyone out.</Text>
        <View style={styles.action}>
          <Link
            href={{ pathname: '/safety/report', params: { groupId: group.id } } as unknown as Href}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              Report something
            </PrimaryButton>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    gap: 18,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 72,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 178,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  kicker: {
    marginBottom: 9,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
  },
  friendStrip: {
    flexDirection: 'row',
    marginTop: 16,
  },
  friendBubble: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 19,
    marginRight: -8,
    backgroundColor: '#F6FAFF',
  },
  friendInitial: {
    color: '#102033',
    fontSize: 12,
    fontWeight: '900',
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  todayPanel: {
    borderWidth: 1,
    borderColor: '#2F80ED',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  panelKicker: {
    marginBottom: 9,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inviteNudge: {
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#F1F7FF',
  },
  inviteNudgeTitle: {
    color: '#102033',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  todayTitle: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
  },
  panelHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  inlineAction: {
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '900',
  },
  memoryPreview: {
    minHeight: 174,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  memoryKicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  memoryTitle: {
    marginTop: 8,
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
  },
  memoryCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  memoryAction: {
    marginTop: 18,
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '900',
  },
  subtlePanel: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 16,
  },
  panelTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '700',
  },
  subtleTitle: {
    color: '#617B8F',
    fontSize: 15,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    minHeight: 58,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F3F8FC',
  },
  rowTitle: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: 5,
    color: '#617B8F',
    fontSize: 13,
  },
  codeBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#F3F8FC',
  },
  code: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  action: {
    gap: 10,
    marginTop: 14,
  },
});
