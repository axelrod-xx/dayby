import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile, status, upsertProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  const save = async () => {
    try {
      setSaving(true);
      await upsertProfile({ displayName });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('profile.alert.setupFailed'), resolveErrorMessage(error, t));
    } finally {
      setSaving(false);
    }
  };

  const canSave = status === 'signed-in' && displayName.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('profile.kicker')}</Text>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <Text style={styles.copy}>{t('profile.copy')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('profile.displayName')}</Text>
        <TextInput
          autoCapitalize="words"
          maxLength={40}
          onChangeText={setDisplayName}
          placeholder="RYO"
          placeholderTextColor="#8FAFC2"
          style={styles.input}
          value={displayName}
        />
      </View>

      <PrimaryButton disabled={!canSave} loading={saving} onPress={() => void save()}>
        {t('profile.continue')}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 22,
    paddingTop: 82,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 164,
    justifyContent: 'flex-end',
  },
  kicker: {
    marginBottom: 10,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 8,
  },
  label: {
    color: '#4E6A80',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#102033',
    fontSize: 18,
    backgroundColor: '#FFFFFF',
  },
});
