import { S3Client, GetObjectCommand } from 'npm:@aws-sdk/client-s3@3.758.0';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3.758.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

type RequestBody = {
  key?: string;
  keys?: string[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const readEnv = (name: string) => {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const accountId = readEnv('R2_ACCOUNT_ID');
const bucket = readEnv('R2_BUCKET');
const supabaseUrl = readEnv('SUPABASE_URL');
const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY');
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: readEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: readEnv('R2_SECRET_ACCESS_KEY'),
  },
});
const MAX_KEYS_PER_REQUEST = 50;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Missing authorization' }, { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: 'Invalid authorization' }, { status: 401, headers: corsHeaders });
    }

    const body = (await request.json()) as RequestBody;
    const requestedKeys = Array.from(
      new Set(Array.isArray(body.keys) ? body.keys : body.key ? [body.key] : []),
    );

    if (requestedKeys.length === 0 || requestedKeys.length > MAX_KEYS_PER_REQUEST) {
      return Response.json({ error: 'Invalid key count' }, { status: 400, headers: corsHeaders });
    }

    if (requestedKeys.some((key) => !key.startsWith('assets/'))) {
      return Response.json({ error: 'Invalid key' }, { status: 400, headers: corsHeaders });
    }

    const { data: assets, error: assetError } = await supabase
      .from('video_assets')
      .select('r2_key')
      .in('r2_key', requestedKeys);

    if (assetError) {
      return Response.json({ error: 'Asset not found or not allowed' }, { status: 403, headers: corsHeaders });
    }

    const allowedKeys = new Set((assets ?? []).map((asset) => asset.r2_key as string));
    const downloadUrls = Object.fromEntries(
      await Promise.all(
        requestedKeys.map(async (key) => {
          if (!allowedKeys.has(key)) {
            return [key, null] as const;
          }

          const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          });
          const downloadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
          return [key, downloadUrl] as const;
        }),
      ),
    );

    const singleKey = body.key && !Array.isArray(body.keys);

    return Response.json(
      {
        downloadUrl: singleKey ? downloadUrls[body.key] : undefined,
        downloadUrls,
        expiresIn: 300,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500, headers: corsHeaders },
    );
  }
});
