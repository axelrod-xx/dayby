import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function ProfileSetupScreen() {
  const router = useRouter();
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
      Alert.alert('Profile setup failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = status === 'signed-in' && displayName.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>Set your name</Text>
        <Text style={styles.copy}>This is how friends will see your 2-second moments.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          autoCapitalize="words"
          maxLength={40}
          onChangeText={setDisplayName}
          placeholder="RYO"
          placeholderTextColor="#A49B91"
          style={styles.input}
          value={displayName}
        />
      </View>

      <PrimaryButton disabled={!canSave} loading={saving} onPress={() => void save()}>
        Continue
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
    color: '#5D7488',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 38,
    fontWeight: '900',
  },
  copy: {
    marginTop: 12,
    color: '#5D6974',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 8,
  },
  label: {
    color: '#5D7488',
    fontSize: 12,
    fontWeight: '800',
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
