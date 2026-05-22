import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { trimToTwoSeconds, type TwoSecondTrimResult } from '@/src/features/video/videoProcessingService';

const maxStartMs = 8000;
const selectedDurationMs = 2000;
const timelineMarks = [0, 2000, 4000, 6000, 8000, 10000];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatSeconds = (valueMs: number) => `${(valueMs / 1000).toFixed(1)}s`;

export default function TrimScreen() {
  const { uri, muted } = useLocalSearchParams<{ uri?: string; muted?: string }>();
  const router = useRouter();
  const [selectedStartMs, setSelectedStartMs] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [trimResult, setTrimResult] = useState<TwoSecondTrimResult | null>(null);
  const player = useVideoPlayer(uri ?? '', (instance) => {
    instance.loop = true;
    instance.muted = muted === '1';
    void instance.play();
  });

  const selectStart = (startMs: number) => {
    setSelectedStartMs(clamp(Math.round(startMs / 100) * 100, 0, maxStartMs));
    setTrimResult(null);
  };

  const selectStartFromX = (x: number) => {
    if (!trackWidth) {
      return;
    }

    selectStart((clamp(x, 0, trackWidth) / trackWidth) * maxStartMs);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => selectStartFromX(event.nativeEvent.locationX),
        onPanResponderMove: (event) => selectStartFromX(event.nativeEvent.locationX),
      }),
    [trackWidth],
  );

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
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Keep 2 sec</Text>
        <Text style={styles.copy}>Pick the two seconds worth keeping. The 10-second take stays on this device.</Text>
      </View>

      {uri ? <VideoView player={player} style={styles.preview} /> : <View style={styles.preview} />}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Selected</Text>
        <Text style={styles.panelText}>
          {formatSeconds(selectedStartMs)} - {formatSeconds(selectedStartMs + selectedDurationMs)} ·{' '}
          {muted === '1' ? 'Muted' : 'Original sound'}
        </Text>
        <View
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          style={styles.timeline}
          {...panResponder.panHandlers}>
          <View style={styles.track} />
          <View
            style={[
              styles.window,
              {
                left: `${(selectedStartMs / 10000) * 100}%`,
                width: `${(selectedDurationMs / 10000) * 100}%`,
              },
            ]}
          />
          <View style={[styles.handle, { left: `${(selectedStartMs / 10000) * 100}%` }]} />
          <View style={[styles.handle, { left: `${((selectedStartMs + selectedDurationMs) / 10000) * 100}%` }]} />
        </View>
        <View style={styles.markRow}>
          {timelineMarks.map((mark) => (
            <Pressable key={mark} onPress={() => selectStart(Math.min(mark, maxStartMs))} hitSlop={8}>
              <Text style={styles.markText}>{mark / 1000}s</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helperText}>Drag the highlighted 2-second window. End time stays fixed at start + 2 sec.</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingHorizontal: 22,
    paddingBottom: 36,
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
    height: 44,
    justifyContent: 'center',
    marginTop: 16,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D2C8',
  },
  window: {
    position: 'absolute',
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E65A3C',
  },
  handle: {
    position: 'absolute',
    width: 22,
    height: 34,
    marginLeft: -11,
    borderWidth: 3,
    borderColor: '#FFFEFB',
    borderRadius: 11,
    backgroundColor: '#171615',
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  markText: {
    color: '#78716C',
    fontSize: 12,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 10,
    color: '#78716C',
    fontSize: 13,
    lineHeight: 19,
  },
  statusText: {
    marginTop: 14,
    color: '#78716C',
    fontSize: 13,
    lineHeight: 19,
  },
});
