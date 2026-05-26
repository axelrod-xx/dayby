import { Link, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getGroupActivityLabel, isArchiveCandidate, listMyGroups } from '@/src/features/groups/groupService';
import type { GroupWithMembership } from '@/src/features/groups/types';

export default function GroupsScreen() {
  const { isProfileComplete, isSupabaseConfigured, status } = useAuth();
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const canCreateGroup = status === 'signed-in' && isProfileComplete;
  const activeGroups = groups.filter((group) => !isArchiveCandidate(group));
  const archivedGroups = groups.filter(isArchiveCandidate);

  useFocusEffect(
    useCallback(() => {
      if (!canCreateGroup) {
        setGroups([]);
        return;
      }

      setLoading(true);
      listMyGroups()
        .then(setGroups)
        .catch((error) => Alert.alert('Could not load groups', error.message))
        .finally(() => setLoading(false));
    }, [canCreateGroup]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Your circles</Text>
        <Text style={styles.title}>Groups</Text>
        <Text style={styles.body}>
          Small rooms for the months you want to remember together.
        </Text>
      </View>

      <View style={styles.action}>
        {status !== 'signed-in' ? (
          <Link href="/(auth)/sign-in" asChild>
            <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined}>
              Sign in first
            </PrimaryButton>
          </Link>
        ) : !isProfileComplete ? (
          <Link href="/profile-setup" asChild>
            <PrimaryButton onPress={() => undefined}>Set profile</PrimaryButton>
          </Link>
        ) : (
          <View style={styles.actionGrid}>
            <Link href="/groups/create" asChild>
              <PrimaryButton onPress={() => undefined} variant="accent">
                Create group
              </PrimaryButton>
            </Link>
            <Link href="/groups/join" asChild>
              <PrimaryButton onPress={() => undefined} variant="light">
                Enter code
              </PrimaryButton>
            </Link>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : groups.length > 0 ? (
        <View style={styles.list}>
          <View style={styles.monthPreview}>
            <Text style={styles.previewKicker}>This month</Text>
            <Text style={styles.previewTitle}>{activeGroups.length} active group{activeGroups.length === 1 ? '' : 's'}</Text>
            <Text style={styles.previewCopy}>No feeds. Just the people and the days.</Text>
          </View>
          {activeGroups.map((group) => (
            <Link
              key={group.id}
              href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } } as unknown as Href}
              asChild>
              <Pressable style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}>
                <View style={styles.groupMark}>
                  <Text style={styles.groupInitial}>{group.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.groupText}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>
                    {getGroupActivityLabel(group)} / {group.member_role}
                  </Text>
                </View>
                <Text style={styles.chevron}>&gt;</Text>
              </Pressable>
            </Link>
          ))}
          {archivedGroups.length > 0 ? (
            <Link href={'/archive' as Href} asChild>
              <Pressable style={({ pressed }) => [styles.archiveLink, pressed && styles.pressed]}>
                <Text style={styles.archiveText}>
                  {archivedGroups.length} quiet group{archivedGroups.length > 1 ? 's' : ''}
                </Text>
                <Text style={styles.chevron}>&gt;</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptyCopy}>Create a small group to start keeping this month together.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 22,
    paddingTop: 78,
    backgroundColor: '#FFFDF8',
  },
  hero: {
    minHeight: 146,
    justifyContent: 'flex-end',
  },
  kicker: {
    marginBottom: 10,
    color: '#E65A3C',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#171615',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
  },
  body: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    marginTop: 4,
  },
  actionGrid: {
    gap: 10,
  },
  list: {
    gap: 12,
  },
  monthPreview: {
    minHeight: 154,
    justifyContent: 'flex-end',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#171615',
  },
  previewKicker: {
    color: '#D8D2C8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewTitle: {
    marginTop: 8,
    color: '#FFFEFB',
    fontSize: 26,
    fontWeight: '900',
  },
  previewCopy: {
    marginTop: 8,
    color: '#BDB5AA',
    fontSize: 14,
    lineHeight: 20,
  },
  groupRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    gap: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFEFB',
  },
  pressed: {
    opacity: 0.75,
  },
  groupMark: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#EFE7DD',
  },
  groupInitial: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '900',
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '900',
  },
  groupMeta: {
    marginTop: 6,
    color: '#78716C',
    fontSize: 13,
  },
  chevron: {
    color: '#A49B91',
    fontSize: 28,
  },
  archiveLink: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingHorizontal: 4,
  },
  archiveText: {
    color: '#78716C',
    fontSize: 14,
    fontWeight: '800',
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
});
