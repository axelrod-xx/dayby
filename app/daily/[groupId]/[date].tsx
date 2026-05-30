import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listMyBookmarkedPostIds, setPostBookmarked } from '@/src/features/bookmarks/bookmarkService';
import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { listDailyMoments, removeDailyPost, type DailyMoment } from '@/src/features/reels/reelService';

function ReelStage({
  activeIndex,
  moment,
  total,
}: {
  activeIndex: number;
  moment: DailyMoment;
  total: number;
}) {
  const player = useVideoPlayer(moment.playback_url ?? '', (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.timeUpdateEventInterval = 0.1;
    if (moment.playback_url) {
      void instance.play();
    }
  });

  useEffect(() => {
    if (!moment.playback_url) {
      return;
    }

    player.currentTime = 0;
    player.play();
  }, [moment.playback_url, player]);

  return (
    <View style={styles.stage}>
      {moment.playback_url ? (
        <VideoView contentFit="cover" nativeControls={false} player={player} style={styles.stageVideo} />
      ) : (
        <View style={styles.stageFallback}>
          <Text style={styles.fallbackIndex}>{String(activeIndex + 1).padStart(2, '0')}</Text>
        </View>
      )}
      <View style={styles.stageOverlay}>
        <Text numberOfLines={1} style={styles.stageMeta}>
          {moment.time_label} / {moment.display_name.toUpperCase()}
        </Text>
        <Text style={styles.stageCount}>
          {activeIndex + 1} of {total}
        </Text>
      </View>
    </View>
  );
}

export default function DailyReelScreen() {
  const { groupId, date } = useLocalSearchParams<{ groupId: string; date: string }>();
  const [moments, setMoments] = useState<DailyMoment[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkingPostId, setBookmarkingPostId] = useState<string | null>(null);
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);
  const activeMoment = moments[activeIndex] ?? null;
  const activeBookmarked = activeMoment ? bookmarkedPostIds.has(activeMoment.post_id) : false;
  const totalDurationLabel = useMemo(() => `${moments.length * 2}s reel`, [moments.length]);

  useEffect(() => {
    if (!groupId || !date) {
      return;
    }

    Promise.all([listDailyMoments(groupId, date), listMyBookmarkedPostIds(groupId)])
      .then(([nextMoments, nextBookmarks]) => {
        setMoments(nextMoments);
        setBookmarkedPostIds(nextBookmarks);
      })
      .catch((error) => Alert.alert('Could not load daily reel', error.message))
      .finally(() => setLoading(false));
    recordGroupActivity(groupId, 'view').catch(() => undefined);
  }, [date, groupId]);

  useEffect(() => {
    setActiveIndex(0);
  }, [date, groupId, moments.length]);

  useEffect(() => {
    if (moments.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % moments.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [moments.length]);

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + moments.length) % moments.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % moments.length);
  };

  const toggleBookmark = async (moment: DailyMoment | null = activeMoment) => {
    if (!moment || bookmarkingPostId) {
      return;
    }

    const bookmarked = bookmarkedPostIds.has(moment.post_id);

    try {
      setBookmarkingPostId(moment.post_id);
      await setPostBookmarked({
        groupId: moment.group_id,
        postId: moment.post_id,
        bookmarked: !bookmarked,
      });
      setBookmarkedPostIds((current) => {
        const next = new Set(current);

        if (bookmarked) {
          next.delete(moment.post_id);
        } else {
          next.add(moment.post_id);
        }

        return next;
      });
    } catch (error) {
      Alert.alert('Could not save moment', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBookmarkingPostId(null);
    }
  };

  const removeActiveMoment = () => {
    if (!activeMoment || removingPostId) {
      return;
    }

    Alert.alert('Remove this moment?', 'It will disappear quietly from the archive and future monthly highlights.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setRemovingPostId(activeMoment.post_id);
            await removeDailyPost({ groupId: activeMoment.group_id, postId: activeMoment.post_id });
            setMoments((current) => current.filter((moment) => moment.post_id !== activeMoment.post_id));
            setBookmarkedPostIds((current) => {
              const next = new Set(current);
              next.delete(activeMoment.post_id);
              return next;
            });
            setActiveIndex((current) => Math.max(0, Math.min(current, moments.length - 2)));
          } catch (error) {
            Alert.alert('Could not remove moment', error instanceof Error ? error.message : 'Please try again.');
          } finally {
            setRemovingPostId(null);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.kicker}>Yesterday</Text>
        <Text style={styles.title}>Daily Reel</Text>
        <Text style={styles.copy}>
          {date} / {moments.length > 0 ? totalDurationLabel : 'waiting for moments'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptyCopy}>When your group posts, yesterday's air will show up here.</Text>
        </View>
      ) : activeMoment ? (
        <View style={styles.reel}>
          <ReelStage activeIndex={activeIndex} moment={activeMoment} total={moments.length} />
          <View style={styles.momentActions}>
            <PrimaryButton
              disabled={Boolean(bookmarkingPostId)}
              loading={bookmarkingPostId === activeMoment.post_id}
              onPress={() => void toggleBookmark()}
              variant={activeBookmarked ? 'light' : 'accent'}>
              {activeBookmarked ? 'Saved for me' : 'Save for me'}
            </PrimaryButton>
            {activeMoment.is_mine ? (
              <PrimaryButton
                disabled={Boolean(removingPostId)}
                loading={removingPostId === activeMoment.post_id}
                onPress={removeActiveMoment}
                variant="light">
                Remove mine
              </PrimaryButton>
            ) : null}
          </View>
          <View style={styles.reelControls}>
            <Pressable disabled={moments.length <= 1} onPress={goPrevious} style={styles.stepButton}>
              <Text style={styles.stepText}>Previous</Text>
            </Pressable>
            <Pressable disabled={moments.length <= 1} onPress={goNext} style={styles.stepButton}>
              <Text style={styles.stepText}>Next</Text>
            </Pressable>
          </View>
          <View style={styles.timeline}>
            {moments.map((moment, index) => (
              <Pressable
                key={moment.post_id}
                onLongPress={() => void toggleBookmark(moment)}
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.timelineItem,
                  index === activeIndex && styles.timelineItemActive,
                  bookmarkedPostIds.has(moment.post_id) && styles.timelineItemSaved,
                ]}>
                <Text style={[styles.timelineTime, index === activeIndex && styles.timelineTextActive]}>
                  {moment.time_label}
                </Text>
                <Text style={[styles.timelineName, index === activeIndex && styles.timelineTextActive]}>
                  {moment.display_name.toUpperCase()}
                  {bookmarkedPostIds.has(moment.post_id) ? ' / SAVED' : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Link href={{ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            Back to group
          </PrimaryButton>
        </Link>
        <Link href={'/(tabs)' as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            Back home
          </PrimaryButton>
        </Link>
      </View>

      {groupId ? <ExportActions groupId={groupId} sourceUris={moments.map((moment) => moment.playback_url)} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 72,
    backgroundColor: '#102033',
  },
  kicker: {
    marginBottom: 8,
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 8,
    color: '#9FB8CC',
    fontSize: 16,
  },
  reel: {
    gap: 14,
  },
  momentActions: {
    gap: 10,
  },
  stage: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#0E0D0C',
  },
  stageVideo: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 430,
  },
  stageFallback: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102033',
  },
  fallbackIndex: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
  },
  stageOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stageMeta: {
    flexShrink: 1,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  stageCount: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  reelControls: {
    flexDirection: 'row',
    gap: 10,
  },
  stepButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.22)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,254,251,0.08)',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  timeline: {
    gap: 8,
  },
  timelineItem: {
    minHeight: 58,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,254,251,0.06)',
  },
  timelineItemActive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,254,251,0.14)',
  },
  timelineItemSaved: {
    borderColor: '#7DB7FF',
  },
  timelineTime: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  timelineName: {
    marginTop: 4,
    color: '#9FB8CC',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    gap: 10,
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,254,251,0.18)',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#9FB8CC',
    fontSize: 15,
    lineHeight: 22,
  },
});
