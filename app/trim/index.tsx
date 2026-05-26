import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { trimToTwoSeconds, type TwoSecondTrimResult } from '@/src/features/video/videoProcessingService';

const maxStartMs = 8000;
const selectedDurationMs = 2000;
const timelineMarks = [0, 2000, 4000, 6000, 8000, 10000];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatSeconds = (valueMs: number) => `${(valueMs / 1000).toFixed(1)}s`;
const normalizeStartMs = (startMs: number) => clamp(Math.round(startMs / 100) * 100, 0, maxStartMs);

export default function TrimScreen() {
  const { uri, muted } = useLocalSearchParams<{ uri?: string; muted?: string }>();
  const router = useRouter();
  const [selectedStartMs, setSelectedStartMs] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [trimResult, setTrimResult] = useState<TwoSecondTrimResult | null>(null);
  const dragStartMsRef = useRef(0);
  const player = useVideoPlayer(uri ?? '', (instance) => {
    instance.loop = false;
    instance.muted = muted === '1';
    instance.timeUpdateEventInterval = 0.05;
    void instance.play();
  });
  const selectedStartSeconds = selectedStartMs / 1000;
  const selectedEndSeconds = (selectedStartMs + selectedDurationMs) / 1000;

  const selectStart = (startMs: number) => {
    setSelectedStartMs(normalizeStartMs(startMs));
    setTrimResult(null);
  };

  const startFromTrackX = (x: number) => {
    if (!trackWidth) {
      return 0;
    }

    const pointerMs = (clamp(x, 0, trackWidth) / trackWidth) * 10000;
    return normalizeStartMs(pointerMs - selectedDurationMs / 2);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: (event) => {
          const nextStartMs = startFromTrackX(event.nativeEvent.locationX);
          dragStartMsRef.current = nextStartMs;
          selectStart(nextStartMs);
        },
        onPanResponderMove: (_, gesture) => {
          if (!trackWidth) {
            return;
          }

          selectStart(dragStartMsRef.current + (gesture.dx / trackWidth) * 10000);
        },
      }),
    [trackWidth],
  );

  useEffect(() => {
    if (!uri) {
      return;
    }

    player.currentTime = selectedStartSeconds;
    player.play();
  }, [player, selectedStartSeconds, uri]);

  useEffect(() => {
    if (!uri) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (player.currentTime >= selectedEndSeconds - 0.04 || player.currentTime < selectedStartSeconds) {
        player.currentTime = selectedStartSeconds;
        player.play();
      }
    }, 80);

    return () => clearInterval(interval);
  }, [player, selectedEndSeconds, selectedStartSeconds, uri]);

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
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>Retake</Text>
          </Pressable>
        </View>
        <Text style={styles.kicker}>Trim</Text>
        <Text style={styles.title}>Keep 2 sec</Text>
        <Text style={styles.copy}>Move the window until the loop feels right.</Text>
      </View>

      <View style={styles.previewWrap}>
        {uri ? (
          <VideoView contentFit="cover" nativeControls={false} player={player} style={styles.preview} />
        ) : (
          <View style={styles.preview} />
        )}
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>
            Previewing {formatSeconds(selectedStartMs)} - {formatSeconds(selectedStartMs + selectedDurationMs)}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Selected</Text>
        <Text style={styles.panelText}>
          {formatSeconds(selectedStartMs)} - {formatSeconds(selectedStartMs + selectedDurationMs)} /{' '}
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
        <Text style={styles.helperText}>Drag the highlighted window. The preview loops only this 2-second part.</Text>
        <Text style={styles.statusText}>
          {trimResult?.isNativeTrimmed
            ? '2-second file ready'
            : trimResult
              ? 'Dev preview ready. Upload stays blocked until native trim is enabled.'
              : 'Not processed yet'}
        </Text>
      </View>

      <View style={styles.actionStack}>
        <PrimaryButton disabled={!uri} loading={processing} onPress={() => void processClip()} variant="light">
          Use this 2 sec
        </PrimaryButton>
        <PrimaryButton disabled={!uri || !trimResult} onPress={continueToPost} variant="accent">
          Choose groups
        </PrimaryButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 72,
    backgroundColor: '#102033',
  },
  kicker: {
    marginBottom: 10,
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
  },
  copy: {
    marginTop: 10,
    color: '#B8C9DA',
    fontSize: 16,
    lineHeight: 23,
  },
  topBar: {
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#B8C9DA',
    fontSize: 15,
    fontWeight: '800',
  },
  previewWrap: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 390,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#102033',
  },
  preview: {
    flex: 1,
    backgroundColor: '#102033',
  },
  previewBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(20, 19, 18, 0.74)',
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  panel: {
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.14)',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'rgba(255,254,251,0.06)',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  panelText: {
    marginTop: 8,
    color: '#B8C9DA',
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
    backgroundColor: 'rgba(255,254,251,0.22)',
  },
  window: {
    position: 'absolute',
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2F80ED',
  },
  handle: {
    position: 'absolute',
    width: 22,
    height: 34,
    marginLeft: -11,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  markText: {
    color: '#BDB5AA',
    fontSize: 12,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 10,
    color: '#BDB5AA',
    fontSize: 13,
    lineHeight: 19,
  },
  statusText: {
    marginTop: 14,
    color: '#BDB5AA',
    fontSize: 13,
    lineHeight: 19,
  },
  actionStack: {
    gap: 10,
  },
});
