import { env } from '@/src/lib/env';
import { requireSupabase } from '@/src/lib/supabase';

type SignedUploadResponse = {
  key: string;
  uploadUrl: string;
  expiresIn: number;
};

export async function requestSignedVideoUpload(input: {
  contentType: 'video/mp4';
  sizeBytes?: number;
}): Promise<SignedUploadResponse> {
  if (!env.apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required before uploading videos.');
  }

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session) {
    throw new Error('You need to sign in before uploading.');
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
    throw new Error(errorBody?.error ?? 'Could not create upload URL.');
  }

  return (await response.json()) as SignedUploadResponse;
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
    throw new Error('Video upload failed.');
  }
}
