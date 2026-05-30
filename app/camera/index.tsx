import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { type Href, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function CameraScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [muted, setMuted] = useState(false);

  const hasCamera = cameraPermission?.granted;
  const hasMicrophone = muted || microphonePermission?.granted;

  const requestPermissions = async () => {
    const camera = await requestCameraPermission();
    const microphone = muted ? { granted: true } : await requestMicrophonePermission();

    if (!camera.granted || !microphone.granted) {
      Alert.alert(t('camera.permissionTitle'), t('camera.permissionBody'));
    }
  };

  const record = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setIsRecording(true);
      const result = await cameraRef.current.recordAsync({
        maxDuration: 10,
        maxFileSize: 30_000_000,
        codec: Platform.OS === 'ios' ? 'avc1' : undefined,
      });

      if (result?.uri) {
        router.push({ pathname: '/trim', params: { uri: result.uri, muted: muted ? '1' : '0' } } as unknown as Href);
      }
    } catch (error) {
      Alert.alert(t('camera.alert.recordingFailed'), resolveErrorMessage(error, t));
    } finally {
      setIsRecording(false);
    }
  };

  const stop = () => {
    cameraRef.current?.stopRecording();
  };

  if (!hasCamera || !hasMicrophone) {
    return (
      <View style={styles.permission}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.permissionBack}>
          <Text style={styles.backText}>{t('camera.cancel')}</Text>
        </Pressable>
        <View style={styles.permissionHero}>
          <Text style={styles.permissionKicker}>{t('camera.kicker')}</Text>
          <Text style={styles.title}>{t('camera.title')}</Text>
          <Text style={styles.copy}>{t('camera.copy')}</Text>
        </View>
        <View style={styles.permissionActions}>
          <PrimaryButton onPress={() => void requestPermissions()} variant="accent">
            {t('camera.allowCamera')}
          </PrimaryButton>
        </View>
        <Pressable onPress={() => setMuted((current) => !current)}>
          <Text style={styles.muteText}>{muted ? t('camera.mutedSelected') : t('camera.recordWithSound')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} mode="video" mute={muted} style={styles.camera} videoQuality="720p" />
      <View style={styles.topBar}>
        <Pressable disabled={isRecording} onPress={() => router.back()} hitSlop={12} style={styles.cancelButton}>
          <Text style={[styles.cancelText, isRecording && styles.cancelTextDisabled]}>{t('camera.cancel')}</Text>
        </Pressable>
        <Pressable onPress={() => setMuted((current) => !current)} style={styles.muteButton}>
          <Text style={styles.muteButtonText}>{muted ? t('common.muted') : t('common.sound')}</Text>
        </Pressable>
      </View>
      <View style={styles.overlay}>
        <View>
          <Text style={styles.captureTitle}>{isRecording ? t('camera.recording') : t('camera.today')}</Text>
          <Text style={styles.captureCopy}>{t('camera.captureCopy')}</Text>
        </View>
      </View>
      {isRecording ? (
        <View style={styles.recordingPill}>
          <View style={styles.liveDot} />
          <Text style={styles.recordingText}>{t('camera.maxSeconds')}</Text>
        </View>
      ) : null}
      <View pointerEvents={Platform.OS === 'web' ? undefined : 'none'} style={styles.formatGuide}>
        <View style={styles.formatCornerTopLeft} />
        <View style={styles.formatCornerTopRight} />
        <View style={styles.formatCornerBottomLeft} />
        <View style={styles.formatCornerBottomRight} />
      </View>
      <View style={styles.controls}>
        <Pressable onPress={isRecording ? stop : () => void record()} style={styles.recordButton}>
          <View style={[styles.recordDot, isRecording && styles.recordingDot]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permission: {
    flex: 1,
    gap: 22,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: 54,
    backgroundColor: '#102033',
  },
  permissionHero: {
    minHeight: 260,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#1B3458',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  permissionKicker: {
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 10,
    color: '#B8C9DA',
    fontSize: 16,
    lineHeight: 24,
  },
  permissionActions: {
    gap: 10,
  },
  muteText: {
    color: '#B8C9DA',
    fontSize: 15,
    textAlign: 'center',
  },
  permissionBack: {
    position: 'absolute',
    left: 22,
    top: 70,
    paddingVertical: 6,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    backgroundColor: '#0E0D0C',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelTextDisabled: {
    opacity: 0.36,
  },
  overlay: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 124,
  },
  captureTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  captureCopy: {
    marginTop: 4,
    color: '#C8DCEE',
    fontSize: 14,
  },
  muteButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  muteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  controls: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingPill: {
    position: 'absolute',
    left: 22,
    bottom: 142,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F80ED',
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  formatGuide: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 144,
    bottom: 148,
    borderRadius: 16,
  },
  formatCornerTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,254,251,0.46)',
  },
  formatCornerTopRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,254,251,0.46)',
  },
  formatCornerBottomLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,254,251,0.46)',
  },
  formatCornerBottomRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,254,251,0.46)',
  },
  recordButton: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 41,
  },
  recordDot: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E5484D',
  },
  recordingDot: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
});
