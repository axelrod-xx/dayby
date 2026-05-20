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

    if (contentType !== 'video/mp4') {
      return Response.json({ error: 'Only video/mp4 uploads are allowed' }, { status: 400, headers: corsHeaders });
    }

    if (body.sizeBytes && body.sizeBytes > 3_000_000) {
      return Response.json({ error: 'Video is too large for MVP upload target' }, { status: 400, headers: corsHeaders });
    }

    const key = `assets/${user.id}/${crypto.randomUUID()}.mp4`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
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
