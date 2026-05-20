import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function SignInScreen() {
  const router = useRouter();
  const { isSupabaseConfigured, signInWithApple, signInWithGoogle } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | null>(null);

  const run = async (provider: 'apple' | 'google') => {
    try {
      setLoadingProvider(provider);
      if (provider === 'apple') {
        await signInWithApple();
      } else {
        await signInWithGoogle();
      }
      router.replace('/profile-setup');
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>dayby</Text>
        <Text style={styles.copy}>Your group keeps one moment from each day.</Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Supabase setup needed</Text>
          <Text style={styles.noticeText}>
            Add your Supabase URL and publishable key to `.env.local` to enable sign in.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          disabled={!isSupabaseConfigured}
          loading={loadingProvider === 'apple'}
          onPress={() => void run('apple')}>
          Continue with Apple
        </PrimaryButton>
        <PrimaryButton
          disabled={!isSupabaseConfigured}
          loading={loadingProvider === 'google'}
          onPress={() => void run('google')}
          variant="light">
          Continue with Google
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 92,
    backgroundColor: '#FFFEFB',
  },
  header: {
    gap: 14,
  },
  wordmark: {
    color: '#171615',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 0,
  },
  copy: {
    color: '#57534E',
    fontSize: 20,
    lineHeight: 28,
  },
  notice: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  noticeTitle: {
    color: '#171615',
    fontSize: 16,
    fontWeight: '700',
  },
  noticeText: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});
