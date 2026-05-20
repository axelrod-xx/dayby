import { Link, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { listMyGroups } from '@/src/features/groups/groupService';
import type { GroupWithMembership } from '@/src/features/groups/types';

export default function GroupsScreen() {
  const { isProfileComplete, isSupabaseConfigured, status } = useAuth();
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const canCreateGroup = status === 'signed-in' && isProfileComplete;

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
      <View>
        <Text style={styles.title}>Groups</Text>
        <Text style={styles.body}>
          Your friend groups live here. One group, one day, one kept moment.
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
              <PrimaryButton onPress={() => undefined}>Create group</PrimaryButton>
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
          {groups.map((group) => (
            <Link
              key={group.id}
              href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } } as unknown as Href}
              asChild>
              <Pressable style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}>
                <View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>
                    {group.member_role} · {group.timezone}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          ))}
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
    gap: 22,
    paddingHorizontal: 22,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '700',
  },
  body: {
    marginTop: 16,
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
    gap: 10,
  },
  groupRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FBFAF7',
  },
  pressed: {
    opacity: 0.75,
  },
  groupName: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
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
