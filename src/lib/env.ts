export type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  apiBaseUrl: string;
};

const readOptional = (value: string | undefined) => value?.trim() ?? '';

export const env: PublicEnv = {
  supabaseUrl: readOptional(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: readOptional(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  apiBaseUrl: readOptional(process.env.EXPO_PUBLIC_API_BASE_URL),
};

export const envStatus = {
  hasSupabase: Boolean(env.supabaseUrl && env.supabasePublishableKey),
  hasApiBaseUrl: Boolean(env.apiBaseUrl),
};
