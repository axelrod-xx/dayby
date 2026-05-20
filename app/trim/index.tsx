import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { trimToTwoSeconds, type TwoSecondTrimResult } from '@/src/features/video/videoProcessingService';

const startOptions = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

export default function TrimScreen() {
  const { uri, muted } = useLocalSearchParams<{ uri?: string; muted?: string }>();
  const router = useRouter();
  const [selectedStartMs, setSelectedStartMs] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [trimResult, setTrimResult] = useState<TwoSecondTrimResult | null>(null);
  const player = useVideoPlayer(uri ?? '', (instance) => {
    instance.loop = true;
    instance.muted = muted === '1';
    void instance.play();
  });

  const selectStart = (startMs: number) => {
    setSelectedStartMs(startMs);
    setTrimResult(null);
  };

  const processClip = async () => {
    if (!uri) {
      return;
    }

    try {
      setProcessing(true);
      const result = await trimToTwoSeconds({
        uri,
        startMs: selectedStartMs,
        muted: muted === '1',
      });
      setTrimResult(result);
    } catch (error) {
      Alert.alert('Trim failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const continueToPost = () => {
    const result = trimResult;
    if (!result) {
      Alert.alert('Choose your 2 seconds', 'Process the selected 2 seconds before choosing groups.');
      return;
    }

    router.push({
      pathname: '/post',
      params: {
        uri: result.uri,
        muted: muted ?? '0',
        trimStartMs: String(result.trimStartMs),
        trimDurationMs: String(result.trimDurationMs),
        isNativeTrimmed: result.isNativeTrimmed ? '1' : '0',
        processedAt: result.processedAt ?? '',
      },
    } as unknown as Href);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Keep 2 sec</Text>
        <Text style={styles.copy}>Pick the two seconds worth keeping. The 10-second take stays on this device.</Text>
      </View>

      {uri ? <VideoView player={player} style={styles.preview} /> : <View style={styles.preview} />}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Selected</Text>
        <Text style={styles.panelText}>
          {(selectedStartMs / 1000).toFixed(1)}s - {((selectedStartMs + 2000) / 1000).toFixed(1)}s ·{' '}
          {muted === '1' ? 'Muted' : 'Original sound'}
        </Text>
        <View style={styles.timeline}>
          {startOptions.map((startMs) => {
            const selected = startMs === selectedStartMs;
            return (
              <Pressable
                key={startMs}
                onPress={() => selectStart(startMs)}
                style={({ pressed }) => [styles.tick, selected && styles.tickSelected, pressed && styles.pressed]}>
                <Text style={[styles.tickText, selected && styles.tickTextSelected]}>{startMs / 1000}s</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.statusText}>
          {trimResult?.isNativeTrimmed
            ? '2-second file ready'
            : trimResult
              ? 'Dev preview ready. Upload stays blocked until native trim is enabled.'
              : 'Not processed yet'}
        </Text>
      </View>

      <PrimaryButton disabled={!uri} loading={processing} onPress={() => void processClip()} variant="light">
        Process 2 sec
      </PrimaryButton>
      <PrimaryButton disabled={!uri || !trimResult} onPress={continueToPost}>
        Choose groups
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '700',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  preview: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 390,
    borderRadius: 8,
    backgroundColor: '#171615',
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 16,
  },
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
  },
  panelText: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tick: {
    minWidth: 48,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 8,
    backgroundColor: '#FBFAF7',
  },
  tickSelected: {
    borderColor: '#171615',
    backgroundColor: '#171615',
  },
  tickText: {
    color: '#68625D',
    fontSize: 13,
    fontWeight: '800',
  },
  tickTextSelected: {
    color: '#FFFEFB',
  },
  pressed: {
    opacity: 0.75,
  },
  statusText: {
    marginTop: 14,
    color: '#78716C',
    fontSize: 13,
    lineHeight: 19,
  },
});
