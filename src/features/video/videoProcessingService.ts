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

  return devFallback(input.uri, trimStartMs);
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
