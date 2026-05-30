import FontAwesome from '@expo/vector-icons/FontAwesome';
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
      <View style={styles.hero}>
        <Text style={styles.kicker}>Memory shelf</Text>
        <Text style={styles.title}>Archive</Text>
        <Text style={styles.copy}>Quiet groups stay here. Opening or posting keeps their memories alive.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : groups.length === 0 ? (
        <View style={styles.emptyCard}>
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
                  <View style={styles.groupText}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>
                      {group.status.replace('_', ' ')} / {getGroupActivityLabel(group)}
                    </Text>
                    {group.delete_after ? (
                      <Text style={styles.deleteHint}>Download before {new Date(group.delete_after).toLocaleDateString()}</Text>
                    ) : null}
                  </View>
                  <FontAwesome color="#8FAFC2" name="chevron-right" size={14} />
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
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 150,
    justifyContent: 'flex-end',
  },
  kicker: {
    marginBottom: 10,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 12,
  },
  groupCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  groupMain: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  groupName: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '900',
  },
  groupMeta: {
    marginTop: 6,
    color: '#617B8F',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  deleteHint: {
    marginTop: 6,
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    minHeight: 176,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    color: '#102033',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
});
