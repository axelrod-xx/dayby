import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  createGroupInvite,
  getGroup,
  listGroupInvites,
  listGroupMembers,
  recordGroupActivity,
} from '@/src/features/groups/groupService';
import type { GroupInvite, GroupMemberProfile, GroupWithMembership } from '@/src/features/groups/types';
import { previousDateString } from '@/src/features/reels/reelService';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<GroupWithMembership | null>(null);
  const [members, setMembers] = useState<GroupMemberProfile[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const load = async () => {
    if (!groupId) {
      return;
    }

    const [nextGroup, nextMembers, nextInvites] = await Promise.all([
      getGroup(groupId),
      listGroupMembers(groupId),
      listGroupInvites(groupId),
    ]);

    setGroup(nextGroup);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.copy}>{group.timezone}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Today</Text>
        <Text style={styles.panelText}>Capture flow comes next: shoot 10 sec, keep 2 sec.</Text>
        <View style={styles.action}>
          <Link href={'/camera' as Href} asChild>
            <PrimaryButton onPress={() => undefined}>Capture today</PrimaryButton>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Yesterday</Text>
        <Text style={styles.panelText}>Watch the daily reel, then choose the 2 seconds worth keeping.</Text>
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
        <Text style={styles.panelTitle}>Settings</Text>
        <Text style={styles.panelText}>
          {group.member_limit} members on {group.plan}. Monthly highlight is{' '}
          {group.monthly_highlight_enabled ? 'on' : 'off'}.
        </Text>
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

      {group.member_role === 'owner' || group.member_role === 'admin' ? (
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
              Create invite code
            </PrimaryButton>
          </View>
        </View>
      ) : null}
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
    backgroundColor: '#FFFEFB',
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
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
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
    marginTop: 14,
  },
});
