import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { requestPlaybackUrls } from '@/src/features/video/playbackService';
import { I18nError, resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

type ExportActionsProps = {
  groupId: string;
  r2Keys?: Array<string | null | undefined>;
  sourceUris?: Array<string | null | undefined>;
  videoUri?: string | null;
};

const normalizeFileUri = (path: string) => {
  if (path.startsWith('file://') || path.startsWith('content://') || path.startsWith('http')) {
    return path;
  }

  return `file://${path}`;
};

const downloadRemoteSource = async (uri: string, index: number) => {
  if (!uri.startsWith('http')) {
    return uri;
  }

  const cacheDirectory = FileSystem.cacheDirectory;

  if (!cacheDirectory) {
    throw new I18nError('export.error.noCacheDir');
  }

  const target = `${cacheDirectory}dayby-export-${Date.now()}-${index}.mp4`;
  const downloaded = await FileSystem.downloadAsync(uri, target);
  return downloaded.uri;
};

export function ExportActions({ groupId, r2Keys = [], sourceUris = [], videoUri }: ExportActionsProps) {
  const { t } = useI18n();
  const [generatedUri, setGeneratedUri] = useState<string | null>(videoUri ?? null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const keys = useMemo(() => r2Keys.filter((key): key is string => Boolean(key)), [r2Keys]);
  const sources = useMemo(
    () => (videoUri ? [videoUri] : sourceUris.filter((source): source is string => Boolean(source))),
    [sourceUris, videoUri],
  );
  const sourceCount = videoUri ? 1 : keys.length || sources.length;

  const unavailable = () => {
    Alert.alert(
      t('export.unavailableTitle'),
      sourceCount === 0
        ? t('export.unavailableNoSources')
        : t('export.unavailableNative'),
    );
  };

  const resolveSources = async () => {
    if (videoUri) {
      return [videoUri];
    }

    if (keys.length === 0) {
      return sources;
    }

    const playbackUrls = await requestPlaybackUrls(keys);
    return keys.map((key) => playbackUrls.get(key)).filter((source): source is string => Boolean(source));
  };

  const prepareVideo = async () => {
    if (generatedUri) {
      return generatedUri;
    }

    if (Platform.OS === 'web' || sourceCount === 0) {
      unavailable();
      return null;
    }

    const remoteOrLocalSources = await resolveSources();
    if (remoteOrLocalSources.length === 0) {
      unavailable();
      return null;
    }

    const localSources = await Promise.all(remoteOrLocalSources.map(downloadRemoteSource));
    const videoTrim = await import('react-native-video-trim');
    const output =
      localSources.length === 1
        ? await videoTrim.compress(localSources[0], {
            bitrate: 1_200_000,
            frameRate: 30,
            outputExt: 'mp4',
            width: 720,
          })
        : await videoTrim.merge(localSources, { outputExt: 'mp4' });
    const nextUri = normalizeFileUri(output.outputPath);
    setGeneratedUri(nextUri);
    return nextUri;
  };

  const save = async () => {
    try {
      setSaving(true);
      const uri = await prepareVideo();

      if (!uri) {
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('export.permissionTitle'), t('export.permissionBody'));
        return;
      }

      await MediaLibrary.createAssetAsync(uri);
      await recordGroupActivity(groupId, 'download');
      Alert.alert(t('export.savedTitle'), t('export.savedBody'));
    } catch (error) {
      Alert.alert(t('export.failedTitle'), resolveErrorMessage(error, t));
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    try {
      setSharing(true);
      const uri = await prepareVideo();

      if (!uri) {
        return;
      }

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(t('export.sharingUnavailableTitle'), t('export.sharingUnavailableBody'));
        return;
      }

      await Sharing.shareAsync(uri);
      await recordGroupActivity(groupId, 'download');
    } catch (error) {
      Alert.alert(t('export.shareFailedTitle'), resolveErrorMessage(error, t));
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{t('export.kicker')}</Text>
      <Text style={styles.copy}>
        {sourceCount > 0
          ? t('export.copy.ready', { clips: t('common.count.clips', { count: sourceCount }) })
          : t('export.copy.empty')}
      </Text>
      <View style={styles.actions}>
        <PrimaryButton loading={saving} onPress={() => void save()} variant="light">
          {t('export.saveVideo')}
        </PrimaryButton>
        <PrimaryButton loading={sharing} onPress={() => void share()} variant="light">
          {t('export.share')}
        </PrimaryButton>
      </View>
      <View style={styles.pillRow}>
        <Text style={styles.pill}>{generatedUri ? t('export.mp4Ready') : t('export.cleanMp4')}</Text>
        <Text style={styles.pill}>{t('export.addMusicLater')}</Text>
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
