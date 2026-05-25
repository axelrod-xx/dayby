import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { listDailyMoments, type DailyMoment } from '@/src/features/reels/reelService';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeMoment = moments[activeIndex] ?? null;
  const totalDurationLabel = useMemo(() => `${moments.length * 2}s reel`, [moments.length]);

  useEffect(() => {
    if (!groupId || !date) {
      return;
    }

    listDailyMoments(groupId, date)
      .then(setMoments)
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Daily Reel</Text>
        <Text style={styles.copy}>
          {date} / {moments.length > 0 ? totalDurationLabel : 'yesterday'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptyCopy}>When your group posts, yesterday's air will show up here.</Text>
        </View>
      ) : activeMoment ? (
        <View style={styles.reel}>
          <ReelStage activeIndex={activeIndex} moment={activeMoment} total={moments.length} />
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
                onPress={() => setActiveIndex(index)}
                style={[styles.timelineItem, index === activeIndex && styles.timelineItemActive]}>
                <Text style={[styles.timelineTime, index === activeIndex && styles.timelineTextActive]}>
                  {moment.time_label}
                </Text>
                <Text style={[styles.timelineName, index === activeIndex && styles.timelineTextActive]}>
                  {moment.display_name.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Link href={{ pathname: '/vote/[groupId]/[date]', params: { groupId, date } }} asChild>
          <PrimaryButton disabled={moments.length === 0} onPress={() => undefined} variant="accent">
            Vote for yesterday
          </PrimaryButton>
        </Link>
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

      {groupId ? <ExportActions groupId={groupId} videoUri={null} /> : null}
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
    marginTop: 8,
    color: '#68625D',
    fontSize: 16,
  },
  reel: {
    gap: 14,
  },
  stage: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#171615',
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
    backgroundColor: '#171615',
  },
  fallbackIndex: {
    color: '#FFFEFB',
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
    color: '#FFFEFB',
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  stageCount: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFEFB',
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
    borderColor: '#D8D2C8',
    borderRadius: 8,
    backgroundColor: '#FBFAF7',
  },
  stepText: {
    color: '#171615',
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FBFAF7',
  },
  timelineItemActive: {
    borderColor: '#171615',
    backgroundColor: '#F5F1EA',
  },
  timelineTime: {
    color: '#171615',
    fontSize: 17,
    fontWeight: '900',
  },
  timelineName: {
    marginTop: 4,
    color: '#78716C',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineTextActive: {
    color: '#171615',
  },
  actions: {
    gap: 10,
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
