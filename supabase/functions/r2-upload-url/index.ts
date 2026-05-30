import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.758.0';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3.758.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

type RequestBody = {
  contentType?: string;
  sizeBytes?: number;
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
const MAX_UPLOAD_BYTES = 3_000_000;
const MAX_DAILY_UPLOAD_URLS = 80;

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
    const contentType = body.contentType ?? 'video/mp4';
    const sizeBytes = body.sizeBytes;

    if (contentType !== 'video/mp4') {
      return Response.json({ error: 'Only video/mp4 uploads are allowed' }, { status: 400, headers: corsHeaders });
    }

    if (typeof sizeBytes !== 'number' || !Number.isInteger(sizeBytes) || sizeBytes <= 0) {
      return Response.json({ error: 'Video size is required before upload' }, { status: 400, headers: corsHeaders });
    }

    if (sizeBytes > MAX_UPLOAD_BYTES) {
      return Response.json({ error: 'Video is too large for MVP upload target' }, { status: 400, headers: corsHeaders });
    }

    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { count, error: countError } = await supabase
      .from('upload_url_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);

    if (countError) {
      return Response.json({ error: 'Could not check upload rate limit' }, { status: 500, headers: corsHeaders });
    }

    if ((count ?? 0) >= MAX_DAILY_UPLOAD_URLS) {
      return Response.json({ error: 'Daily upload limit reached' }, { status: 429, headers: corsHeaders });
    }

    const { error: logError } = await supabase.from('upload_url_requests').insert({
      size_bytes: sizeBytes,
      user_id: user.id,
    });

    if (logError) {
      return Response.json({ error: 'Could not record upload request' }, { status: 500, headers: corsHeaders });
    }

    const key = `assets/${user.id}/${crypto.randomUUID()}.mp4`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });

    return Response.json(
      {
        key,
        uploadUrl,
        expiresIn: 60,
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
