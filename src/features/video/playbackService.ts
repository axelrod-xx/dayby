import { env } from '@/src/lib/env';
import { requireSupabase } from '@/src/lib/supabase';

export async function requestPlaybackUrl(r2Key: string): Promise<string | null> {
  if (!env.apiBaseUrl || !r2Key || r2Key.startsWith('local-dev/')) {
    return null;
  }

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session) {
    return null;
  }

  const response = await fetch(`${env.apiBaseUrl}/r2-download-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: r2Key }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { downloadUrl?: string };
  return body.downloadUrl ?? null;
}
