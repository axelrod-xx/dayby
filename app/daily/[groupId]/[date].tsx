import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listMyBookmarkedPostIds, setPostBookmarked } from '@/src/features/bookmarks/bookmarkService';
import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { listDailyMoments, removeDailyPost, type DailyMoment } from '@/src/features/reels/reelService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

function ReelStage({
  activeIndex,
  countLabel,
  moment,
  timeLabel,
  total,
}: {
  activeIndex: number;
  countLabel: string;
  moment: DailyMoment;
  timeLabel: string;
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
          {timeLabel} / {moment.display_name.toUpperCase()}
        </Text>
        <Text style={styles.stageCount}>{countLabel}</Text>
      </View>
    </View>
  );
}

export default function DailyReelScreen() {
  const { groupId, date } = useLocalSearchParams<{ groupId: string; date: string }>();
  const { formatters, t } = useI18n();
  const [moments, setMoments] = useState<DailyMoment[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkingPostId, setBookmarkingPostId] = useState<string | null>(null);
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);
  const activeMoment = moments[activeIndex] ?? null;
  const activeBookmarked = activeMoment ? bookmarkedPostIds.has(activeMoment.post_id) : false;
  const totalDurationLabel = useMemo(
    () => t('daily.reelDuration', { duration: t('common.duration.secondsShort', { count: moments.length * 2 }) }),
    [moments.length, t],
  );

  useEffect(() => {
    if (!groupId || !date) {
      return;
    }

    Promise.all([listDailyMoments(groupId, date), listMyBookmarkedPostIds(groupId)])
      .then(([nextMoments, nextBookmarks]) => {
        setMoments(nextMoments);
        setBookmarkedPostIds(nextBookmarks);
      })
      .catch((error) => Alert.alert(t('daily.alert.loadFailed'), resolveErrorMessage(error, t)))
      .finally(() => setLoading(false));
    recordGroupActivity(groupId, 'view').catch(() => undefined);
  }, [date, groupId, t]);

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
      Alert.alert(t('daily.alert.saveFailed'), resolveErrorMessage(error, t));
    } finally {
      setBookmarkingPostId(null);
    }
  };

  const removeActiveMoment = () => {
    if (!activeMoment || removingPostId) {
      return;
    }

    Alert.alert(t('daily.alert.removeTitle'), t('daily.alert.removeBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
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
            Alert.alert(t('daily.alert.removeFailed'), resolveErrorMessage(error, t));
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
        <Text style={styles.kicker}>{t('daily.kicker')}</Text>
        <Text style={styles.title}>{t('daily.title')}</Text>
        <Text style={styles.copy}>
          {date ? formatters.date(`${date}T00:00:00.000Z`) : ''} /{' '}
          {moments.length > 0 ? totalDurationLabel : t('daily.waiting')}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('daily.emptyTitle')}</Text>
          <Text style={styles.emptyCopy}>{t('daily.emptyCopy')}</Text>
        </View>
      ) : activeMoment ? (
        <View style={styles.reel}>
          <ReelStage
            activeIndex={activeIndex}
            countLabel={t('daily.stageCount', { current: activeIndex + 1, total: moments.length })}
            moment={activeMoment}
            timeLabel={formatters.time(activeMoment.captured_at)}
            total={moments.length}
          />
          <View style={styles.momentActions}>
            <PrimaryButton
              disabled={Boolean(bookmarkingPostId)}
              loading={bookmarkingPostId === activeMoment.post_id}
              onPress={() => void toggleBookmark()}
              variant={activeBookmarked ? 'light' : 'accent'}>
              {activeBookmarked ? t('daily.savedForMe') : t('daily.saveForMe')}
            </PrimaryButton>
            {activeMoment.is_mine ? (
              <PrimaryButton
                disabled={Boolean(removingPostId)}
                loading={removingPostId === activeMoment.post_id}
                onPress={removeActiveMoment}
                variant="light">
                {t('daily.removeMine')}
              </PrimaryButton>
            ) : null}
          </View>
          <View style={styles.reelControls}>
            <Pressable disabled={moments.length <= 1} onPress={goPrevious} style={styles.stepButton}>
              <Text style={styles.stepText}>{t('daily.previous')}</Text>
            </Pressable>
            <Pressable disabled={moments.length <= 1} onPress={goNext} style={styles.stepButton}>
              <Text style={styles.stepText}>{t('daily.next')}</Text>
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
                  {formatters.time(moment.captured_at)}
                </Text>
                <Text style={[styles.timelineName, index === activeIndex && styles.timelineTextActive]}>
                  {moment.display_name.toUpperCase()}
                  {bookmarkedPostIds.has(moment.post_id) ? ` / ${t('daily.savedSuffix')}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Link href={{ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            {t('daily.backToGroup')}
          </PrimaryButton>
        </Link>
        <Link href={'/(tabs)' as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            {t('daily.backHome')}
          </PrimaryButton>
        </Link>
      </View>

      {groupId ? (
        <ExportActions
          groupId={groupId}
          r2Keys={moments.map((moment) => moment.r2_key)}
          sourceUris={moments.map((moment) => moment.playback_url)}
        />
      ) : null}
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
