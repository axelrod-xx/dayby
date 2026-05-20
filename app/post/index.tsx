import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listMyGroups } from '@/src/features/groups/groupService';
import { createDailyPosts, listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';

export default function PostToGroupsScreen() {
  const router = useRouter();
  const { isNativeTrimmed, muted, processedAt, trimDurationMs, trimStartMs, uri } = useLocalSearchParams<{
    isNativeTrimmed?: string;
    muted?: string;
    processedAt?: string;
    trimDurationMs?: string;
    trimStartMs?: string;
    uri?: string;
  }>();
  const [groups, setGroups] = useState<PostableGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    listMyGroups()
      .then(listPostableGroups)
      .then(setGroups)
      .catch((error) => Alert.alert('Could not load groups', error.message))
      .finally(() => setLoading(false));
  }, []);

  const availableGroups = useMemo(() => groups.filter((group) => !group.posted_today), [groups]);

  const toggle = (group: PostableGroup) => {
    if (group.posted_today) {
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(group.id)) {
        next.delete(group.id);
      } else {
        next.add(group.id);
      }
      return next;
    });
  };

  const post = async () => {
    if (!uri) {
      Alert.alert('No video', 'Record a video first.');
      return;
    }

    try {
      setPosting(true);
      await createDailyPosts({
        uri,
        groupIds: Array.from(selectedIds),
        hasAudio: muted !== '1',
        capturedAt: new Date().toISOString(),
        trimStartMs: Number(trimStartMs ?? 0),
        trimDurationMs: Number(trimDurationMs ?? 2000),
        isNativeTrimmed: isNativeTrimmed === '1',
        processedAt: processedAt || null,
      });
      router.replace('/(tabs)/groups' as Href);
    } catch (error) {
      Alert.alert('Post failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Post to groups</Text>
        <Text style={styles.copy}>One 2-second video can go to multiple groups. The file stays single.</Text>
      </View>

      <View style={styles.soundPill}>
        <Text style={styles.soundText}>
          {muted === '1' ? 'Muted export' : 'Original sound'} · {Number(trimStartMs ?? 0) / 1000}s start
        </Text>
      </View>

      {isNativeTrimmed !== '1' ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Dev preview</Text>
          <Text style={styles.noticeCopy}>Native 2-second export is not enabled yet, so real uploads stay blocked.</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptyCopy}>Create or join a group before posting today's moment.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {groups.map((group) => {
            const selected = selectedIds.has(group.id);
            return (
              <Pressable
                key={group.id}
                onPress={() => toggle(group)}
                style={({ pressed }) => [
                  styles.groupCard,
                  selected && styles.groupCardSelected,
                  group.posted_today && styles.groupCardDisabled,
                  pressed && !group.posted_today && styles.pressed,
                ]}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={[styles.check, selected && styles.checkSelected]}>
                    <Text style={[styles.checkText, selected && styles.checkTextSelected]}>{selected ? '✓' : ''}</Text>
                  </View>
                </View>
                <Text style={styles.groupMeta}>
                  {group.posted_today ? 'Already posted today' : `${group.member_role} · ready for today`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <PrimaryButton
        disabled={selectedIds.size === 0 || availableGroups.length === 0 || !uri}
        loading={posting}
        onPress={() => void post()}>
        Post {selectedIds.size > 0 ? `to ${selectedIds.size}` : ''}
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '800',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  soundPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F2EEE7',
  },
  soundText: {
    color: '#3F3A35',
    fontSize: 13,
    fontWeight: '700',
  },
  notice: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FBFAF7',
  },
  noticeTitle: {
    color: '#171615',
    fontSize: 15,
    fontWeight: '800',
  },
  noticeCopy: {
    marginTop: 6,
    color: '#68625D',
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  groupCardSelected: {
    borderColor: '#171615',
    backgroundColor: '#F5F1EA',
  },
  groupCardDisabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.76,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupName: {
    flex: 1,
    color: '#171615',
    fontSize: 18,
    fontWeight: '800',
  },
  groupMeta: {
    marginTop: 8,
    color: '#78716C',
    fontSize: 13,
  },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 14,
    backgroundColor: '#FFFEFB',
  },
  checkSelected: {
    borderColor: '#171615',
    backgroundColor: '#171615',
  },
  checkText: {
    color: '#FFFEFB',
    fontSize: 15,
    fontWeight: '800',
  },
  checkTextSelected: {
    color: '#FFFEFB',
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
