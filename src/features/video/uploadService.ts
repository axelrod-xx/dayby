import { env } from '@/src/lib/env';
import { I18nError } from '@/src/lib/i18n/errors';
import { requireSupabase } from '@/src/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

type SignedUploadResponse = {
  key: string;
  uploadUrl: string;
  expiresIn: number;
};

export async function requestSignedVideoUpload(input: {
  contentType: 'video/mp4';
  sizeBytes: number;
}): Promise<SignedUploadResponse> {
  if (!env.apiBaseUrl) {
    throw new I18nError('upload.error.missingApiBase');
  }

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session) {
    throw new I18nError('upload.error.signInRequired');
  }

  const response = await fetch(`${env.apiBaseUrl}/r2-upload-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new I18nError(errorBody?.error ? 'common.unexpectedError' : 'upload.error.createUrl');
  }

  return (await response.json()) as SignedUploadResponse;
}

export async function getLocalVideoFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new I18nError('upload.error.missingFile');
  }

  if (typeof info.size !== 'number' || !Number.isFinite(info.size)) {
    throw new I18nError('upload.error.sizeUnknown');
  }

  return info.size;
}

export async function uploadVideoToSignedUrl(input: {
  uploadUrl: string;
  uri: string;
  contentType: 'video/mp4';
}) {
  const file = await fetch(input.uri);
  const blob = await file.blob();
  const response = await fetch(input.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': input.contentType,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new I18nError('upload.error.failedStatus', { status: response.status });
  }
}
