import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { PrimaryButton } from '@/src/components/PrimaryButton';

export default function TrimScreen() {
  const { uri, muted } = useLocalSearchParams<{ uri?: string; muted?: string }>();
  const router = useRouter();
  const [selectedStart] = useState(0);
  const player = useVideoPlayer(uri ?? '', (instance) => {
    instance.loop = true;
    instance.muted = muted === '1';
    void instance.play();
  });

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Keep 2 sec</Text>
        <Text style={styles.copy}>MVP placeholder: native trimming comes next. The original 10 sec still stays local.</Text>
      </View>

      {uri ? <VideoView player={player} style={styles.preview} /> : <View style={styles.preview} />}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Selected</Text>
        <Text style={styles.panelText}>
          {selectedStart.toFixed(1)}s - {(selectedStart + 2).toFixed(1)}s · {muted === '1' ? 'Muted' : 'Original sound'}
        </Text>
      </View>

      <PrimaryButton
        disabled={!uri}
        onPress={() =>
          router.push({ pathname: '/post', params: { uri: uri ?? '', muted: muted ?? '0' } } as unknown as Href)
        }>
        Choose groups
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 22,
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
    maxHeight: 440,
    borderRadius: 8,
    backgroundColor: '#171615',
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
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
});
