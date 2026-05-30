import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { LanguageSwitcher } from '@/src/features/i18n/LanguageSwitcher';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useI18n();
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
      Alert.alert(t('auth.alert.signInFailed'), resolveErrorMessage(error, t));
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
      Alert.alert(t('auth.alert.devSignInFailed'), resolveErrorMessage(error, t));
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <View style={styles.header}>
        <Text style={styles.wordmark}>dayby</Text>
        <Text style={styles.copy}>{t('auth.copy')}</Text>
        <Text style={styles.subcopy}>{t('auth.subcopy')}</Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('auth.supabaseNoticeTitle')}</Text>
          <Text style={styles.noticeText}>
            {t('auth.supabaseNoticeCopy')}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <LanguageSwitcher />
        <PrimaryButton
          disabled={!isSupabaseConfigured}
          loading={loadingProvider === 'apple'}
          onPress={() => void run('apple')}
          variant="light">
          {t('auth.continueApple')}
        </PrimaryButton>
        <PrimaryButton
          disabled={!isSupabaseConfigured}
          loading={loadingProvider === 'google'}
          onPress={() => void run('google')}
          variant="light">
          {t('auth.continueGoogle')}
        </PrimaryButton>

        {isDevAuthEnabled ? (
          <View style={styles.devPanel}>
            <Pressable onPress={() => setShowDevForm((current) => !current)}>
              <Text style={styles.devToggle}>{showDevForm ? t('auth.hideDevLogin') : t('auth.useDevLogin')}</Text>
            </Pressable>
            {showDevForm ? (
              <View style={styles.devForm}>
                <TextInput
                  autoCapitalize="none"
                  inputMode="email"
                  onChangeText={setEmail}
                  placeholder="dev@dayby.app"
                  placeholderTextColor="#8FAFC2"
                  style={styles.input}
                  value={email}
                />
                <TextInput
                  onChangeText={setPassword}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor="#8FAFC2"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
                <PrimaryButton
                  disabled={!isSupabaseConfigured || !email.trim() || password.length < 6}
                  loading={loadingProvider === 'dev'}
                  onPress={() => void runDev()}
                  variant="light">
                  {t('auth.continueTesting')}
                </PrimaryButton>
                <Text style={styles.devHint}>{t('auth.testAccount')}</Text>
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
    backgroundColor: '#F6FAFF',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    backgroundColor: '#E3F1FF',
  },
  header: {
    gap: 14,
    width: '100%',
    maxWidth: 340,
  },
  wordmark: {
    color: '#102033',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  copy: {
    color: '#102033',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  subcopy: {
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  notice: {
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,253,248,0.92)',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  noticeTitle: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '700',
  },
  noticeText: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    width: 300,
    alignSelf: 'center',
    gap: 12,
  },
  devPanel: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,26,23,0.14)',
    paddingTop: 16,
  },
  devToggle: {
    color: '#2F80ED',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
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
    borderColor: '#B8C9DA',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: '#102033',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  devHint: {
    color: '#4E6A80',
    fontSize: 12,
    textAlign: 'center',
  },
});
