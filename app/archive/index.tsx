import { Link, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import {
  getGroupActivityLabel,
  isArchiveCandidate,
  listMyGroups,
  recordGroupActivity,
} from '@/src/features/groups/groupService';
import type { GroupWithMembership } from '@/src/features/groups/types';

export default function ArchiveScreen() {
  const { status } = useAuth();
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (status !== 'signed-in') {
        setGroups([]);
        return;
      }

      setLoading(true);
      listMyGroups()
        .then((nextGroups) => setGroups(nextGroups.filter(isArchiveCandidate)))
        .catch((error) => Alert.alert('Could not load archive', error.message))
        .finally(() => setLoading(false));
    }, [status]),
  );

  const restore = async (groupId: string) => {
    try {
      await recordGroupActivity(groupId, 'archive_restore');
      setGroups((current) => current.filter((group) => group.id !== groupId));
    } catch (error) {
      Alert.alert('Could not restore group', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.kicker}>Memory shelf</Text>
        <Text style={styles.title}>Archive</Text>
        <Text style={styles.copy}>Quiet groups stay here. Opening or posting keeps their memories alive.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing quiet yet</Text>
          <Text style={styles.emptyCopy}>Groups move here after long pauses, without making anyone feel late.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {groups.map((group) => (
            <View key={group.id} style={styles.groupCard}>
              <Link
                href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } } as unknown as Href}
                asChild>
                <Pressable style={({ pressed }) => [styles.groupMain, pressed && styles.pressed]}>
                  <View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>
                      {group.status.replace('_', ' ')} · {getGroupActivityLabel(group)}
                    </Text>
                    {group.delete_after ? (
                      <Text style={styles.deleteHint}>Download before {new Date(group.delete_after).toLocaleDateString()}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </Link>
              {group.status === 'archived' || group.status === 'quiet' ? (
                <PrimaryButton onPress={() => void restore(group.id)} variant="light">
                  Move to active
                </PrimaryButton>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 74,
    backgroundColor: '#FFFDF8',
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
    fontSize: 40,
    fontWeight: '900',
  },
  copy: {
    marginTop: 12,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 12,
  },
  groupCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FFFEFB',
  },
  groupMain: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.75,
  },
  groupName: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '800',
  },
  groupMeta: {
    marginTop: 6,
    color: '#78716C',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  deleteHint: {
    marginTop: 6,
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
});
