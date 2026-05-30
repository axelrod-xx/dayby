import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { joinGroupWithCode } from '@/src/features/groups/groupService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const join = async () => {
    try {
      setJoining(true);
      const groupId = await joinGroupWithCode(code);
      router.replace({ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href);
    } catch (error) {
      Alert.alert(t('groupJoin.alert.failed'), resolveErrorMessage(error, t, 'groupJoin.error.checkCode'));
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('groupJoin.kicker')}</Text>
        <Text style={styles.title}>{t('groupJoin.title')}</Text>
        <Text style={styles.copy}>{t('groupJoin.copy')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('groupJoin.codeLabel')}</Text>
        <TextInput
          autoCapitalize="characters"
          maxLength={12}
          onChangeText={(value) => setCode(value.toUpperCase())}
          placeholder={t('groupJoin.codePlaceholder')}
          placeholderTextColor="#8FAFC2"
          style={styles.input}
          value={code}
        />
      </View>

      <PrimaryButton disabled={code.trim().length < 4} loading={joining} onPress={() => void join()}>
        {t('groupJoin.joinFriends')}
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
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
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
    fontSize: 20,
    letterSpacing: 0,
    backgroundColor: '#FFFFFF',
  },
});
