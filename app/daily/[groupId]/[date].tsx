import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listDailyMoments, type DailyMoment } from '@/src/features/reels/reelService';

function MomentCard({ moment, index }: { moment: DailyMoment; index: number }) {
  const player = useVideoPlayer(moment.playback_url ?? '', (instance) => {
    instance.loop = true;
    instance.muted = true;
    if (moment.playback_url) {
      void instance.play();
    }
  });

  return (
    <View style={styles.moment}>
      {moment.playback_url ? (
        <VideoView player={player} style={styles.video} />
      ) : (
        <View style={styles.videoFallback}>
          <Text style={styles.fallbackIndex}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {moment.time_label} · {moment.display_name.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

export default function DailyReelScreen() {
  const { groupId, date } = useLocalSearchParams<{ groupId: string; date: string }>();
  const [moments, setMoments] = useState<DailyMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !date) {
      return;
    }

    listDailyMoments(groupId, date)
      .then(setMoments)
      .catch((error) => Alert.alert('Could not load daily reel', error.message))
      .finally(() => setLoading(false));
  }, [date, groupId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Daily Reel</Text>
        <Text style={styles.copy}>{date}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptyCopy}>When your group posts, yesterday's air will show up here.</Text>
        </View>
      ) : (
        <View style={styles.reel}>
          {moments.map((moment, index) => (
            <MomentCard key={moment.post_id} index={index} moment={moment} />
          ))}
        </View>
      )}

      <Link href={{ pathname: '/vote/[groupId]/[date]', params: { groupId, date } }} asChild>
        <PrimaryButton disabled={moments.length === 0} onPress={() => undefined}>
          Vote for yesterday
        </PrimaryButton>
      </Link>
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
  moment: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#171615',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  videoFallback: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171615',
  },
  fallbackIndex: {
    color: '#FFFEFB',
    fontSize: 42,
    fontWeight: '900',
  },
  overlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayText: {
    color: '#FFFEFB',
    fontSize: 13,
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
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
});
