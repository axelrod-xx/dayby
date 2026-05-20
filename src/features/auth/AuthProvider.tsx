import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { env, envStatus } from '@/src/lib/env';
import { requireSupabase, supabase } from '@/src/lib/supabase';

import type { Profile } from './types';

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'checking' | 'signed-out' | 'signed-in' | 'missing-config';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isProfileComplete: boolean;
  isSupabaseConfigured: boolean;
  isDevAuthEnabled: boolean;
  refreshProfile: () => Promise<void>;
  signInWithEmailForDev: (input: { email: string; password: string }) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  upsertProfile: (input: { displayName: string; avatarUrl?: string | null }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const redirectTo = AuthSession.makeRedirectUri({
  scheme: 'dayby',
  path: 'auth/callback',
});

async function completeOAuth(url: string) {
  const client = requireSupabase();
  const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);

  if (result.type !== 'success') {
    return;
  }

  const parsed = Linking.parse(result.url);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;

  if (!code) {
    throw new Error('OAuth completed without a session code.');
  }

  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    throw error;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>(envStatus.hasSupabase ? 'checking' : 'missing-config');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = async () => {
    if (!supabase) {
      setProfile(null);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();

    if (error) {
      throw error;
    }

    setProfile(data as Profile | null);
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setStatus(data.session ? 'signed-in' : 'signed-out');
      if (data.session) {
        void refreshProfile().catch((error) => Alert.alert('Profile error', error.message));
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? 'signed-in' : 'signed-out');
      if (nextSession) {
        void refreshProfile().catch((error) => Alert.alert('Profile error', error.message));
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      isProfileComplete: Boolean(profile?.display_name),
      isSupabaseConfigured: envStatus.hasSupabase,
      isDevAuthEnabled: env.enableDevAuth,
      refreshProfile,
      signInWithEmailForDev: async ({ email, password }) => {
        if (!env.enableDevAuth) {
          throw new Error('Development email sign-in is disabled.');
        }

        const client = requireSupabase();
        const normalizedEmail = email.trim().toLowerCase();
        const { error: signInError } = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!signInError) {
          return;
        }

        const { error: signUpError } = await client.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }
      },
      signInWithApple: async () => {
        if (Platform.OS === 'ios') {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          if (!credential.identityToken) {
            throw new Error('Apple did not return an identity token.');
          }

          const { error } = await requireSupabase().auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) {
            throw error;
          }

          return;
        }

        const { data, error } = await requireSupabase().auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          throw error;
        }

        if (data.url) {
          await completeOAuth(data.url);
        }
      },
      signInWithGoogle: async () => {
        const { data, error } = await requireSupabase().auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          throw error;
        }

        if (data.url) {
          await completeOAuth(data.url);
        }
      },
      signOut: async () => {
        const { error } = await requireSupabase().auth.signOut();
        if (error) {
          throw error;
        }
      },
      upsertProfile: async ({ displayName, avatarUrl }) => {
        const client = requireSupabase();
        const {
          data: { user },
        } = await client.auth.getUser();

        if (!user) {
          throw new Error('You need to sign in before setting up a profile.');
        }

        const { error } = await client.from('users').upsert({
          id: user.id,
          display_name: displayName.trim(),
          avatar_url: avatarUrl ?? null,
          timezone: getTimezone(),
        });

        if (error) {
          throw error;
        }

        await refreshProfile();
      },
    }),
    [profile, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
