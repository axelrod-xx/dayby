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
      message: `Join ${group.name} on dayby. Invite code: ${invite.code}`,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#171615" />
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
      <View>
        <Text style={styles.kicker}>Group</Text>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.copy}>
          {group.timezone} / {members.length}/{group.member_limit} friends
        </Text>
      </View>

      <View style={styles.todayPanel}>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.todayTitle}>{group.posted_today ? 'Posted today.' : "Keep today's 2 seconds."}</Text>
        <Text style={styles.panelText}>
          {group.posted_today
            ? 'Your moment is already in this group. Come back tomorrow to vote.'
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
                Capture today
              </PrimaryButton>
            </Link>
          )}
        </View>
      </View>

      {members.length <= 1 && canManageInvites ? (
        <View style={styles.inviteNudge}>
          <Text style={styles.inviteNudgeTitle}>Bring your people in.</Text>
          <Text style={styles.panelText}>dayby starts to feel right when a few friends keep the same month together.</Text>
          <View style={styles.action}>
            {invites[0] ? (
              <PrimaryButton onPress={() => void shareInvite()} variant="accent">
                Share invite code
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
        <Text style={styles.panelTitle}>Yesterday</Text>
        <Text style={styles.panelText}>Watch by time, then choose the 2 seconds worth keeping.</Text>
        <View style={styles.action}>
          <Link
            href={{
              pathname: '/daily/[groupId]/[date]',
              params: { groupId: group.id, date: previousDateString() },
            }}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              Open Daily Reel
            </PrimaryButton>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Monthly Memory</Text>
        <Text style={styles.panelText}>The kept moments from this month, in order.</Text>
        <View style={styles.action}>
          <Link
            href={{
              pathname: '/monthly/[groupId]/[year]/[month]',
              params: { groupId: group.id, year: String(currentYear), month: String(currentMonth) },
            }}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              Open this month
            </PrimaryButton>
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
          <Text style={styles.panelTitle}>Invite</Text>
          <Text style={styles.panelText}>Share a code with friends. Links can come later.</Text>
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
                Share latest code
              </PrimaryButton>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Settings</Text>
        <Text style={styles.panelText}>
          {group.plan} plan / monthly highlight {group.monthly_highlight_enabled ? 'on' : 'off'} / downloads{' '}
          {group.download_enabled ? 'on' : 'off'}
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
    backgroundColor: '#FFFEFB',
  },
  container: {
    gap: 24,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 84,
    backgroundColor: '#FFFDF8',
  },
  kicker: {
    marginBottom: 9,
    color: '#E65A3C',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '700',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  todayPanel: {
    borderWidth: 1,
    borderColor: '#E4DED5',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  inviteNudge: {
    borderWidth: 1,
    borderColor: '#171615',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#F5F1EA',
  },
  inviteNudgeTitle: {
    color: '#171615',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  todayTitle: {
    color: '#141312',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtlePanel: {
    borderTopWidth: 1,
    borderTopColor: '#EEEAE3',
    paddingTop: 16,
  },
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
  },
  subtleTitle: {
    color: '#57534E',
    fontSize: 15,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#68625D',
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FBFAF7',
  },
  rowTitle: {
    color: '#171615',
    fontSize: 16,
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: 5,
    color: '#78716C',
    fontSize: 13,
  },
  codeBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  code: {
    color: '#171615',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  action: {
    gap: 10,
    marginTop: 14,
  },
});
