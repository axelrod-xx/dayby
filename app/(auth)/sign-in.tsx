import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function SignInScreen() {
  const router = useRouter();
  const { isDevAuthEnabled, isSupabaseConfigured, signInWithApple, signInWithEmailForDev, signInWithGoogle } =
    useAuth();
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | 'dev' | null>(null);
  const [showDevForm, setShowDevForm] = useState(false);
  const [email, setEmail] = useState('dev@dayby.app');
  const [password, setPassword] = useState('dayby-dev-password');

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

  const runDev = async () => {
    try {
      setLoadingProvider('dev');
      await signInWithEmailForDev({ email, password });
      router.replace('/profile-setup');
    } catch (error) {
      Alert.alert('Dev sign in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <View style={styles.header}>
        <Text style={styles.wordmark}>dayby</Text>
        <Text style={styles.copy}>Two seconds a day.{'\n'}One minute a month.</Text>
        <Text style={styles.subcopy}>Start with the people you actually want to remember this with.</Text>
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
          onPress={() => void run('apple')}
          variant="light">
          Continue with Apple
        </PrimaryButton>
        <PrimaryButton
          disabled={!isSupabaseConfigured}
          loading={loadingProvider === 'google'}
          onPress={() => void run('google')}
          variant="light">
          Continue with Google
        </PrimaryButton>

        {isDevAuthEnabled ? (
          <View style={styles.devPanel}>
            <Pressable onPress={() => setShowDevForm((current) => !current)}>
              <Text style={styles.devToggle}>{showDevForm ? 'Hide dev login' : 'Use dev login'}</Text>
            </Pressable>
            {showDevForm ? (
              <View style={styles.devForm}>
                <TextInput
                  autoCapitalize="none"
                  inputMode="email"
                  onChangeText={setEmail}
                  placeholder="dev@dayby.app"
                  placeholderTextColor="#A49B91"
                  style={styles.input}
                  value={email}
                />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="password"
                  placeholderTextColor="#A49B91"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
                <PrimaryButton
                  disabled={!isSupabaseConfigured || !email.trim() || password.length < 6}
                  loading={loadingProvider === 'dev'}
                  onPress={() => void runDev()}
                  variant="light">
                  Continue for testing
                </PrimaryButton>
                <Text style={styles.devHint}>Test account: dev@dayby.app</Text>
              </View>
            ) : null}
          </View>
        ) : null}
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
    backgroundColor: '#171615',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    backgroundColor: '#222B25',
  },
  header: {
    gap: 14,
    width: '100%',
    maxWidth: 340,
  },
  wordmark: {
    color: '#FFFEFB',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  copy: {
    color: '#FFFEFB',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subcopy: {
    color: '#D8D2C8',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  notice: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'rgba(255,253,248,0.92)',
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
    width: 300,
    alignSelf: 'flex-start',
    marginLeft: 23,
    gap: 12,
  },
  devPanel: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,254,251,0.2)',
    paddingTop: 16,
  },
  devToggle: {
    color: '#D8D2C8',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  devForm: {
    gap: 10,
    marginTop: 14,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#171615',
    fontSize: 16,
    backgroundColor: '#FFFEFB',
  },
  devHint: {
    color: '#D8D2C8',
    fontSize: 12,
    textAlign: 'center',
  },
});
