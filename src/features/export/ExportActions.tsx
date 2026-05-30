import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { recordGroupActivity } from '@/src/features/groups/groupService';

type ExportActionsProps = {
  groupId: string;
  videoUri?: string | null;
};

export function ExportActions({ groupId, videoUri }: ExportActionsProps) {
  const unavailable = () => {
    Alert.alert('Export is not ready yet', 'The generated MP4 flow is wired next. Your kept clips remain safe.');
  };

  const save = async () => {
    if (!videoUri) {
      unavailable();
      return;
    }

    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to save this memory.');
      return;
    }

    await MediaLibrary.createAssetAsync(videoUri);
    await recordGroupActivity(groupId, 'download');
    Alert.alert('Saved', 'Video saved to your library.');
  };

  const share = async () => {
    if (!videoUri) {
      unavailable();
      return;
    }

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'This device cannot open the share sheet right now.');
      return;
    }

    await Sharing.shareAsync(videoUri);
    await recordGroupActivity(groupId, 'download');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Export</Text>
      <Text style={styles.copy}>Save the clean memory, then choose the sound in the app where you post it.</Text>
      <View style={styles.actions}>
        <PrimaryButton onPress={() => void save()} variant="light">
          Save Video
        </PrimaryButton>
        <PrimaryButton onPress={() => void share()} variant="light">
          Share
        </PrimaryButton>
      </View>
      <View style={styles.pillRow}>
        <Text style={styles.pill}>Original Sound</Text>
        <Text style={styles.pill}>Muted for Reels</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F7FBFF',
  },
  kicker: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  copy: {
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#4E6A80',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#F3F8FC',
  },
});
