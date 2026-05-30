import { env } from '@/src/lib/env';
import { requireSupabase } from '@/src/lib/supabase';

type SignedPlaybackResponse = {
  downloadUrl?: string;
  downloadUrls?: Record<string, string | null>;
};

export async function requestPlaybackUrls(r2Keys: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>(r2Keys.map((key) => [key, null]));
  const keys = Array.from(new Set(r2Keys.filter((key) => key && !key.startsWith('local-dev/'))));

  if (!env.apiBaseUrl || keys.length === 0) {
    return result;
  }

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session) {
    return result;
  }

  const response = await fetch(`${env.apiBaseUrl}/r2-download-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys }),
  });

  if (!response.ok) {
    return result;
  }

  const body = (await response.json()) as SignedPlaybackResponse;
  const urls = body.downloadUrls ?? {};

  for (const key of keys) {
    result.set(key, urls[key] ?? null);
  }

  return result;
}

export async function requestPlaybackUrl(r2Key: string): Promise<string | null> {
  const urls = await requestPlaybackUrls([r2Key]);
  return urls.get(r2Key) ?? null;
}
