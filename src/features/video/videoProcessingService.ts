import { Platform } from 'react-native';

import { env } from '@/src/lib/env';

export type TwoSecondTrimResult = {
  uri: string;
  trimStartMs: number;
  trimDurationMs: number;
  isNativeTrimmed: boolean;
  processedAt: string | null;
};

export type TwoSecondTrimInput = {
  uri: string;
  startMs: number;
  muted: boolean;
};

const TWO_SECONDS_MS = 2000;

export async function trimToTwoSeconds(input: TwoSecondTrimInput): Promise<TwoSecondTrimResult> {
  const trimStartMs = Math.max(0, Math.round(input.startMs));

  if (!input.uri) {
    throw new Error('No video to trim.');
  }

  if (Platform.OS === 'web') {
    return devFallback(input.uri, trimStartMs);
  }

  try {
    const videoTrim = await import('react-native-video-trim');
    const validation = await videoTrim.isValidFile(input.uri);

    if (!validation.isValid) {
      throw new Error('The recorded file is not a valid video.');
    }

    const endTime = Math.min(trimStartMs + TWO_SECONDS_MS, validation.duration);
    if (endTime - trimStartMs < 1500) {
      throw new Error('The selected moment is too short. Record again and keep 2 seconds.');
    }

    const trimmed = await videoTrim.trim(input.uri, {
      endTime,
      enablePreciseTrimming: true,
      outputExt: 'mp4',
      removeAudio: input.muted,
      startTime: trimStartMs,
    });

    if (!trimmed.success || !trimmed.outputPath) {
      throw new Error('The video could not be trimmed.');
    }

    const compressed = await videoTrim.compress(trimmed.outputPath, {
      bitrate: 1_200_000,
      frameRate: 30,
      outputExt: 'mp4',
      removeAudio: input.muted,
      width: 720,
    });

    await videoTrim.deleteFile(trimmed.outputPath).catch(() => false);

    return {
      uri: normalizeFileUri(compressed.outputPath || trimmed.outputPath),
      trimStartMs,
      trimDurationMs: Math.round(trimmed.duration || endTime - trimStartMs),
      isNativeTrimmed: true,
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Native trim unavailable, using dev fallback.', error);
      return devFallback(input.uri, trimStartMs);
    }

    throw error;
  }
}

function normalizeFileUri(path: string) {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }

  return `file://${path}`;
}

function devFallback(uri: string, trimStartMs: number): TwoSecondTrimResult {
  if (!__DEV__ && env.enableR2Uploads) {
    throw new Error('Native 2-second trimming must be enabled before uploads.');
  }

  return {
    uri,
    trimStartMs,
    trimDurationMs: TWO_SECONDS_MS,
    isNativeTrimmed: false,
    processedAt: null,
  };
}

export function assertTwoSecondUploadReady(input: Pick<TwoSecondTrimResult, 'isNativeTrimmed' | 'trimDurationMs'>) {
  if (input.trimDurationMs < 1500 || input.trimDurationMs > 2500) {
    throw new Error('dayby only uploads the selected 2 seconds.');
  }

  if (!input.isNativeTrimmed && env.enableR2Uploads) {
    throw new Error('Uploads are blocked until native 2-second trimming is active.');
  }
}
