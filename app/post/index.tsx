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
  const postButtonLabel = useMemo(() => {
    if (posting) {
      return 'Posting';
    }

    if (selectedIds.size > 0) {
      return `Post to ${selectedIds.size}`;
    }

    if (groups.length === 0) {
      return 'Create a group first';
    }

    if (availableGroups.length === 0) {
      return 'Already posted today';
    }

    return 'Select a group';
  }, [availableGroups.length, groups.length, posting, selectedIds.size]);

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
      const selectedGroups = groups.filter((group) => selectedIds.has(group.id));
      router.replace({
        pathname: '/post/success',
        params: {
          count: String(selectedGroups.length),
          groupId: selectedGroups.length === 1 ? selectedGroups[0].id : '',
          groupName: selectedGroups.length === 1 ? selectedGroups[0].name : '',
        },
      } as unknown as Href);
    } catch (error) {
      Alert.alert('Post failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View>
          <Text style={styles.kicker}>Send moment</Text>
          <Text style={styles.title}>Choose who keeps it.</Text>
          <Text style={styles.copy}>One 2-second file, shared into the groups you pick.</Text>
        </View>

        <View style={styles.momentCard}>
          <Text style={styles.momentKicker}>Ready to post</Text>
          <Text style={styles.momentTitle}>{muted === '1' ? 'Muted export' : 'Original sound'}</Text>
          <Text style={styles.momentMeta}>{Number(trimStartMs ?? 0) / 1000}s start / 2 sec kept</Text>
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
            <View style={styles.emptyAction}>
              <PrimaryButton onPress={() => router.push('/groups/create' as Href)} variant="light">
                Create group
              </PrimaryButton>
            </View>
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
                    <View style={styles.groupMark}>
                      <Text style={styles.groupInitial}>{group.name.slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.groupText}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupMeta}>
                        {group.posted_today ? 'Already posted today' : `${group.member_role} / ready for today`}
                      </Text>
                    </View>
                    <View style={[styles.check, selected && styles.checkSelected]}>
                      {selected ? <View style={styles.checkDot} /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          disabled={selectedIds.size === 0 || availableGroups.length === 0 || !uri}
          loading={posting}
          onPress={() => void post()}
          variant={selectedIds.size > 0 ? 'accent' : 'dark'}>
          {postButtonLabel}
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFEFB',
  },
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 120,
    paddingTop: 74,
    backgroundColor: '#FFFDF8',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#57534E',
    fontSize: 15,
    fontWeight: '800',
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
    lineHeight: 44,
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  momentCard: {
    minHeight: 132,
    justifyContent: 'flex-end',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#171615',
  },
  momentKicker: {
    color: '#D8D2C8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  momentTitle: {
    marginTop: 8,
    color: '#FFFEFB',
    fontSize: 25,
    fontWeight: '900',
  },
  momentMeta: {
    marginTop: 8,
    color: '#BDB5AA',
    fontSize: 14,
    fontWeight: '800',
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
    padding: 14,
    backgroundColor: '#FFFEFB',
  },
  groupCardSelected: {
    borderColor: '#171615',
    backgroundColor: '#EFE7DD',
  },
  groupCardDisabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.76,
  },
  groupHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#F5F1EA',
  },
  groupInitial: {
    color: '#171615',
    fontSize: 17,
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
  check: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 15,
    backgroundColor: '#FFFEFB',
  },
  checkSelected: {
    borderColor: '#171615',
    backgroundColor: '#171615',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFEFB',
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
  emptyAction: {
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 14,
    backgroundColor: '#FFFEFB',
  },
});
